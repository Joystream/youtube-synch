import AWS from './aws-config'
import { loadConfig as config } from './config'
import { YtChannel } from './types'

const documentClient = new AWS.DynamoDB.DocumentClient()

export async function countVideosSyncedAfter(channelId: string, date: string): Promise<number> {
  // IMPORTANT: Here we are paying rewards for videos that haven't been synced yet
  const params = {
    TableName: 'videos',
    IndexName: 'channelId-publishedAt-index',
    KeyConditionExpression: '#channelId = :channelIdVal and #publishedAt > :publishedAtAtVal',
    FilterExpression: '#duration > :durationVal',
    ExpressionAttributeNames: {
      '#channelId': 'channelId',
      '#publishedAt': 'publishedAt',
      '#duration': 'duration',
    },
    ExpressionAttributeValues: {
      ':channelIdVal': channelId,
      ':publishedAtAtVal': date,
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
    params.FilterExpression = 'begins_with(#yppStatus, :status) AND #createdAt >= :date'
    params.ExpressionAttributeNames = { ...params.ExpressionAttributeNames, ...{ '#createdAt': 'createdAt' } }
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
