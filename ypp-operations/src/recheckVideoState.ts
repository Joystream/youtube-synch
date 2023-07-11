import cron from 'node-cron'
import AWS from './aws-config'
import { loadConfig as config } from './config'
import { getAllContacts } from './hubspot'
import { HubspotYPPContact, YtChannel } from './types'

const documentClient = new AWS.DynamoDB.DocumentClient()

export async function countVideosSyncedAfter(channelId: string, date: string): Promise<number> {
  const params = {
    TableName: 'videos',
    IndexName: 'channelId-publishedAt-index',
    KeyConditionExpression: '#channelId = :hashVal and #publishedAt > :dateVal',
    FilterExpression: '#state = :stateVal',
    ExpressionAttributeNames: {
      '#channelId': 'channelId',
      '#publishedAt': 'publishedAt',
      '#state': 'state',
    },
    ExpressionAttributeValues: {
      ':hashVal': channelId,
      ':stateVal': 'UploadSucceeded',
      ':dateVal': date,
    },
  }

  const videos = await documentClient.query(params).promise()
  return videos.Count || 0
}

export async function countChannelsReferredAfter(gleevChannelId: number, date: string): Promise<number> {
  const params = {
    TableName: 'channels',
    FilterExpression:
      '#yppStatus = :yppStatusVal and #referrerChannelId = :referrerChannelIdVal and #createdAt > :dateVal',
    ExpressionAttributeNames: {
      '#yppStatus': 'yppStatus',
      '#referrerChannelId': 'referrerChannelId',
      '#createdAt': 'createdAt',
    },
    ExpressionAttributeValues: {
      ':yppStatusVal': 'Verified',
      ':referrerChannelIdVal': gleevChannelId,
      ':dateVal': date,
    },
  }

  const channels = await documentClient.scan(params).promise()
  return channels.Count || 0
}

export async function getAllVerifiedChannels(): Promise<YtChannel[]> {
  const params = {
    TableName: 'channels',
    FilterExpression: '#yppStatus = :yppStatusVal',
    ExpressionAttributeNames: {
      '#yppStatus': 'yppStatus',
    },
    ExpressionAttributeValues: {
      ':yppStatusVal': 'Verified',
    },
  }

  const channels = await documentClient.scan(params).promise()
  console.log(channels)
  return channels.Items as YtChannel[]
}

export async function recheck() {
  const contacts = await getAllContacts()
  console.log(contacts.length)
  for (const contact of contacts) {
    // Update the l`New Synced Vids` and `Latest Date Checked` fields in HubSpot

    // if (contact.yppRewardStatus !== '')
    const syncedCount = await countVideosSyncedAfter(
      contact.channelId,
      contact.latestDateChecked || contact.dateSignedUpToYpp
    )
    const referredCount = await countChannelsReferredAfter(
      contact.gleev_channel_id,
      contact.latestDateChecked || contact.dateSignedUpToYpp
    )
    console.log(
      contact.channelId,
      contact.gleev_channel_id,
      contact.tier,
      contact.latestDateChecked,
      contact.latestDateChecked === null,
      contact.dateSignedUpToYpp,
      syncedCount,
      referredCount,
      contact.yppRewardStatus
    )

    const rewardMultiplier = contact.tier == 1 ? 1 : contact.tier == 2 ? 2.5 : 5

    // If this is the first time we are checking for this channel contact, we should give them the sign up reward
    let sign_up_reward_in_usd =
      contact.latestDateChecked === null ? config().BASE_SIGNUP_REWARD_IN_USD * rewardMultiplier : 0
    let latest_referral_reward_in_usd = config().BASE_REFERRAL_REWARD_IN_USD * rewardMultiplier * referredCount
    let videos_sync_reward_in_usd =
      config().BASE_SYNC_REWARD_IN_USD * rewardMultiplier * (syncedCount < 5 ? syncedCount : 5)
    let latest_ypp_reward = sign_up_reward_in_usd + latest_referral_reward_in_usd + videos_sync_reward_in_usd

    if (contact.yppRewardStatus === 'To Pay') {
      sign_up_reward_in_usd = contact.sign_up_reward_in_usd
      latest_referral_reward_in_usd = contact.latest_referral_reward_in_usd + latest_referral_reward_in_usd
      videos_sync_reward_in_usd = contact.videos_sync_reward_in_usd + videos_sync_reward_in_usd
    }
    const contactRewardFields: Partial<HubspotYPPContact> = {
      new_synced_vids: syncedCount.toString(),
      latest_ypp_period_wc: new Date().setUTCHours(0, 0, 0, 0).toString(),
      sign_up_reward_in_usd: sign_up_reward_in_usd.toString(),
      latest_referral_reward_in_usd: latest_referral_reward_in_usd.toString(),
      videos_sync_reward: videos_sync_reward_in_usd.toString(),
      // latest_ypp_reward:latest_ypp_reward:,
      latest_ypp_reward_status: 'To Pay',
    }
    console.log(contactRewardFields)
    // await updateYppContact(contact.contactId, contactRewardFields)
  }
}

// TODO:  re-run the script only when the payment for previous synced videos has been made

cron.schedule(
  '* * * * *',
  () => {
    console.log('running a task every minute')
  },
  {
    scheduled: true,
    timezone: 'Europe/Paris',
  }
)
