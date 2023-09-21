import * as aws from '@pulumi/aws'
import { resourcePrefix, Stats, WhitelistChannel, YtChannel, YtUser, YtVideo } from '../types/youtube'

const nameof = <T>(name: keyof T) => <string>name

const userTable = new aws.dynamodb.Table('users', {
  name: `${resourcePrefix}users`,
  hashKey: nameof<YtUser>('id'),
  attributes: [
    {
      name: nameof<YtUser>('id'),
      type: 'S',
    },
  ],
  billingMode: 'PAY_PER_REQUEST',
})

const channelsTable = new aws.dynamodb.Table('channels', {
  name: `${resourcePrefix}channels`,
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
    {
      name: nameof<YtChannel>('referrerChannelId'),
      type: 'N',
    },
  ],
  globalSecondaryIndexes: [
    {
      name: 'joystreamChannelId-createdAt-index',
      hashKey: nameof<YtChannel>('joystreamChannelId'),
      rangeKey: nameof<YtChannel>('createdAt'),
      projectionType: 'ALL',
    },
    {
      name: 'phantomKey-createdAt-index',
      hashKey: nameof<YtChannel>('phantomKey'), // we'll have a single value partition to enable sorting on createdAt
      rangeKey: nameof<YtChannel>('createdAt'),
      projectionType: 'ALL',
    },
    {
      hashKey: nameof<YtChannel>('id'),
      name: 'id-index',
      projectionType: 'ALL',
    },
    {
      hashKey: nameof<YtChannel>('referrerChannelId'),
      name: 'referrerChannelId-index',
      projectionType: 'ALL',
    },
  ],
  billingMode: 'PAY_PER_REQUEST',
})

const videosTable = new aws.dynamodb.Table('videos', {
  name: `${resourcePrefix}videos`,
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
    {
      name: 'publishedAt',
      type: 'S',
    },
  ],
  globalSecondaryIndexes: [
    {
      hashKey: nameof<YtVideo>('state'),
      rangeKey: nameof<YtVideo>('publishedAt'),
      name: 'state-publishedAt-index',
      projectionType: 'ALL',
    },
    {
      hashKey: nameof<YtVideo>('channelId'),
      rangeKey: nameof<YtVideo>('publishedAt'),
      name: 'channelId-publishedAt-index',
      projectionType: 'INCLUDE',
      nonKeyAttributes: ['state'],
    },
  ],
  billingMode: 'PAY_PER_REQUEST',
})

const statsTable = new aws.dynamodb.Table('stats', {
  name: `${resourcePrefix}stats`,
  hashKey: nameof<Stats>('partition'),
  rangeKey: nameof<Stats>('date'),
  attributes: [
    { name: nameof<Stats>('partition'), type: 'S' },
    { name: nameof<Stats>('date'), type: 'S' },
  ],
  billingMode: 'PAY_PER_REQUEST',
})

const whitelistChannelsTable = new aws.dynamodb.Table('whitelistChannels', {
  name: `${resourcePrefix}whitelistChannels`,
  hashKey: nameof<WhitelistChannel>('channelHandle'),
  attributes: [
    {
      name: nameof<WhitelistChannel>('channelHandle'),
      type: 'S',
    },
  ],
  billingMode: 'PAY_PER_REQUEST',
})

export const usersTableArn = userTable.arn
export const channelsTableArn = channelsTable.arn
export const videosTableArn = videosTable.arn
export const statsTableArn = statsTable.arn
export const whitelistChannelsTableArn = whitelistChannelsTable.arn
