import * as aws from '@pulumi/aws'
import { Stats, YtChannel, YtUser, YtVideo } from '../types/youtube'

const nameof = <T>(name: keyof T) => <string>name
const resourceSuffix = String(process.env.DEPLOYMENT_ENV)

const userTable = new aws.dynamodb.Table('users', {
  name: 'users',
  hashKey: nameof<YtUser>('id'),
  attributes: [
    {
      name: nameof<YtUser>('id'),
      type: 'S',
    },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
  tags: { environment: resourceSuffix },
})

const channelsTable = new aws.dynamodb.Table('channels', {
  name: 'channels',
  hashKey: nameof<YtChannel>('userId'),
  rangeKey: nameof<YtChannel>('id'),
  attributes: [
    {
      name: nameof<YtChannel>('userId'),
      type: 'S',
    },
    {
      name: nameof<YtChannel>('id'),
      type: 'S',
    },
    {
      name: nameof<YtChannel>('joystreamChannelId'),
      type: 'N',
    },
    {
      name: nameof<YtChannel>('createdAt'),
      type: 'S',
    },
    {
      name: nameof<YtChannel>('phantomKey'),
      type: 'S',
    },
  ],
  billingMode: 'PROVISIONED',
  globalSecondaryIndexes: [
    {
      name: 'joystreamChannelId-createdAt-index',
      hashKey: nameof<YtChannel>('joystreamChannelId'), // we'll have a single value partition
      rangeKey: nameof<YtChannel>('createdAt'),
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
    {
      name: 'phantomKey-createdAt-index',
      hashKey: nameof<YtChannel>('phantomKey'), // we'll have a single value partition
      rangeKey: nameof<YtChannel>('createdAt'),
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
    {
      hashKey: nameof<YtChannel>('id'),
      name: 'id-index',
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
  ],
  readCapacity: 1,
  writeCapacity: 1,
  tags: { environment: resourceSuffix },
})

const videosTable = new aws.dynamodb.Table('videos', {
  name: 'videos',
  hashKey: nameof<YtVideo>('channelId'),
  rangeKey: nameof<YtVideo>('id'),
  attributes: [
    {
      name: nameof<YtVideo>('channelId'),
      type: 'S',
    },
    {
      name: nameof<YtVideo>('id'),
      type: 'S',
    },
    {
      name: nameof<YtVideo>('state'),
      type: 'S',
    },
  ],
  globalSecondaryIndexes: [
    {
      hashKey: nameof<YtVideo>('state'),
      rangeKey: nameof<YtVideo>('channelId'),
      name: 'state-channelId-index',
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 10,
  writeCapacity: 10,
  tags: { environment: resourceSuffix },
})

const statsTable = new aws.dynamodb.Table('stats', {
  name: 'stats',
  hashKey: nameof<Stats>('partition'),
  rangeKey: nameof<Stats>('date'),
  attributes: [
    { name: nameof<Stats>('partition'), type: 'S' },
    { name: nameof<Stats>('date'), type: 'S' },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
  tags: { environment: resourceSuffix },
})

export const usersTableArn = userTable.arn
export const channelsTableArn = channelsTable.arn
export const videosTableArn = videosTable.arn
export const statsTableArn = statsTable.arn
