import AsyncLock from 'async-lock'
import * as dynamoose from 'dynamoose'
import { ConditionInitializer } from 'dynamoose/dist/Condition'
import { AnyItem } from 'dynamoose/dist/Item'
import { Query, QueryResponse, Scan, ScanResponse } from 'dynamoose/dist/ItemRetriever'
import { omit } from 'ramda'
import { DYNAMO_MODEL_OPTIONS, IRepository, mapTo } from '.'
import { ResourcePrefix, YtChannel, channelYppStatus } from '../types/youtube'

function createChannelModel(tablePrefix: ResourcePrefix) {
  const channelSchema = new dynamoose.Schema(
    {
      // ID of the Youtube channel
      id: {
        type: String,
        rangeKey: true,
      },

      // ID of the user that owns the channel
      userId: {
        type: String,
        hashKey: true,
      },

      // user provided email
      email: String,

      // ID of the corresponding Joystream Channel
      joystreamChannelId: {
        type: Number,
        index: {
          type: 'global',
          rangeKey: 'createdAt',
          name: 'joystreamChannelId-createdAt-index',
        },
      },

      // video category ID to be added to all synced videos
      videoCategoryId: String,

      // default language of youtube channel
      language: String,

      // language of corresponding Joystream channel
      joystreamChannelLanguageIso: String,

      // Referrer's Joystream Channel ID
      referrerChannelId: Number,

      // Channel's title
      title: String,

      // Description of the channel
      description: String,

      // Youtube channel creation date
      publishedAt: String,

      // Timestamp of the last action performed by channel owner (using its owner controller keys)
      lastActedAt: {
        type: {
          value: Date,
          settings: {
            storage: 'iso',
          },
        },
        get: (value: any) => {
          return new Date(value)
        },
      },

      // Channel's statistics
      statistics: {
        type: Object,
        schema: {
          // Total views
          viewCount: Number,

          // Total comments
          commentCount: Number,

          // Total subscribers
          subscriberCount: Number,

          // Total videos
          videoCount: Number,
        },
      },

      thumbnails: {
        type: Object,
        schema: {
          default: String,
          medium: String,
          high: String,
          maxRes: String,
          standard: String,
        },
      },

      // user access token obtained from authorization code after successful authentication
      userAccessToken: String,

      // user refresh token that will be used to get new access token after expiration
      userRefreshToken: String,

      uploadsPlaylistId: String,

      // Should this channel be ingested for automated Youtube/Joystream syncing?
      shouldBeIngested: {
        type: Boolean,
        default: true,
      },

      // Should this channel be ingested for automated Youtube/Joystream syncing without explicit authorization granted to app?
      performUnauthorizedSync: {
        type: Boolean,
        default: false,
      },

      // Channel's YPP program participation status
      yppStatus: {
        type: String,
        enum: channelYppStatus,
      },

      phantomKey: {
        type: String,
        index: {
          type: 'global',
          rangeKey: 'createdAt',
          name: 'phantomKey-createdAt-index',
        },
      },
    },

    {
      saveUnknown: false,
      timestamps: {
        createdAt: {
          createdAt: {
            type: {
              value: Date,
              settings: {
                storage: 'iso',
              },
            },
          },
        },
        updatedAt: {
          updatedAt: {
            type: {
              value: Date,
              settings: {
                storage: 'iso',
              },
            },
          },
        },
      },
    }
  )
  return dynamoose.model(`${tablePrefix}channels`, channelSchema, DYNAMO_MODEL_OPTIONS)
}

export class ChannelsRepository implements IRepository<YtChannel> {
  private model

  // lock any updates on video table
  private readonly ASYNC_LOCK_ID = 'channel'
  private asyncLock: AsyncLock = new AsyncLock()

  constructor(tablePrefix: ResourcePrefix) {
    this.model = createChannelModel(tablePrefix)
  }

  async upsertAll(channels: YtChannel[]): Promise<YtChannel[]> {
    const results = await Promise.all(channels.map(async (channel) => await this.save(channel)))
    return results
  }

  async scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<YtChannel[]> {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      let lastKey = undefined
      const results = []
      do {
        let scannedBatch: ScanResponse<AnyItem> = await f(this.model.scan(init))
          .startAt(lastKey as any)
          .exec()
        let batchResult = scannedBatch.map((b) => mapTo<YtChannel>(b))
        results.push(...batchResult)
        lastKey = scannedBatch.lastKey
      } while (lastKey)
      return results
    })
  }

  async get(id: string): Promise<YtChannel | undefined> {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      const [result] = await this.model.query({ id }).using('id-index').exec()
      return result ? mapTo<YtChannel>(result) : undefined
    })
  }

  async save(channel: YtChannel): Promise<YtChannel> {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      const update = omit(['id', 'userId', 'updatedAt'], channel)
      const result = await this.model.update({ id: channel.id, userId: channel.userId }, update)
      return mapTo<YtChannel>(result)
    })
  }

  async delete(id: string, userId: string): Promise<void> {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      await this.model.delete({ id, userId })
      return
    })
  }

  async query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>) {
    return this.asyncLock.acquire(this.ASYNC_LOCK_ID, async () => {
      let lastKey = undefined
      const results = []
      do {
        let queriedBatch: QueryResponse<AnyItem> = await f(this.model.query(init))
          .startAt(lastKey as any)
          .exec()
        let batchResult = queriedBatch.map((b) => mapTo<YtChannel>(b))
        results.push(...batchResult)
        lastKey = queriedBatch.lastKey
      } while (lastKey)
      return results
    })
  }
}

export class ChannelsService {
  constructor(private channelsRepository: ChannelsRepository) {}

  /**
   * @param joystreamChannelId
   * @returns Returns channel by joystreamChannelId
   */
  async getByJoystreamChannelId(joystreamChannelId: number): Promise<YtChannel> {
    const [result] = await this.channelsRepository.query({ joystreamChannelId }, (q) =>
      q.sort('descending').using('joystreamChannelId-createdAt-index')
    )
    if (!result) {
      throw new Error(`Could not find channel with id ${joystreamChannelId}`)
    }
    return result
  }

  /**
   * @param channelId
   * @returns Returns channel by youtube channelId
   */
  async getByChannelId(channelId: string): Promise<YtChannel> {
    const result = await this.channelsRepository.get(channelId.toString())
    if (!result) {
      throw new Error(`Could not find channel with id ${channelId}`)
    }
    return result
  }

  /**
   * @param userId
   * @returns Returns channel by userId
   */
  async getByUserId(userId: string): Promise<YtChannel> {
    const [result] = await this.channelsRepository.query('userId', (q) => q.eq(userId))
    if (!result) {
      throw new Error(`Could not find user with id ${userId}`)
    }
    return result
  }

  /**
   * @param userId
   * @returns List of Channels for given user
   */
  async getAll(userId: string): Promise<YtChannel[]> {
    return await this.channelsRepository.query({ userId }, (q) => q)
  }

  /**
   * @param count Number of record to retrieve
   * @returns List of `n` recent verified channels
   */
  async getRecent(count: number): Promise<YtChannel[]> {
    return this.channelsRepository.query({ phantomKey: 'phantomData' }, (q) =>
      q.sort('descending').limit(count).using('phantomKey-createdAt-index')
    )
  }

  /**
   *
   * @param channel
   * @returns Updated channel
   */
  async save(channel: YtChannel): Promise<YtChannel> {
    return await this.channelsRepository.save(channel)
  }
}
