import AWS from 'aws-sdk'
import { loadConfig as config } from './config'
import { addOrUpdateYppContact, getYppContactByEmail } from './hubspot'
import { YtChannel } from './types'

AWS.config.update({
  region: config().AWS_REGION,
  credentials: {
    accessKeyId: config().AWS_ACCESS_KEY_ID,
    secretAccessKey: config().AWS_SECRET_ACCESS_KEY,
  },
})

const dynamodbstreams = new AWS.DynamoDBStreams({ apiVersion: '2012-08-10' })

async function getRecords(ShardIterator: any) {
  return dynamodbstreams.getRecords({ ShardIterator }).promise()
}

async function processRecords(records: any) {
  console.log('total records', records.Records.length)
  for (const record of records.Records) {
    if (record.eventName === 'MODIFY') {
      const oldItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage) as YtChannel
      const newItem = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as YtChannel

      // Get existing contact in Hubspot against email (if any)

      // Add new item to Hubspot
      if (newItem.yppStatus === 'Verified') {
        const contactId = await getYppContactByEmail(newItem.email)
        await addOrUpdateYppContact(newItem, contactId)
      }
    }
  }
}

async function processShard(shardId: any) {
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
  //   const stream = await dynamodbstreams.describeStream({ StreamArn: config().AWS_DYNAMO_STREAM_ARN }).promise()
  //   for (const shard of stream?.StreamDescription?.Shards || []) {
  //     // Process each shard in asynchronously (avoiding `await`)
  //     processShard(shard.ShardId)
  //   }
}
