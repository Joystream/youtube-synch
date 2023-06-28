import AWS from 'aws-sdk'
import { getAllContacts } from './hubspot'

const documentClient = new AWS.DynamoDB.DocumentClient()

export async function getVideosSyncedAfter(channelId: string, date: string): Promise<string> {
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
  return videos.Count?.toString() || '0'
}

// setInterval(async () => {
//   const contacts = await getAllContacts()
//   for (const contact of contacts) {
//     // Update the l`New Synced Vids` and `Latest Date Checked` fields in HubSpot
//     const syncedCount = await getVideosSyncedAfter(contact.email, contact.latestDateChecked)
//     await updateYppContact(contact.contactId, {
//       latest_ypp_period_wc: new Date().setUTCHours(0, 0, 0, 0).toString(),
//       new_synced_vids: syncedCount,
//     })

//     const a: HubspotYPPContact = {
//       sign_up_reward: '',
//       videos_sync_reward: config().BASE_SYNC_REWARD_IN_USD
//       latest_ypp_reward_status: 'To Pay',
//     }
//   }
// }, config().CHECK_NEW_SYNCED_VIDEOS_INTERVAL_IN_HOURS * 60 * 60 * 1000)

export async function recheck() {
  const contacts = await getAllContacts()
  for (const contact of contacts) {
    // Update the l`New Synced Vids` and `Latest Date Checked` fields in HubSpot
    console.log(contact.channelId)
    const syncedCount = await getVideosSyncedAfter(contact.channelId, contact.latestDateChecked)
    console.log(contact.channelId, syncedCount)
    // await updateYppContact(contact.contactId, {
    //   latest_ypp_period_wc: new Date().setUTCHours(0, 0, 0, 0).toString(),
    //   new_synced_vids: syncedCount,
    // })
  }
}

// TODO:  re-run the script only when the payment for previous synced videos has been made
