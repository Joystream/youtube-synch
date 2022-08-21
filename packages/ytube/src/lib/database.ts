import { Channel, DomainError, Result, User, Video } from '@youtube-sync/domain'
import * as dynamoose from 'dynamoose'
import { ConditionInitalizer } from 'dynamoose/dist/Condition'
import { AnyDocument } from 'dynamoose/dist/Document'
import { Query, Scan } from 'dynamoose/dist/DocumentRetriever'
import { ModelType } from 'dynamoose/dist/General'
import { omit } from 'ramda'

export function createChannelModel(): ModelType<AnyDocument> {
  const channelSchema = new dynamoose.Schema(
    {
      // ID of the Youtube channel
      id: {
        type: String,
        rangeKey: true,
      },

      // ID of the user that owns the channel
      userId: {
        hashKey: true,
        type: String,
      },

      // ID of the corresponding Joystream Channel
      joystreamChannelId: Number,

      // Referrer Joystream Channel ID
      referrerJoystreamChannelId: Number,

      // Channel's title
      title: String,

      // Descripton of the channel
      description: String,

      // Channel's creation date
      createdAt: Number,

      // Whether this YT channels is verified by parther program or not
      isVerified: Boolean,

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
          global: true,
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
    },

    { saveUnknown: true }
  )
  return dynamoose.model('channels', channelSchema, { create: false })
}

export function createUserModel() {
  const userSchema = new dynamoose.Schema(
    {
      id: {
        type: String,
        rangeKey: true,
      },

      partition: {
        type: String,
        hashKey: true,
      },

      // User email
      email: String,

      // User youtube username
      youtubeUsername: String,

      // User Google ID
      googleId: String,

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
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    }
  )
  return dynamoose.model('users', userSchema, { create: false })
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
        enum: [
          // Newly created youtube video
          'New',
          // Video is being uploaded to Joystream
          'UploadStarted',
          // Video upload to Joystream failed
          'uploadFailed',
          // Video upload to Joystream succeeded
          'uploadSucceded',
          // Video was deleted from joystream, so it should not be synced again
          'NotToBeSyncedAgain',
        ],
      },
    },
    {
      saveUnknown: true,
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    }
  )
  return dynamoose.model('videos', videoSchema)
}

export function videoStateRepository() {
  const videoStateSchema = new dynamoose.Schema(
    {
      videoId: String,
      channelId: String,
      reason: String,
      state: {
        type: String,
        enum: [
          // Newly created youtube video
          'New',
          // Video is being uploaded to Joystream
          'UploadStarted',
          // Video upload to Joystream failed
          'uploadFailed',
          // Video upload to Joystream succeeded
          'uploadSucceded',
          // Video was deleted from joystream, so it should not be synced again
          'NotToBeSyncedAgain',
        ],
      },
    },
    {
      timestamps: {
        createdAt: 'loggedAt',
      },
    }
  )
  return dynamoose.model('videoLogs', videoStateSchema, { create: false })
}

export function statsRepository() {
  const schema = new dynamoose.Schema({
    partition: {
      type: String,
      hashKey: true,
    },
    date: {
      type: Number,
      rangeKey: true,
    },
    quotaUsed: Number,
  })
  return dynamoose.model('stats', schema, { create: false })
}

export function mapTo<TEntity>(doc: AnyDocument) {
  return doc.toJSON() as TEntity
}

export interface IRepository<T> {
  get(partition: string, id: string): Promise<Result<T, DomainError>>
  save(model: T, partition: string): Promise<Result<T, DomainError>>
  delete(partition: string, id: string): Promise<Result<void, DomainError>>
  query(init: ConditionInitalizer, f: (q: Query<AnyDocument>) => Query<AnyDocument>): Promise<Result<T[], DomainError>>
  scan(init: ConditionInitalizer, f: (q: Scan<AnyDocument>) => Scan<AnyDocument>): Promise<Result<T[], DomainError>>
  upsertAll(items: T[]): Promise<Result<T[], DomainError>>
}

export class UsersRepository implements IRepository<User> {
  /**
   *
   */
  private model: ModelType<AnyDocument>
  constructor() {
    this.model = createUserModel()
  }

  upsertAll(items: User[]): Promise<Result<User[], DomainError>> {
    throw new Error('Method not implemented.')
  }

  async scan(
    init: ConditionInitalizer,
    f: (q: Scan<AnyDocument>) => Scan<AnyDocument>
  ): Promise<Result<User[], DomainError>> {
    const results = await f(this.model.scan(init)).exec()
    return Result.Success(results.map((r) => mapTo<User>(r)))
  }

  async get(partition: string, id: string): Promise<Result<User, DomainError>> {
    const result = await this.model.get({ partition, id })
    return Result.Success(mapTo<User>(result))
  }

  async save(model: User, partition: string): Promise<Result<User, DomainError>> {
    const update = omit(['id', 'partition', 'updatedAt', 'createdAt'], model)
    const result = await this.model.update({ partition, id: model.id }, update)
    return Result.Success(mapTo<User>(result))
  }

  async delete(partition: string, id: string): Promise<Result<void, DomainError>> {
    await this.model.delete({ partition, id })
    return
  }

  async query(init: ConditionInitalizer, f: (q: Query<AnyDocument>) => Query<AnyDocument>) {
    const results = await f(this.model.query(init)).exec()
    return Result.Success(results.map((r) => mapTo<User>(r)))
  }
}
export class ChannelsRepository implements IRepository<Channel> {
  /**
   *
   */
  private model: ModelType<AnyDocument>
  constructor() {
    this.model = createChannelModel()
  }

  async upsertAll(channels: Channel[]): Promise<Result<Channel[], DomainError>> {
    const results = await Promise.all(channels.map(async (channel) => this.save(channel, channel.id)))
    console.log('results: ', channels, results)
    return Result.Success(results.map((r) => r.value))
  }

  async scan(
    init: ConditionInitalizer,
    f: (q: Scan<AnyDocument>) => Scan<AnyDocument>
  ): Promise<Result<Channel[], DomainError>> {
    const results = await f(this.model.scan(init)).exec()
    return Result.Success(results.map((r) => mapTo<Channel>(r)))
  }

  async get(partition: string, id: string): Promise<Result<Channel, DomainError>> {
    const result = await this.model.get({ userId: partition, id })
    return Result.Success(mapTo<Channel>(result))
  }

  async save(channel: Channel, partition: string): Promise<Result<Channel, DomainError>> {
    const result = await this.model.update(
      { userId: partition, id: channel.id },
      {
        shouldBeIngested: channel.shouldBeIngested,
        chainMetadata: channel.chainMetadata,
      }
    )
    return Result.Success(mapTo<Channel>(result))
  }

  async delete(partition: string, id: string): Promise<Result<void, DomainError>> {
    await this.model.delete({ userId: partition, id })
    return
  }

  async query(init: ConditionInitalizer, f: (q: Query<AnyDocument>) => Query<AnyDocument>) {
    const results = await f(this.model.query(init)).exec()
    return Result.Success(results.map((r) => mapTo<Channel>(r)))
  }
}

export class VideosRepository implements IRepository<Video> {
  /**
   *
   */
  private model: ModelType<AnyDocument>
  constructor() {
    this.model = videoRepository()
  }

  upsertAll(items: Video[]): Promise<Result<Video[], DomainError>> {
    throw new Error('Method not implemented.')
  }

  async scan(
    init: ConditionInitalizer,
    f: (q: Scan<AnyDocument>) => Scan<AnyDocument>
  ): Promise<Result<Video[], DomainError>> {
    const results = await f(this.model.scan(init)).exec()
    return Result.Success(results.map((r) => mapTo<Video>(r)))
  }

  /**
   *
   * @param partition
   * @param id
   * @returns
   */
  async get(partition: string, id: string): Promise<Result<Video, DomainError>> {
    const result = await this.model.get({ channelId: partition, id })
    return Result.Success(mapTo<Video>(result))
  }

  async save(model: Video, partition: string): Promise<Result<Video, DomainError>> {
    const upd = omit(['id', 'channelId', 'createdAt', 'updatedAt'], model)
    const result = await this.model.update({ channelId: model.channelId, id: model.id }, upd)
    return Result.Success(mapTo<Video>(result))
  }

  async delete(partition: string, id: string): Promise<Result<void, DomainError>> {
    await this.model.delete({ id, channelId: partition })
    return
  }

  async query(init: ConditionInitalizer, f: (q: Query<AnyDocument>) => Query<AnyDocument>) {
    const results = await f(this.model.query(init)).exec()
    return Result.Success(results.map((r) => mapTo<Video>(r)))
  }
}
