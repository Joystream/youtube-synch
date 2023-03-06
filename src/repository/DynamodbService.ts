import { ChannelsService, ChannelsRepository } from './channel'
import { UsersService } from './user'
import { UsersRepository } from './user'
import { VideosRepository, VideosService } from './video'
import { StatsRepository } from './stats'
import * as dynamoose from 'dynamoose'
import { ReadonlyConfig } from '../types'

interface IDynamodbClient {
  channels: ChannelsRepository
  users: UsersRepository
  videos: VideosRepository
  stats: StatsRepository
}

const DynamodbClient = {
  create(): IDynamodbClient {
    return {
      channels: new ChannelsRepository(),
      users: new UsersRepository(),
      videos: new VideosRepository(),
      stats: new StatsRepository(),
    }
  },
}

export interface IDynamodbService {
  repo: IDynamodbClient
  channels: ChannelsService
  users: UsersService
  videos: VideosService
}

export const DynamodbService = {
  init(aws?: ReadonlyConfig['aws']): IDynamodbService {
    // configure Dynamoose to use DynamoDB Local.
    if (aws?.endpoint) {
      console.log(`Using local DynamoDB at ${process.env.AWS_ENDPOINT || `http://localhost:4566`}`)
      dynamoose.aws.ddb.local(process.env.AWS_ENDPOINT || `http://localhost:4566`)
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

    const repo = DynamodbClient.create()
    const channels = new ChannelsService(repo.channels)
    const users = new UsersService(repo.users)
    const videos = new VideosService(repo.videos)
    return {
      repo,
      channels,
      users,
      videos,
    }
  },
}
