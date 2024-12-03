import _ from 'lodash'
import moment from 'moment-timezone'
import { loadConfig as config } from './config'
import { countVideosSyncedAfter, getAllChannels, getAllReferredChannels, getNoDurationVideosOf } from './dynamodb'
import {
  YppContact,
  createYppContacts,
  getAllYppContacts,
  hubspotClient,
  mapDynamoItemToContactFields,
  mapReferrerToContactFields,
  updateYppContacts
} from './hubspot'
import { ChannelYppStatus, HubspotYPPContact } from './types'
import { ValueWithTimestamp } from '@hubspot/api-client/lib/codegen/crm/contacts'
import { getVideoDurationsMap } from './yt-api'
import assert from 'assert'

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

/**
 * Fix index in Hubspot's status history which corresponds to
 * 'OptedOut' status update which happend due to a bug.
 * (ref: https://github.com/Joystream/youtube-synch/issues/337)
 * Those updates happened at 2024-09-23 between 08:30 and 08:40
 */
function findOptOutBugIdx(statusHistory: ValueWithTimestamp[]): number {
  const optOutBugStart = new Date("2024-09-23T08:30:00Z")
  const optOutBugEnd = new Date("2024-09-23T08:40:00Z")
  const optOutBugIdx = statusHistory.findIndex(
    s => s.value === 'OptedOut' &&
    new Date(s.timestamp) > optOutBugStart &&
    new Date(s.timestamp) < optOutBugEnd
  )
  return optOutBugIdx
}

/**
 * Based on status history, find the tier (status) that a channel
 * had at a given date.
 */
function channelStatusAt(statusHistory: ValueWithTimestamp[], atDate: Date): string | null {
  let i = 0
  while (i < statusHistory.length && new Date(statusHistory[i].timestamp) > new Date(atDate)) {
    ++i
  }
  return i === statusHistory.length ? null : statusHistory[i].value
}

/**
 * Get data about payout week that a specified date "belongs to".
 * (we assume each payout week starts and ends at Monday, 12:00:00 CET)
 */
export function getPayoutWeek(date: Date): {
  start: Date,
  end: Date,
  label: string
} {
  const dateCET = moment(date).tz('Europe/Berlin')
  const weekStartCET = dateCET.clone()
  // Adjust to last Monday
  if (weekStartCET.day() === 0) {
    // Sunday
    weekStartCET.subtract(6, 'days')
  } else {
    weekStartCET.subtract(weekStartCET.day() - 1, 'days')
  }
  // Set time to midday (12:00 PM)
  weekStartCET.set({ hour: 12, minute: 0, second: 0, millisecond: 0 })

  // If the date is < weekBeginCET (for exmaple, it's Monday 8:00)
  // then we go back a week
  if (dateCET < weekStartCET) {
    weekStartCET.subtract(1, 'week')
  }

  const weekStart = weekStartCET.clone()
  const weekEnd = weekStartCET.clone().add(1, 'week')  
  return {
    start: new Date(parseInt(weekStart.format('X')) * 1000),
    end: new Date(parseInt(weekEnd.format('X')) * 1000),
    label: weekStart.format('DD.MM') + " - " + weekEnd.format('DD.MM')
  }
}

type MissedRewardWeek = {
  week: string,
  tier: string,
  totalReward: number,
  rewardedVideosNum: number,
  videos: {
    youtubeId: string,
    joystreamId?: string,
    duration: number,
    createdAt: string,
    status: string,
  }[]
}

type MissedReawrdChannel = {
  channelId: string,
  joystreamChannelId: string,
  missedRewardsTotal: number,
  missedRewards: MissedRewardWeek[]
}

type MissedRewards = {
  missedRewardsTotal: number,
  channels: MissedReawrdChannel[]
}

export async function calculateMissedRewards(
  contacts: (YppContact & { propertiesWithHistory: { yppstatus?: ValueWithTimestamp[] } })[]
): Promise<MissedRewards | undefined> {
  const rewardedTiers: Map<string, number> = new Map([
    ['Verified::Silver', config('SILVER_TIER_SYNC_REWARD_IN_USD')],
    ['Verified::Gold', config('GOLD_TIER_SYNC_REWARD_IN_USD')],
    ['Verified::Diamond', config('DIAMOND_TIER_SYNC_REWARD_IN_USD')]
  ])

  // Create a list of "contacts of interest"
  // (contacts that ever had Silver+ status)
  const contactsOfInterest = contacts.filter(c => _.find(c.propertiesWithHistory.yppstatus || [], s => rewardedTiers.has(s.value)))
  
  // Adjust contact status histories taking into account the opt-out bug...
  let optOutBugAffectedLen = 0
  const statusHistories = new Map(contactsOfInterest.map(c => {
    const statusHistory = c.propertiesWithHistory.yppstatus || []
    const optOutBugIdx = findOptOutBugIdx(statusHistory)
    if (optOutBugIdx !== -1) {
      ++optOutBugAffectedLen
      // If affected by opt-out bug: We ignore any status change starting from
      // the 'OptedOut' update (ie. we'll use last *correct* status)
      return [c.gleev_channel_id, statusHistory.slice(optOutBugIdx + 1)]
    }
    return [c.gleev_channel_id, statusHistory]
  }))

  console.error(
    `Found ${contactsOfInterest.length} contacts (including ${optOutBugAffectedLen} affected by opt-out issue) ` +
    `with potentially missed rewards...`
  )

  // Load data about all DynamoDB videos that:
  // - have duration = 0
  // - were uploaded by one of the `contactsOfInterest`
  // - were uploaded after a given contact joined YPP
  const videos = (
    await Promise.all(contactsOfInterest.map(async contact => {
      const videos = await getNoDurationVideosOf(contact.channel_url, contact.date_signed_up_to_ypp)
      return videos
        .map(v => ({
          ...v,
          channelId: contact.channel_url,
          joystreamChannelId: contact.gleev_channel_id,
        }))
    }))
  ).flat()
  console.error(`Found ${videos.length} videos to potentially reward...`)
  
  // Print some information about date range of the videos
  const earliestDate = new Date(_.minBy(videos, v => new Date(v.createdAt))?.createdAt || 0)
  const latestDate = new Date(_.maxBy(videos, v => new Date(v.createdAt))?.createdAt || 0)
  console.error(`Earliest: ${earliestDate.toISOString()}`)
  console.error(`Latest: ${latestDate.toISOString()}`)
  
  // Fetch the actual duration of videos using YouTube API
  console.error(`Fetching data from YouTube...`)
  const ytVideoDurationsMap = await getVideoDurationsMap(videos.map(v => v.id))
  
  // Create `videosToReward` array based on actual durations
  const videosToReward = []
  for (const video of videos) {
    const trueDuration = ytVideoDurationsMap.get(video.id) || 0
    const payoutWeek = getPayoutWeek(new Date(video.createdAt))
    const channelStatusHistory = statusHistories.get(video.joystreamChannelId) || []
    const channelStatus = channelStatusAt(channelStatusHistory, payoutWeek.end)
    // Only consider videos which:
    // - Have trueDuration > MIN_VIDEO_DURATION_IN_MINS
    // - Belong to a channel which had one of the `rewardedTiers`
    //   at the end of the payout week during which the video was created 
    if (
      trueDuration &&
      trueDuration > config('MIN_VIDEO_DURATION_IN_MINS') * 60 &&
      channelStatus &&
      rewardedTiers.has(channelStatus)
    ) {
      videosToReward.push({
        ...video,
        tier: channelStatus,
        payoutWeek,
        duration: trueDuration
      })
    }
  }
  console.error(
    `Final number of videos to consider: ${videosToReward.length} `  +
    `(in ${_.uniqBy(videosToReward, v => v.joystreamChannelId).length} channels)`
  )
  
  // Restructure the data into a more readable format
  const missedRewardsChannels: MissedRewards['channels'] = _.chain(videosToReward)
    .groupBy(v => v.joystreamChannelId)
    .map((videos, joystreamChannelId) => {
      const channelId = videos[0].channelId
      assert(videos.every(v => v.channelId === channelId))
      const missedRewards = _.chain(videos)
        .groupBy(v => v.payoutWeek.label)
        .entries()
        .orderBy(([_, videos]) => videos[0].payoutWeek.end)
        .map(([weekLabel, videos]) => {
          const rewardedVideosNum = Math.min(videos.length, config('MAX_REWARDED_VIDEOS_PER_WEEK'))
          const tier = videos[0].tier
          const totalReward = rewardedVideosNum * (rewardedTiers.get(tier) || 0)
          return {
            week: weekLabel,
            tier,
            totalReward,
            rewardedVideosNum,
            videos: videos.map(v => ({
              youtubeId: v.id,
              joystreamId: v.joystreamVideo?.id,
              duration: v.duration,
              createdAt: v.createdAt,
              status: v.state
            }))
          }
        })
        .valueOf()
        .flatMap((v) => !!v ? [v] : [])
      return {
        channelId,
        joystreamChannelId,
        missedRewards,
        missedRewardsTotal: Object.values(missedRewards).reduce((sum, week) => sum += week.totalReward, 0)
      }
    })
    .valueOf()
    .filter(c => c.missedRewardsTotal > 0)

  return {
    missedRewardsTotal: Object.values(missedRewardsChannels).reduce((sum, channel) => sum += channel.missedRewardsTotal, 0),
    channels: missedRewardsChannels
  }
}

// TODO: Note: Status change from one tier to another tier, or from referrer (lead status) to customer does not result in signup rewards, so this case needs to be handled manually -> This will not happen after we use processedAt.

// TODO: check: if user sign-ups up again and again using same YT channel but different email, will they get signup reward each time? TODO: fix this by using Dynamo create for calculating the signup rewards? -> This will not happen as now dynamo does not allow changing emails during re-signup
