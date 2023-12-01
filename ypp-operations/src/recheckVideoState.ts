import _ from 'lodash'
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

  const duplicateJsChannels = _(existingContacts)
    .countBy('gleev_channel_id') // Count occurrences of each
    .pickBy((count) => count > 1) // Keep only those with count > 1
    .keys() // Get the key
    .value()
  const duplicateYtChannels = _(existingContacts)
    .countBy('channel_url') // Count occurrences of each
    .pickBy((count) => count > 1) // Keep only those with count > 1
    .keys() // Get the key
    .value()
  const duplicateEmails = _(channels.map((c) => ({ email: c.email.toLowerCase() })))
    .countBy('email') // Count occurrences of each
    .pickBy((count) => count > 1) // Keep only those with count > 1
    .keys() // Get the key
    .value()

  // Print any duplicate gleev channels
  console.log(`duplicateJoystreamChannels: ${duplicateJsChannels}\n`)
  console.log(`duplicateYoutubeChannels: ${duplicateYtChannels}\n`)
  console.log(`duplicateEmails: ${duplicateEmails}\n`)

  const updateContactInputs: Parameters<typeof updateYppContacts>['0'] = []
  const createContactInputs: Parameters<typeof createYppContacts>['0'] = []

  // Check for all the YPP participants (Lead Status === 'CONNECTED')
  channels.forEach((ch) => {
    // (Email, YTChannelId) should be a unique combination since YT-synch backend
    // does not allow change email once channel signs up. Beware that any new
    // channel signup can use the existing email (i.e. duplicate emails are allowed)
    const sameContact = existingContacts.find(
      (contact) => contact.email.toLowerCase() === ch.email.toLowerCase() && contact.channel_url == ch.id
    )
    const existingEmailContact = existingContacts.find(({ email }) => email.toLowerCase() === ch.email.toLowerCase())
    const existingGleevIdContact = existingContacts.find(
      ({ gleev_channel_id }) => gleev_channel_id === ch.joystreamChannelId
    )

    // SCENARIO 1:
    if (sameContact) {
      updateContactInputs.push({
        id: sameContact.contactId,
        properties: mapDynamoItemToContactFields(ch, sameContact.email),
      })
    }
    // SCENARIO 2:
    else if (existingEmailContact && existingEmailContact.lifecyclestage === 'lead') {
      updateContactInputs.push({ id: existingEmailContact.contactId, properties: mapDynamoItemToContactFields(ch) })
    }
    // SCENARIO 3:
    else if (existingEmailContact && existingEmailContact.lifecyclestage === 'customer') {
      const modifiedEmail = `secondary-${existingEmailContact.email}`
      const modifiedEmailContact = existingContacts.find((contact) => contact.email === modifiedEmail)

      const properties = mapDynamoItemToContactFields(ch, modifiedEmail)
      modifiedEmailContact
        ? updateContactInputs.push({ id: modifiedEmailContact.contactId, properties })
        : createContactInputs.push({ properties })
    }
    // SCENARIO 4:
    else if (existingGleevIdContact && existingGleevIdContact.hs_lead_status === 'REFERRER') {
      updateContactInputs.push({ id: existingGleevIdContact.contactId, properties: mapDynamoItemToContactFields(ch) })
    }
    // SCENARIO 5:
    else {
      createContactInputs.push({ properties: mapDynamoItemToContactFields(ch) })
    }
  })

  // Check for all the new referrers that are not participant yet (Lead Status === 'REFERRER')
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

// TODO: Note: Status change from one tier to another tier, or from referrer (lead status) to customer does not result in signup rewards, so this case needs to be handled manually -> This will not happen after we use processedAt.

// TODO: check: if user sign-ups up again and again using same YT channel but different email, will they get signup reward each time? TODO: fix this by using Dynamo create for calculating the signup rewards? -> This will not happen as now dynamo does not allow changing emails during re-signup
