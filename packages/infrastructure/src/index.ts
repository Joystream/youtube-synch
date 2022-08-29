import * as aws from '@pulumi/aws'
// pulumi doesn't work properly with monorepos atm
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { User, Channel, Video, VideoEvent, Stats } from '../../domain/src'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AvailableTopic } from '../../ytube/src'

const nameof = <T>(name: keyof T) => <string>name

const userTable = new aws.dynamodb.Table('users', {
  name: 'users',
  hashKey: nameof<User>('id'),
  attributes: [
    {
      name: nameof<User>('id'),
      type: 'S',
    },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
})

const channelsTable = new aws.dynamodb.Table('channels', {
  name: 'channels',
  hashKey: nameof<Channel>('userId'),
  rangeKey: nameof<Channel>('id'),
  attributes: [
    {
      name: nameof<Channel>('userId'),
      type: 'S',
    },
    {
      name: nameof<Channel>('id'),
      type: 'S',
    },
    {
      name: nameof<Channel>('frequency'),
      type: 'N',
    },
  ],
  billingMode: 'PROVISIONED',
  globalSecondaryIndexes: [
    {
      hashKey: nameof<Channel>('frequency'),
      name: 'frequency-id-index',
      rangeKey: 'id',
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
  ],
  readCapacity: 1,
  writeCapacity: 1,
})

const videosTable = new aws.dynamodb.Table('videos', {
  name: 'videos',
  hashKey: nameof<Video>('channelId'),
  rangeKey: nameof<Video>('id'),
  attributes: [
    {
      name: nameof<Video>('channelId'),
      type: 'S',
    },
    {
      name: nameof<Video>('id'),
      type: 'S',
    },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
})

const videoLogsTable = new aws.dynamodb.Table('videoLogs', {
  attributes: [
    {
      name: 'videoId',
      type: 'S',
    },
    {
      name: 'channelId',
      type: 'S',
    },
  ],
  name: 'videoLogs',
  hashKey: nameof<VideoEvent>('channelId'), // we'll have a single partition for users
  rangeKey: nameof<VideoEvent>('videoId'),
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
})

const statsTable = new aws.dynamodb.Table('stats', {
  name: 'stats',
  hashKey: nameof<Stats>('partition'),
  rangeKey: nameof<Stats>('date'),
  attributes: [
    { name: nameof<Stats>('partition'), type: 'S' },
    { name: nameof<Stats>('date'), type: 'N' },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
})

const userEventsTopic = new aws.sns.Topic(<AvailableTopic>'userEvents', {
  displayName: 'Users events',
  name: <AvailableTopic>'userEvents',
})

const channelEventsTopic = new aws.sns.Topic(<AvailableTopic>'channelEvents', {
  displayName: 'Channels events',
  name: <AvailableTopic>'channelEvents',
})

const videoEvents = new aws.sns.Topic(<AvailableTopic>'videoEvents', {
  name: <AvailableTopic>'videoEvents',
  displayName: 'Videos events',
})

export const usersTableArn = userTable.arn
export const channelsTableArn = channelsTable.arn
export const videosTableArn = videosTable.arn
export const videoLogsTableArn = videoLogsTable.arn
export const statsTableArn = statsTable.arn

export const videosTopicArn = videoEvents.arn
export const channelsTopicArn = channelEventsTopic.arn
export const usersTopicArn = userEventsTopic.arn
