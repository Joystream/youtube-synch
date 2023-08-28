import AWS from './aws-config'
import { loadConfig as config } from './config'
import { addOrUpdateYppContact, getYppContactByEmail } from './hubspot'
import { YtChannel } from './types'

const dynamodbstreams = new AWS.DynamoDBStreams({ apiVersion: '2012-08-10' })
const documentClient = new AWS.DynamoDB.DocumentClient()

async function getRecords(ShardIterator: string) {
  return dynamodbstreams.getRecords({ ShardIterator }).promise()
}

let lastProcessingAt = 0
let isProcessing = false
async function processRecords(records: AWS.DynamoDBStreams.GetRecordsOutput) {
  if (records.Records?.find((r) => r.eventName === 'MODIFY')) {
    console.log('found modify')

    if (!isProcessing && lastProcessingAt < Date.now() - 180000) {
      isProcessing = true
      const channels = await getAllVerifiedChannels()
      for (const ch of channels) {
        console.log(ch.email)
        const contactId = await getYppContactByEmail(ch.email)
        await addOrUpdateYppContact(ch, contactId)
      }
      lastProcessingAt = Date.now()
    }
  }
}

async function processShard(shardId: string) {
  const shardIteratorResult = await dynamodbstreams
    .getShardIterator({
      StreamArn: config('AWS_DYNAMO_STREAM_ARN'),
      ShardId: shardId,
      ShardIteratorType: 'TRIM_HORIZON',
    })
    .promise()

  let ShardIterator = shardIteratorResult.ShardIterator
  while (ShardIterator) {
    const records = await getRecords(ShardIterator)
    await processRecords(records)
    ShardIterator = records.NextShardIterator
  }
}

export async function startStreamProcessing() {
  const stream = await dynamodbstreams.describeStream({ StreamArn: config('AWS_DYNAMO_STREAM_ARN') }).promise()
  for (const shard of stream?.StreamDescription?.Shards || []) {
    // Process each shard in asynchronously (avoiding `await`)
    if (shard.ShardId) {
      processShard(shard.ShardId)
    }
  }
}

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

export async function latestReferrerRewardInUsd(referrerId: number, date: string): Promise<number> {
  const params = {
    TableName: 'channels',
    IndexName: 'referrerChannelId-index',
    KeyConditionExpression: '#referrerChannelId = :referrerId',
    FilterExpression: '#yppStatus = :status AND #createdAt >= :date',
    ExpressionAttributeNames: {
      '#referrerChannelId': 'referrerChannelId',
      '#yppStatus': 'yppStatus',
      '#createdAt': 'createdAt',
    },
    ExpressionAttributeValues: {
      ':referrerId': referrerId,
      ':status': 'Verified',
      ':date': date,
    },
  }

  const referredChannels = ((await documentClient.query(params).promise()).Items || []) as unknown as YtChannel[]

  let reward = 0
  for (const ch of referredChannels) {
    const tier = ch.statistics.subscriberCount < 5000 ? 1 : ch.statistics.subscriberCount < 50000 ? 2 : 3
    const rewardMultiplier = tier == 1 ? 1 : tier == 2 ? 2.5 : 5
    reward += config('BASE_REFERRAL_REWARD_IN_USD') * rewardMultiplier
  }

  return reward
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

export async function getAllVerifiedChannels(): Promise<YtChannel[]> {
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
        ':yppStatusVal': 'Verified',
      },
      ExclusiveStartKey: cursor,
    }

    const paginatedResponse = await documentClient.scan(params).promise()
    channels.push(...(paginatedResponse.Items as YtChannel[]))
    cursor = paginatedResponse.LastEvaluatedKey
  } while (cursor)

  return channels as YtChannel[]
}
