import * as dynamoose from 'dynamoose'
import { ReadonlyConfig } from '../types'
import { ResourcePrefix, resourcePrefix } from '../types/youtube'
import { ChannelsRepository, ChannelsService } from './channel'
import { StatsRepository } from './stats'
import { UsersRepository, UsersService } from './user'
import { VideosRepository, VideosService } from './video'

interface IDynamodbClient {
  channels: ChannelsRepository
  users: UsersRepository
  videos: VideosRepository
  stats: StatsRepository
}

const DynamodbClient = {
  create(tablePrefix: ResourcePrefix): IDynamodbClient {
    return {
      channels: new ChannelsRepository(tablePrefix),
      users: new UsersRepository(tablePrefix),
      videos: new VideosRepository(tablePrefix),
      stats: new StatsRepository(tablePrefix),
    }
  },
}

export interface IDynamodbService {
  repo: IDynamodbClient
  channels: ChannelsService
  users: UsersService
  videos: VideosService
}

export class DynamodbService implements IDynamodbService {
  readonly repo: IDynamodbClient
  readonly channels: ChannelsService
  readonly users: UsersService
  readonly videos: VideosService

  constructor(aws?: ReadonlyConfig['aws']) {
    const { repo, channels, users, videos } = this.init(aws)
    this.repo = repo
    this.channels = channels
    this.users = users
    this.videos = videos
  }

  private init(aws?: ReadonlyConfig['aws']): IDynamodbService {
    // configure Dynamoose to use DynamoDB Local.
    if (aws?.endpoint) {
      console.log(`Using local DynamoDB at ${aws.endpoint || `http://localhost:4566`}`)
      const ddb = new dynamoose.aws.ddb.DynamoDB({
        credentials: {
          accessKeyId: aws.credentials?.accessKeyId || 'test',
          secretAccessKey: aws.credentials?.secretAccessKey || 'test',
        },
        endpoint: aws.endpoint || `http://localhost:4566`,
        region: aws.region,
      })
      dynamoose.aws.ddb.set(ddb)
    } else if (aws?.credentials) {
      // Create new AWS DynamoDB instance with credentials
      const ddb = new dynamoose.aws.ddb.DynamoDB({
        credentials: {
          accessKeyId: aws.credentials.accessKeyId,
          secretAccessKey: aws.credentials.secretAccessKey,
        },
        region: aws.region,
      })

      // Set DynamoDB instance to the Dynamoose DDB instance
      dynamoose.aws.ddb.set(ddb)
    }

    const repo = DynamodbClient.create(aws?.endpoint ? 'local_' : resourcePrefix)
    const channels = new ChannelsService(repo.channels)
    const users = new UsersService(repo.users)
    const videos = new VideosService(repo.videos)
    return {
      repo,
      channels,
      users,
      videos,
    }
  }
}
