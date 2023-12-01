import moment from 'moment-timezone'
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

async function referralsRewardInUsd(contact: Awaited<ReturnType<typeof getAllYppContacts>>[number]): Promise<number> {
  const referredChannels = await getAllReferredChannels(contact.gleev_channel_id, contact.latest_ypp_period_wc)

  let reward = 0
  for (const referred of referredChannels) {
    const tier = getCapitalizedTierFromYppStatus(referred.yppStatus)
    if (tier) {
      reward += config(`${tier}_TIER_REFERRAL_REWARD_IN_USD`)
    }
  }
  return reward
}

async function latestSyncRewardInUsd(contact: Awaited<ReturnType<typeof getAllYppContacts>>[number]) {
  const tier = getCapitalizedTierFromYppStatus(contact.yppstatus)

  if (tier) {
    const syncedCount = await countVideosSyncedAfter(
      contact.channel_url,
      contact.latest_ypp_period_wc || contact.date_signed_up_to_ypp
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
  const cutoffDate = getLastMondayMiddayCET()
  const updatedContactRewardById: Map<string, Partial<HubspotYPPContact>> = new Map()

  for (const contact of contacts) {
    // If the previous rewards has not been paid then don't yet calculate rewards
    // for this cycle, otherwise pervious unpaid rewards would be overwritten
    if (contact.latest_ypp_reward_status === 'To Pay') {
      console.log(
        `Skipping rewards calculation for this cycle as previous rewards not paid yet`,
        contact.gleev_channel_id
      )
      continue
    }

    // Compare with contact's sign-up date
    if (new Date(contact.date_signed_up_to_ypp) > cutoffDate) {
      // If the contact signed up before last Monday midday CET, skip from reward calculation
      console.log(
        `Skipping rewards calculation for this cycle as this channel signed up after cutoff date`,
        contact.gleev_channel_id
      )
      continue
    }

    const sign_up_reward_in_usd = signupRewardInUsd(contact)
    const latest_referral_reward_in_usd = await referralsRewardInUsd(contact)
    const { videos_sync_reward_in_usd, syncedCount } = await latestSyncRewardInUsd(contact)
    const anyRewardOwed = sign_up_reward_in_usd + latest_referral_reward_in_usd + videos_sync_reward_in_usd

    const contactRewardFields: Partial<HubspotYPPContact> = {
      new_synced_vids: syncedCount.toString(),
      latest_ypp_period_wc: new Date().toISOString(),
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

  //Count the occurrences of each gleev_channel_id
  const idCountMap: { [key: number]: number } = {}
  for (const contact of existingContacts) {
    const channelId = contact.gleev_channel_id
    if (channelId !== undefined) {
      idCountMap[channelId] = (idCountMap[channelId] || 0) + 1
    }
  }

  const duplicateChannels = Object.entries(idCountMap).reduce((accumulator: number[], [channelId, count]) => {
    if (count > 1) {
      accumulator.push(Number(channelId))
    }
    return accumulator
  }, [])

  // Print any duplicate gleev channels
  console.log(`duplicateChannels: ${duplicateChannels}`)

  const updateContactInputs: Parameters<typeof updateYppContacts>['0'] = []
  const createContactInputs: Parameters<typeof createYppContacts>['0'] = []

  // Check for all the YPP participants (Lead Status === 'CONNECTED')
  channels.forEach((ch) => {
    // (GleevChannelId, YTChannelId) check only returns max contact result
    const existingContact = existingContacts.find(
      (contact) => contact.gleev_channel_id === ch.joystreamChannelId && contact.channel_url == ch.id
    )
    const duplicateEmailContact = existingContacts.find(
      (contact) => contact.email.toLowerCase() === ch.email.toLowerCase()
    )

    // SCENARIO 1:
    if (existingContact) {
      updateContactInputs.push({
        id: existingContact.contactId,
        properties: mapDynamoItemToContactFields(ch, existingContact.email),
      })
    }
    // SCENARIO 2:
    else if (duplicateEmailContact && duplicateEmailContact.lifecyclestage === 'lead') {
      updateContactInputs.push({ id: duplicateEmailContact.contactId, properties: mapDynamoItemToContactFields(ch) })
    }
    // SCENARIO 3:
    else if (duplicateEmailContact && duplicateEmailContact.lifecyclestage === 'customer') {
      createContactInputs.push({
        properties: mapDynamoItemToContactFields(ch, `secondary-${duplicateEmailContact.email}`),
      })
    }
    // SCENARIO 4:
    else {
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
    const createContactInput = createContactInputs.find(
      (contact) => parseInt(contact.properties.gleev_channel_id || '') === referrer
    )

    if (!existingContact && !createContactInput) {
      createContactInputs.push({ properties: mapReferrerToContactFields(referrer) })
    }
  })

  await createYppContacts(createContactInputs)
  await updateYppContacts(updateContactInputs)

  console.log(
    `Pushed channel contacts to the Hubspot - ` +
      `New Contacts: ${createContactInputs.length}, Updated Contacts: ${updateContactInputs.length}`
  )
}

export function getLastMondayMiddayCET(): Date {
  // Start with the current time in CET
  let nowCET = moment().tz('Europe/Berlin')

  // Adjust to last Monday
  if (nowCET.day() === 0) {
    // Sunday
    nowCET.subtract(6, 'days')
  } else {
    nowCET.subtract(nowCET.day() - 1, 'days')
  }

  // Set time to midday (12:00 PM)
  nowCET.set({ hour: 12, minute: 0, second: 0, millisecond: 0 })

  // Return timestamp
  return new Date(parseInt(nowCET.format('X')) * 1000) // Unix Timestamp (seconds since the Unix Epoch)
}

// TODO: Note: Status change from one tier to another tier, or from referrer (lead status) to customer does not result in signup rewards, so this case needs to be handled manually

// TODO: check: if user sign-ups up again and again using same YT channel but different email, will they get signup reward each time? TODO: fix this by using Dynamo create for calculating the signup rewards?
