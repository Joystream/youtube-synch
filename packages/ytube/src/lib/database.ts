import { Channel, DomainError, Result, User, Video } from '@youtube-sync/domain';
import * as dynamoose from 'dynamoose';
import { ConditionInitalizer } from 'dynamoose/dist/Condition';
import { AnyDocument } from 'dynamoose/dist/Document';
import { Query, Scan } from 'dynamoose/dist/DocumentRetriever';
import { ModelType } from 'dynamoose/dist/General';

export function createChannelModel() {
  const channelSchema = new dynamoose.Schema({
    id: {
      type: String,
      rangeKey: true,
    },
    title: String,
    frequency: {
      type: Number,
      index: {
        global: true,
        rangeKey: 'id',
        name: 'frequency-id-index',
      },
    },
    description: String,
    userId: {
      hashKey: true,
      type: String,
    },
    createdAt: Number,
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
    statistics: {
      type: Object,
      schema: {
        viewCount: Number,
        commentCount: Number,
        subscriberCount: Number,
        videoCount: Number,
      },
    },
    userAccessToken: String,
    userRefreshToken: String,
    uploadsPlaylistId: String,
    shouldBeIngested: {
      type: Boolean,
      default: true,
    },
  });
  return dynamoose.model('channels', channelSchema, {create: false});
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
      email: String,
      youtubeUsername: String,
      googleId: String,
      accessToken: String,
      refreshToken: String,
      avatarUrl: String,
      channelsCount: Number,
    },
    {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    }
  );
  return dynamoose.model('users', userSchema, {create: false});
}
export function videoRepository() {
  const videoSchema = new dynamoose.Schema(
    {
      url: String,
      title: String,
      description: String,
      channelId: {
        type: String,
        hashKey: true,
      },
      id: {
        type: String,
        rangeKey: true,
      },
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
      state: {
        type: String,
        enum: [
          'new',
          'uploadToJoystreamStarted',
          'uploadToJoystreamFailed',
          'uploadToJoystreamSucceded',
        ],
      },
    },
    {
      timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
      },
    }
  );
  return dynamoose.model('videos', videoSchema);
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
          'new',
          'uploadToJoystreamStarted',
          'uploadToJoystreamFailed',
          'uploadToJoystreamSucceded',
        ],
      },
    },
    {
      timestamps: {
        createdAt: 'loggedAt',
      },
    }
  );
  return dynamoose.model('videoLogs', videoStateSchema, {create: false});
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
  });
  return dynamoose.model('stats', schema, {create: false});
}
export function mapTo<TEntity>(doc: AnyDocument) {
  return doc.toJSON() as TEntity;
}

export interface IRepository<T>{
  get(partition:string, id: string):Promise<Result<T, DomainError>>;
  save(model: T, partition: string) : Promise<Result<T, DomainError>>;
  delete(partition: string, id: string) : Promise<Result<void, DomainError>>
  query(init: ConditionInitalizer, f: (q: Query<AnyDocument>) => Query<AnyDocument>) : Promise<Result<T[], DomainError>>
  scan(init: ConditionInitalizer, f: (q: Scan<AnyDocument>) => Scan<AnyDocument>) : Promise<Result<T[], DomainError>>
  upsertAll(items: T[]) : Promise<Result<T[], DomainError>>
}

export class UsersRepository implements IRepository<User>{
  /**
   *
   */
  private model: ModelType<AnyDocument>
  constructor() {
    this.model = createUserModel();
  }
  upsertAll(items: User[]): Promise<Result<User[], DomainError>> {
    throw new Error('Method not implemented.');
  }
  async scan(init: ConditionInitalizer, f: (q: Scan<AnyDocument>) => Scan<AnyDocument>): Promise<Result<User[], DomainError>> {
    const results = await f(this.model.scan(init)).exec();
    return Result.Success(results.map(r => mapTo<User>(r)))
  }
  async get(partition: string, id: string): Promise<Result<User, DomainError>> {
    const result = await this.model.get({partition, id});
    return Result.Success(mapTo<User>(result));
  }
  async save(model: User, partition: string): Promise<Result<User, DomainError>> {
    const result = await this.model.update({...model, partition});
    return Result.Success(mapTo<User>(result));
  }
  async delete(partition: string, id: string): Promise<Result<void, DomainError>> {
    await this.model.delete({partition, id});
    return;
  }
  async query(init: ConditionInitalizer, f: (q: Query<AnyDocument>) => Query<AnyDocument>) {
    const results = await f(this.model.query(init)).exec();
    return Result.Success(results.map(r => mapTo<User>(r)))
  }
}
export class ChannelsRepository implements IRepository<Channel>{
  /**
   *
   */
  private model: ModelType<AnyDocument>
  constructor() {
    this.model = createChannelModel();
  }
  upsertAll(items: Channel[]): Promise<Result<Channel[], DomainError>> {
    throw new Error('Method not implemented.');
  }
  async scan(init: ConditionInitalizer, f: (q: Scan<AnyDocument>) => Scan<AnyDocument>): Promise<Result<Channel[], DomainError>> {
    const results = await f(this.model.scan(init)).exec();
    return Result.Success(results.map(r => mapTo<Channel>(r)))
  }
  async get(partition: string, id: string): Promise<Result<Channel, DomainError>> {
    const result = await this.model.get({userId: partition, id});
    return Result.Success(mapTo<Channel>(result));
  }
  async save(model: Channel, partition: string): Promise<Result<Channel, DomainError>> {
    const result = await this.model.update({...model, userId: partition});
    return Result.Success(mapTo<Channel>(result));
  }
  async delete(partition: string, id: string): Promise<Result<void, DomainError>> {
    await this.model.delete({userId: partition, id});
    return;
  }
  async query(init: ConditionInitalizer, f: (q: Query<AnyDocument>) => Query<AnyDocument>) {
    const results = await f(this.model.query(init)).exec();
    return Result.Success(results.map(r => mapTo<Channel>(r)))
  }
}

export class VideosRepository implements IRepository<Video>{
  /**
   *
   */
  private model: ModelType<AnyDocument>
  constructor() {
    this.model = createUserModel();
  }
  upsertAll(items: Video[]): Promise<Result<Video[], DomainError>> {
    throw new Error('Method not implemented.');
  }
  async scan(init: ConditionInitalizer, f: (q: Scan<AnyDocument>) => Scan<AnyDocument>): Promise<Result<Video[], DomainError>> {
    const results = await f(this.model.scan(init)).exec();
    return Result.Success(results.map(r => mapTo<Video>(r)))
  }
  async get(partition: string, id: string): Promise<Result<Video, DomainError>> {
    const result = await this.model.get({channelId: partition, id});
    return Result.Success(mapTo<Video>(result));
  }
  async save(model: Video, partition: string): Promise<Result<Video, DomainError>> {
    const result = await this.model.update(model);
    return Result.Success(mapTo<Video>(result));
  }
  async delete(partition: string, id: string): Promise<Result<void, DomainError>> {
    await this.model.delete({id, channelId: partition});
    return;
  }
  async query(init: ConditionInitalizer, f: (q: Query<AnyDocument>) => Query<AnyDocument>) {
    const results = await f(this.model.query(init)).exec();
    return Result.Success(results.map(r => mapTo<Video>(r)))
  }
}

