import AWS from './aws-config'
import { loadConfig as config } from './config'
import { addOrUpdateYppContact, getYppContactByEmail } from './hubspot'
import { getAllVerifiedChannels } from './recheckVideoState'

const dynamodbstreams = new AWS.DynamoDBStreams({ apiVersion: '2012-08-10' })

async function getRecords(ShardIterator: string) {
  return dynamodbstreams.getRecords({ ShardIterator }).promise()
}

let lastProcessingAt = 0
let isProcessing = false
async function processRecords(records: AWS.DynamoDBStreams.GetRecordsOutput) {
  console.log('total records', records.Records?.length)
  if (records.Records?.find((r) => r.eventName === 'MODIFY')) {
    console.log('found modify')

    if (!isProcessing && lastProcessingAt < Date.now() - 180000) {
      isProcessing = true
      // setTimeout(async () => {
      console.log('timeout')
      const channels = await getAllVerifiedChannels()
      for (const ch of channels) {
        const contactId = await getYppContactByEmail(ch.email)
        await addOrUpdateYppContact(ch, contactId)
      }
      // }, 180000) // 3 minutes
      lastProcessingAt = Date.now()
    }
  }
}

async function processShard(shardId: string) {
  const shardIteratorResult = await dynamodbstreams
    .getShardIterator({
      StreamArn: config().AWS_DYNAMO_STREAM_ARN,
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
  const stream = await dynamodbstreams.describeStream({ StreamArn: config().AWS_DYNAMO_STREAM_ARN }).promise()
  for (const shard of stream?.StreamDescription?.Shards || []) {
    // Process each shard in asynchronously (avoiding `await`)
    if (shard.ShardId) {
      processShard(shard.ShardId)
    }
  }
}
