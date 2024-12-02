import _ from 'lodash'
import moment from 'moment-timezone'
import { loadConfig as config } from './config'
import { countVideosSyncedAfter, getAllChannels, getAllReferredChannels } from './dynamodb'
import {
  YppContact,
  createYppContacts,
  getAllYppContacts,
  hubspotClient,
  mapDynamoItemToContactFields,
  mapReferrerToContactFields,
  updateYppContacts
} from './hubspot'
import { ChannelYppStatus, HubspotYPPContact, OptedOutContactData } from './types'

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

// TODO: pay signup reward based on the `channel.processedAt` field? But before that need to check all the channels signed up this week has processedAt set.
function signupRewardInUsd(contact: YppContact): number {
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

async function referralsRewardInUsd(contact: YppContact, allContacts: YppContact[]): Promise<number> {
  const referredChannels = await getAllReferredChannels(contact.gleev_channel_id, contact.latest_ypp_period_wc)

  let reward = 0
  for (const referred of referredChannels) {
    /**
      If the referred channel/contact was already processed before, and it was processed again during
      the rewards period (i.e. tier got reassigned) then it should not be considered again for rewards 
      to be paid to the referrer. Although there might be cases of genuine referrals owed, for example 
      referred channel tier was upgraded from `Silver` to `Gold` and referrer channel could be owed 
      reward due to this tier upgrade difference but we not considering such cases for referral payments.
    */
    const referredContactId =
      allContacts.find((contact) => contact.gleev_channel_id === referred.joystreamChannelId)?.contactId || ''
    const referredContact = await hubspotClient.crm.contacts.basicApi.getById(referredContactId, [], ['processed_at'])
    const previouslyPaidReferral = (referredContact?.propertiesWithHistory?.processed_at?.length || 0) > 1

    const tier = getCapitalizedTierFromYppStatus(referred.yppStatus)
    if (tier && !previouslyPaidReferral) {
      reward += config(`${tier}_TIER_REFERRAL_REWARD_IN_USD`)
    }
  }
  return reward
}

async function latestSyncRewardInUsd(contact: YppContact) {
  const tier = getCapitalizedTierFromYppStatus(contact.yppstatus)

  // TODO: check shouldbeingested be true? & allowoperatoringestion
  if (tier) {
    const syncedCount = await countVideosSyncedAfter(
      contact.channel_url,
      contact.date_signed_up_to_ypp,
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
    // If the reward was already calculated today for this channel,then skip from re-calculation
    if (contact.latest_ypp_period_wc?.split('T')[0] === new Date().toISOString().split('T')[0]) {
      console.log(`Already Checked For this Cycle`, contact.gleev_channel_id)
      continue
    }

    // Compare with contact's sign-up date
    if (new Date(contact.date_signed_up_to_ypp) > cutoffDate) {
      // If the contact signed up before last Monday midday CET, skip from reward calculation
      console.log(
        `Skipping rewards calculation for this cycle as this channel signed up after cutoff date`,
        contact.gleev_channel_id
      )
      console.log(new Date(contact.date_signed_up_to_ypp), cutoffDate)
      continue
    }

    let sign_up_reward_in_usd = signupRewardInUsd(contact)
    let latest_referral_reward_in_usd = await referralsRewardInUsd(contact, contacts)
    let { videos_sync_reward_in_usd, syncedCount } = await latestSyncRewardInUsd(contact)

    if (contact.latest_ypp_reward_status === 'To Pay') {
      sign_up_reward_in_usd = contact.sign_up_reward_in_usd
      latest_referral_reward_in_usd = contact.latest_referral_reward_in_usd + latest_referral_reward_in_usd
      videos_sync_reward_in_usd = contact.videos_sync_reward + videos_sync_reward_in_usd
    }

    const anyRewardOwed = sign_up_reward_in_usd + latest_referral_reward_in_usd + videos_sync_reward_in_usd

    console.log(
      contact.channel_url,
      contact.gleev_channel_id,
      contact.yppstatus,
      contact.latest_ypp_period_wc,
      contact.latest_ypp_period_wc === null,
      contact.date_signed_up_to_ypp,
      contact.latest_ypp_reward_status
    )

    const contactRewardFields: Partial<HubspotYPPContact> = {
      new_synced_vids: syncedCount.toString(),
      latest_ypp_period_wc: new Date().toISOString(),
      sign_up_reward_in_usd: sign_up_reward_in_usd.toString(),
      latest_referral_reward_in_usd: latest_referral_reward_in_usd.toString(),
      videos_sync_reward: videos_sync_reward_in_usd.toString(),
      latest_ypp_reward_status: anyRewardOwed ? 'To Pay' : 'Paid',
      ...(anyRewardOwed ? {} : { latest_ypp_reward: '0' }),
    }
    console.log(contactRewardFields)
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
    const [same, duplicate] = [
      mapDynamoItemToContactFields(ch),
      mapDynamoItemToContactFields(ch, `secondary-${ch.email}`),
    ]

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
      console.log('Same     ', same.email, same.gleev_channel_id, sameContact.contactId)
    }
    // SCENARIO 2:
    else if (existingEmailContact && existingEmailContact.lifecyclestage === 'lead') {
      console.log('Existing ', same.email, same.gleev_channel_id)
      updateContactInputs.push({ id: existingEmailContact.contactId, properties: mapDynamoItemToContactFields(ch) })
    }
    // SCENARIO 3:
    else if (existingEmailContact && existingEmailContact.lifecyclestage === 'customer') {
      console.log('Duplicate', duplicate.email, duplicate.gleev_channel_id)
      const modifiedEmail = `secondary-${existingEmailContact.email}`
      const modifiedEmailContact = existingContacts.find((contact) => contact.email === modifiedEmail)

      const properties = mapDynamoItemToContactFields(ch, modifiedEmail)
      modifiedEmailContact
        ? updateContactInputs.push({ id: modifiedEmailContact.contactId, properties })
        : createContactInputs.push({ properties })
    }
    // SCENARIO 4:
    else if (existingGleevIdContact && existingGleevIdContact.hs_lead_status === 'REFERRER') {
      console.log('Referrer ', same.email, same.gleev_channel_id)
      updateContactInputs.push({ id: existingGleevIdContact.contactId, properties: mapDynamoItemToContactFields(ch) })
    }
    // SCENARIO 5:
    else {
      console.log('New      ', same.email, same.gleev_channel_id)
      createContactInputs.push({ properties: mapDynamoItemToContactFields(ch) })
    }
  })

  // TODO: check if email got changed. Seems like it's not possible currently

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
      console.log(
        'New      ',
        mapReferrerToContactFields(referrer).email,
        mapReferrerToContactFields(referrer).gleev_channel_id
      )
      createContactInputs.push({ properties: mapReferrerToContactFields(referrer) })
    }
  })

  console.log(updateContactInputs.length, createContactInputs.length)

  // for (const contact of createContactInputs) {
  //   console.log(contact.properties.email, contact.properties.gleev_channel_id)
  //   await createYppContact(contact.properties)
  // }

  // console.log('Updating contacts')

  // for (const contact of updateContactInputs) {
  //   console.log(contact.properties.email, contact.properties.gleev_channel_id)
  //   await updateYppContact(contact.id, contact.properties)
  // }

  await createYppContacts(createContactInputs)
  await updateYppContacts(updateContactInputs)

  console.log(
    `Pushed channel contacts to the Hubspot - ` +
      `New Contacts: ${createContactInputs.length}, Updated Contacts: ${updateContactInputs.length}`
  )
}

export async function markOptedOutContacts(contactsData: OptedOutContactData[]) {
  console.log('Marking opted-out contacts...')

  updateYppContacts(contactsData.map(c => ({
    id: c.contactId.toString(),
    properties: {
      opt_out_bug_date: new Date(c.opted_out_date_str).toISOString(),
      pre_opt_out_status: c.pre_opt_out_status
    }
  })))
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
