import { Channel, Stats, User, Video, channelYppStatus, videoStates } from '@youtube-sync/domain'
import * as dynamoose from 'dynamoose'
import { ConditionInitializer } from 'dynamoose/dist/Condition'
import { AnyItem } from 'dynamoose/dist/Item'
import { Query, Scan } from 'dynamoose/dist/ItemRetriever'
import { DeepPartial, ModelType } from 'dynamoose/dist/General'
import { TableOptions } from 'dynamoose/dist/Table'
import { omit } from 'ramda'

// Schemas defined here are only for modeling purpose and not for creating tables itself,
// as Pulumi is responsible all sort of infrastructure provisioning and deployment.
const DYNAMO_MODEL_OPTIONS: DeepPartial<TableOptions> = { create: false }

export function createChannelModel() {
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

      // Channel Ingestion frequency
      frequency: {
        type: Number,
        index: {
          type: 'global',
          rangeKey: 'id',
          name: 'frequency-id-index',
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
      saveUnknown: true,
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
  return dynamoose.model('channels', channelSchema, DYNAMO_MODEL_OPTIONS)
}

export function createUserModel() {
  const userSchema = new dynamoose.Schema(
    {
      id: {
        type: String,
        hashKey: true,
      },

      // User email
      email: String,

      // User youtube username
      youtubeUsername: String,

      // User Google ID
      googleId: String,

      // user authorization code
      authorizationCode: String,

      // user access token obtained from authorization code after successful authentication
      accessToken: String,

      // user refresh token that will be used to get new access token after expiration
      refreshToken: String,

      // User avatar url
      avatarUrl: String,

      // User Youtube channels count
      channelsCount: Number,
    },
    {
      saveUnknown: true,
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
  return dynamoose.model('users', userSchema, DYNAMO_MODEL_OPTIONS)
}

export function videoRepository() {
  const videoSchema = new dynamoose.Schema(
    {
      // ID of the video
      id: {
        type: String,
        rangeKey: true,
      },

      // Channel ID of the associated video
      channelId: {
        type: String,
        hashKey: true,
      },

      // Video's url
      url: String,

      // Video's title
      title: String,

      // Video's description
      description: String,

      // Video's playlist ID
      playlistId: String,

      resourceId: String,

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

      //
      state: {
        type: String,
        enum: videoStates,
      },

      // Joystream video category to be assigned to synced videos
      category: String,

      // language of the synced video (derived from corresponding Youtube channel)
      language: String,

      // video duration in seconds
      duration: Number,

      // The status of the uploaded video on Youtube.
      uploadStatus: String,

      // The privacy status of the youtube
      privacyStatus: String,

      // License of the youtube video
      license: String,

      // Video's container
      container: String,

      // joystream video ID in `VideoCreated` event response, returned from joystream runtime after creating a video
      joystreamVideo: {
        type: Object,

        schema: {
          // Joystream runtime Video ID for successfully synced video
          id: String,

          // Data Object IDs (first element is the video, the second is the thumbnail)
          assetIds: {
            type: Array,
            schema: [String],
          },
        },
      },
    },
    {
      saveUnknown: true,
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
  return dynamoose.model('videos', videoSchema, DYNAMO_MODEL_OPTIONS)
}

export function videoStateRepository(): ModelType<AnyItem> {
  const videoStateSchema = new dynamoose.Schema(
    {
      // ID of the video
      videoId: String,

      // Channel ID of the associated video
      channelId: String,

      reason: String,

      // Video current state
      state: {
        type: String,
        enum: videoStates,
      },

      expectedSyncTime: Date,
    },

    {
      timestamps: {
        createdAt: 'loggedAt',
      },
    }
  )
  return dynamoose.model('videoLogs', videoStateSchema, DYNAMO_MODEL_OPTIONS)
}

export function statsRepository() {
  const schema = new dynamoose.Schema({
    partition: {
      type: String,
      hashKey: true,
    },
    date: {
      type: String,
      rangeKey: true,
    },
    syncQuotaUsed: Number,
    signupQuotaUsed: Number,
  })
  return dynamoose.model('stats', schema, DYNAMO_MODEL_OPTIONS)
}

export function mapTo<TEntity>(doc: AnyItem) {
  return doc.serialize() as TEntity
}

export interface IRepository<T> {
  get(partition: string, id: string): Promise<T | undefined>
  save(model: T, partition: string): Promise<T>
  delete(partition: string, id: string): Promise<void>
  query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>): Promise<T[]>
  scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<T[]>
  upsertAll(items: T[]): Promise<T[]>
}

export class UsersRepository implements IRepository<User> {
  private model
  constructor() {
    this.model = createUserModel()
  }

  async upsertAll(users: User[]): Promise<User[]> {
    const results = await Promise.all(users.map(async (user) => this.save(user)))
    return results
  }

  async scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<User[]> {
    const results = await f(this.model.scan(init)).exec()
    return results.map((r) => mapTo<User>(r))
  }

  async get(id: string): Promise<User | undefined> {
    const result = await this.model.get({ id })
    return result ? mapTo<User>(result) : undefined
  }

  async save(user: User): Promise<User> {
    const update = omit(['id', 'updatedAt'], user)
    const result = await this.model.update({ id: user.id }, update)
    return mapTo<User>(result)
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ id })
    return
  }

  async query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>) {
    const results = await f(this.model.query(init)).exec()
    return results.map((r) => mapTo<User>(r))
  }
}

export class ChannelsRepository implements IRepository<Channel> {
  private model
  constructor() {
    this.model = createChannelModel()
  }

  async upsertAll(channels: Channel[]): Promise<Channel[]> {
    const results = await Promise.all(channels.map(async (channel) => await this.save(channel)))
    return results
  }

  async scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<Channel[]> {
    const results = await f(this.model.scan(init)).exec()
    return results.map((r) => mapTo<Channel>(r))
  }

  async get(id: string): Promise<Channel | undefined> {
    const [result] = await this.model.query({ id }).using('id-index').exec()
    return result ? mapTo<Channel>(result) : undefined
  }

  async save(channel: Channel): Promise<Channel> {
    const update = omit(['id', 'userId', 'updatedAt'], channel)
    const result = await this.model.update({ id: channel.id, userId: channel.userId }, update)
    return mapTo<Channel>(result)
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.model.delete({ id, userId })
    return
  }

  async query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>) {
    const results = await f(this.model.query(init)).exec()
    return results.map((r) => mapTo<Channel>(r))
  }
}

export class VideosRepository implements IRepository<Video> {
  private model
  constructor() {
    this.model = videoRepository()
  }

  async upsertAll(videos: Video[]): Promise<Video[]> {
    const results = await Promise.all(videos.map(async (video) => await this.save(video)))
    return results
  }

  async scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<Video[]> {
    const results = await f(this.model.scan(init)).exec()
    return results.map((r) => mapTo<Video>(r))
  }

  /**
   *
   * @param partition channel id to get videos for
   * @param id ID of the video
   * @returns
   */
  async get(channelId: string, id: string): Promise<Video | undefined> {
    const result = await this.model.get({ channelId, id })
    return result ? mapTo<Video>(result) : undefined
  }

  async save(model: Video): Promise<Video> {
    const upd = omit(['id', 'channelId', 'updatedAt'], model)
    const result = await this.model.update({ channelId: model.channelId, id: model.id }, upd)
    return mapTo<Video>(result)
  }

  async delete(partition: string, id: string): Promise<void> {
    await this.model.delete({ id, channelId: partition })
    return
  }

  async query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>): Promise<Video[]> {
    const results = await f(this.model.query(init)).exec()
    return results.map((r) => mapTo<Video>(r))
  }
}
export class StatsRepository implements IRepository<Stats> {
  private model
  constructor() {
    this.model = statsRepository()
  }

  async getModel() {
    return this.model
  }

  async getOrSetTodaysStats(): Promise<Stats> {
    // Quota resets at Pacific Time, and pst is 8 hours behind UTC
    const today = new Date().toLocaleDateString('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'full',
    })

    // Get today's stats
    let stats = await this.get(today)

    if (!stats) {
      const statsDoc = await this.model.update({
        partition: 'stats',
        date: today,
        syncQuotaUsed: 0,
        signupQuotaUsed: 0,
      })
      stats = mapTo<Stats>(statsDoc)
    }

    return stats
  }

  async upsertAll(): Promise<Stats[]> {
    throw new Error('Not implemented')
  }

  async scan(init: ConditionInitializer, f: (q: Scan<AnyItem>) => Scan<AnyItem>): Promise<Stats[]> {
    const results = await f(this.model.scan(init)).exec()
    return results.map((r) => mapTo<Stats>(r))
  }

  async get(date: string): Promise<Stats | undefined> {
    const result = await this.model.get({ partition: 'stats', date })
    return result ? mapTo<Stats>(result) : undefined
  }

  async save(model: Stats): Promise<Stats> {
    const update = omit(['id', 'updatedAt'], model)
    const result = await this.model.update({ partition: 'stats', date: model.date }, update)
    return mapTo<Stats>(result)
  }

  async delete(id: string): Promise<void> {
    throw Error('Deleting Youtube Quota stats is not implemented')
  }

  async query(init: ConditionInitializer, f: (q: Query<AnyItem>) => Query<AnyItem>) {
    const results = await f(this.model.query(init)).exec()
    return results.map((r) => mapTo<Stats>(r))
  }
}
