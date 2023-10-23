import { loadConfig as config } from './config'
import { countVideosSyncedAfter, getAllChannels, getAllReferredChannels } from './dynamodb'
import {
  createYppContacts,
  getAllYppContacts,
  mapDynamoItemToContactFields,
  mapReferrerToContactFields,
  updateYppContacts,
} from './hubspot'
import { ChannelYppStatus, HubspotYPPContact } from './types'

function getCapitalizedTierFromYppStatus(yppStatus: ChannelYppStatus) {
  const verifiedPrefix = 'Verified::'
  if (
    yppStatus === `Verified::Bronze` ||
    yppStatus === `Verified::Silver` ||
    yppStatus === `Verified::Gold` ||
    yppStatus === `Verified::Diamond`
  ) {
    return yppStatus.replace(verifiedPrefix, '').toUpperCase() as 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND'
  }
}

function signupRewardInUsd(contact: Awaited<ReturnType<typeof getAllYppContacts>>[number]): number {
  if (contact.latest_ypp_period_wc !== null && contact.latest_ypp_period_wc !== '') {
    return 0
  }
  // If this is the first time we are checking for this channel contact, we should give them the sign up reward
  const tier = getCapitalizedTierFromYppStatus(contact.yppstatus)
  if (tier) {
    return config(`${tier}_TIER_SIGNUP_REWARD_IN_USD`)
  }
  return 0
}

async function referralsRewardInUsd(
  contact: Awaited<ReturnType<typeof getAllYppContacts>>[number],
  date?: string
): Promise<number> {
  const referredChannels = await getAllReferredChannels(contact.gleev_channel_id, date || contact.latest_ypp_period_wc)

  let reward = 0
  for (const referred of referredChannels) {
    const tier = getCapitalizedTierFromYppStatus(referred.yppStatus)
    if (tier) {
      reward += config(`${tier}_TIER_REFERRAL_REWARD_IN_USD`)
    }
  }
  return reward
}

async function latestSyncRewardInUsd(contact: Awaited<ReturnType<typeof getAllYppContacts>>[number], date?: string) {
  const tier = getCapitalizedTierFromYppStatus(contact.yppstatus)

  if (tier) {
    const syncedCount = await countVideosSyncedAfter(
      contact.channel_url,
      date || contact.latest_ypp_period_wc || contact.date_signed_up_to_ypp
    )
    const maxRewardedVideos = Math.min(syncedCount, config('MAX_REWARDED_VIDEOS_PER_WEEK'))
    const rewardPerVideo = config(`${tier}_TIER_SYNC_REWARD_IN_USD`)
    const videos_sync_reward_in_usd = rewardPerVideo * maxRewardedVideos
    return { syncedCount, videos_sync_reward_in_usd }
  }

  return { syncedCount: 0, videos_sync_reward_in_usd: 0 }
}

export async function updateHubspotWithCalculatedRewards() {
  const contacts = await getAllYppContacts()

  const GLOBAL_LAST_DATE_CHECKED = contacts.filter((c) => c.latest_ypp_period_wc)[0].latest_ypp_period_wc

  const updatedContactRewardById: Map<string, Partial<HubspotYPPContact>> = new Map()

  for (const contact of contacts) {
    // If the contact record is already checked & updated for this cycle, skip
    if (contact.latest_ypp_period_wc === new Date().toISOString().split('T')[0]) {
      console.log(`Already Checked For this Cycle`, contact.gleev_channel_id)
      continue
    }

    let sign_up_reward_in_usd = signupRewardInUsd(contact)

    let latest_referral_reward_in_usd = await referralsRewardInUsd(contact, GLOBAL_LAST_DATE_CHECKED)
    // TODO: double the syncedCount due to non-payment in the previous week
    let { videos_sync_reward_in_usd, syncedCount } = await latestSyncRewardInUsd(contact, GLOBAL_LAST_DATE_CHECKED)

    if (contact.latest_ypp_reward_status === 'To Pay') {
      sign_up_reward_in_usd = contact.sign_up_reward_in_usd
      latest_referral_reward_in_usd = contact.latest_referral_reward_in_usd + latest_referral_reward_in_usd
      videos_sync_reward_in_usd = contact.videos_sync_reward + videos_sync_reward_in_usd
    }

    const anyRewardOwed = sign_up_reward_in_usd + latest_referral_reward_in_usd + videos_sync_reward_in_usd

    const contactRewardFields: Partial<HubspotYPPContact> = {
      new_synced_vids: syncedCount.toString(),
      latest_ypp_period_wc: new Date().setUTCHours(0, 0, 0, 0).toString(),
      sign_up_reward_in_usd: sign_up_reward_in_usd.toString(),
      latest_referral_reward_in_usd: latest_referral_reward_in_usd.toString(),
      videos_sync_reward: videos_sync_reward_in_usd.toString(),
      latest_ypp_reward_status: anyRewardOwed ? 'To Pay' : 'Paid',
      ...(anyRewardOwed ? {} : { latest_ypp_reward: '0' }),
    }
    updatedContactRewardById.set(contact.contactId, contactRewardFields)
  }

  const updateContactInputs: Parameters<typeof updateYppContacts>['0'] = []

  updatedContactRewardById.forEach((properties, contactId) =>
    updateContactInputs.push({ id: contactId || '', properties })
  )

  await updateYppContacts([...updateContactInputs.values()])
}

export async function updateContactsInHubspot() {
  console.log('Adding new YPP contacts to Hubspot...')
  const channels = await getAllChannels() // All the channels that ever signed up (This does not include not signed up referrer channels)
  const existingContacts = await getAllYppContacts(['customer', 'lead'])

  const updateContactInputs: Parameters<typeof updateYppContacts>['0'] = []
  const createContactInputs: Parameters<typeof createYppContacts>['0'] = []

  // Check for all the YPP participants (Lead Status === 'CONNECTED')
  channels.forEach((ch) => {
    const existingContact = existingContacts.find((contact) => contact.email.toLowerCase() === ch.email.toLowerCase())

    if (existingContact) {
      updateContactInputs.push({ id: existingContact.contactId, properties: mapDynamoItemToContactFields(ch) })
    } else {
      createContactInputs.push({ properties: mapDynamoItemToContactFields(ch) })
    }
  })

  // Check for all the referrers (Lead Status === 'REFERRER')
  const referrers = channels.reduce((result, channel) => {
    if (channel.referrerChannelId) {
      result.add(channel.referrerChannelId)
    }
    return result
  }, new Set<number>())

  referrers.forEach((referrer) => {
    const existingContact = existingContacts.find((contact) => contact.gleev_channel_id === referrer)

    if (!existingContact) {
      createContactInputs.push({ properties: mapReferrerToContactFields(referrer) })
    }
  })

  await updateYppContacts(updateContactInputs)
  await createYppContacts(createContactInputs)

  console.log(
    `Pushed channel contacts to the Hubspot - ` +
      `New Contacts: ${createContactInputs.length}, Updated Contacts: ${updateContactInputs.length}`
  )
}

// TODO: Note: Status change from one tier to another tier, or from referrer (lead status) to customer does not result in signup rewards, so this case needs to be handled manually
