import AWS from './aws-config'
import { loadConfig as config } from './config'
import { OptedOutContactData, YtChannel } from './types'
import _ from 'lodash'

const documentClient = new AWS.DynamoDB.DocumentClient()

export async function countVideosSyncedAfter(channelId: string, yppSignupDate: string, date: string): Promise<number> {
  // IMPORTANT: Here we are paying rewards for videos that haven't been synced yet
  const params = {
    TableName: 'videos',
    IndexName: 'channelId-createdAt-index',
    KeyConditionExpression: '#channelId = :channelIdVal and #createdAt > :createdAtAtVal',
    FilterExpression: '#publishedAt > :publishedAtAtVal and #duration > :durationVal',
    ExpressionAttributeNames: {
      '#channelId': 'channelId',
      '#createdAt': 'createdAt',
      '#publishedAt': 'publishedAt',
      '#duration': 'duration',
    },
    ExpressionAttributeValues: {
      ':channelIdVal': channelId,
      ':createdAtAtVal': date,
      ':publishedAtAtVal': yppSignupDate,
      ':durationVal': config('MIN_VIDEO_DURATION_IN_MINS') * 60,
    },
  }

  const videosEligibleForReward = (await documentClient.query(params).promise()).Items || []
  return videosEligibleForReward.length
}

export async function getAllReferredChannels(referrerId: number, date?: string): Promise<YtChannel[]> {
  // Define basic query parameters
  let params: AWS.DynamoDB.DocumentClient.QueryInput = {
    TableName: 'channels',
    IndexName: 'referrerChannelId-index',
    KeyConditionExpression: '#referrerChannelId = :referrerId',
    ExpressionAttributeNames: {
      '#referrerChannelId': 'referrerChannelId',
      '#yppStatus': 'yppStatus',
    },
    ExpressionAttributeValues: {
      ':referrerId': referrerId,
      ':status': 'Verified::',
    },
  }

  // Add date filter if date is provided
  if (date) {
    params.FilterExpression = 'begins_with(#yppStatus, :status) AND #processedAt >= :date'
    params.ExpressionAttributeNames = { ...params.ExpressionAttributeNames, ...{ '#processedAt': 'processedAt' } }
    params.ExpressionAttributeValues = { ...params.ExpressionAttributeValues, ...{ ':date': date } }
  } else {
    params.FilterExpression = 'begins_with(#yppStatus, :status)'
  }

  // Execute the query
  const referredChannels = ((await documentClient.query(params).promise()).Items || []) as unknown as YtChannel[]

  return referredChannels
}

export async function getAllSuspendedChannels(): Promise<YtChannel[]> {
  const channels: YtChannel[] = []
  let cursor = undefined
  do {
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: 'channels',
      FilterExpression: '#yppStatus = :yppStatusVal',
      ExpressionAttributeNames: {
        '#yppStatus': 'yppStatus',
      },
      ExpressionAttributeValues: {
        ':yppStatusVal': 'Suspended',
      },
      ExclusiveStartKey: cursor,
    }

    const paginatedResponse = await documentClient.scan(params).promise()
    channels.push(...(paginatedResponse.Items as YtChannel[]))
    cursor = paginatedResponse.LastEvaluatedKey
  } while (cursor)

  console.log(
    channels.length,
    channels.reduce((sum, c) => sum + c.statistics.subscriberCount, 0)
  )
  return channels as YtChannel[]
}

/**
 * @returns all YPP channels except with `Unverified` yppStatus
 */
export async function getAllChannels(): Promise<YtChannel[]> {
  const channels: YtChannel[] = []
  let cursor = undefined
  do {
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: 'channels',
      FilterExpression: '#yppStatus <> :yppStatusVal',
      ExpressionAttributeNames: {
        '#yppStatus': 'yppStatus',
      },
      ExpressionAttributeValues: {
        ':yppStatusVal': 'Unverified',
      },
      ExclusiveStartKey: cursor,
    }

    const paginatedResponse = await documentClient.scan(params).promise()
    channels.push(...(paginatedResponse.Items as YtChannel[]))
    cursor = paginatedResponse.LastEvaluatedKey
  } while (cursor)

  return channels as YtChannel[]
}

/**
 * Mark channels affected by opted-out bug
 */
export async function markOptedOutChannels(data: OptedOutContactData[]): Promise<void> {
  let updatesExecuted = 0
  const batches = _.chunk(data, 100)
  for (const batch of batches) {
    await Promise.all(batch.map(async (channelData) => {
      const params: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName: 'channels',
        IndexName: 'id-index',
        KeyConditionExpression: '#idAttr = :idVal',
        ExpressionAttributeNames: {
          '#idAttr': 'id',
        },
        ExpressionAttributeValues: {
          ':idVal': channelData.channel_url,
        },
      }

      const queryRes = await documentClient.query(params).promise()
      const [ch] = (queryRes.Items || []) as YtChannel[]
      if (queryRes.Items?.length === 1 && ch) {
        const updateRes = await documentClient.update({
          Key: {
            userId: ch.userId,
            id: ch.id
          },
          TableName: 'channels',
          UpdateExpression: "set preOptOutStatus = :status",
          ExpressionAttributeValues: {
            ":status": channelData.pre_opt_out_status,
          },
          ReturnValues: 'UPDATED_NEW'
        }).promise()
        if (updateRes.Attributes?.preOptOutStatus === channelData.pre_opt_out_status) {
          updatesExecuted += 1
        } else {
          console.error(`Unexpected preOptOutStatus after update: ${updateRes.Attributes?.preOptOutStatus} (id: ${channelData.channel_url})`)
        }
      } else {
        console.error(`Unexpected items count: ${queryRes.Items?.length} (id: ${channelData.channel_url})`)
      }
    }))

    console.log(`Succesfully updated ${updatesExecuted} records...`)
  }
}
