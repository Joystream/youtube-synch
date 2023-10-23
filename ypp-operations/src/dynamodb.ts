import AWS from './aws-config'
import { loadConfig as config } from './config'
import { YtChannel } from './types'

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
  const videosEligibleForReward =
    videos.Items?.filter((video) => video.duration > config('MIN_VIDEO_DURATION_IN_MINS') * 60).length || 0
  return videosEligibleForReward
}

export async function getAllReferredChannels(referrerId: number, date: string): Promise<YtChannel[]> {
  const params = {
    TableName: 'channels',
    IndexName: 'referrerChannelId-index',
    KeyConditionExpression: '#referrerChannelId = :referrerId',
    FilterExpression: 'begins_with(#yppStatus, :status) AND #createdAt >= :date',
    ExpressionAttributeNames: {
      '#referrerChannelId': 'referrerChannelId',
      '#yppStatus': 'yppStatus',
      '#createdAt': 'createdAt',
    },
    ExpressionAttributeValues: {
      ':referrerId': referrerId,
      ':status': 'Verified::',
      ':date': date,
    },
  }

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

export async function getAllChannels(): Promise<YtChannel[]> {
  const channels: YtChannel[] = []
  let cursor = undefined
  do {
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: 'channels',
      ExclusiveStartKey: cursor,
    }

    const paginatedResponse = await documentClient.scan(params).promise()
    channels.push(...(paginatedResponse.Items as YtChannel[]))
    cursor = paginatedResponse.LastEvaluatedKey
  } while (cursor)

  return channels as YtChannel[]
}
