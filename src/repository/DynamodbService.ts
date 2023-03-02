import { ChannelsService, ChannelsRepository } from './channel'
import { UsersService } from './user'
import { UsersRepository } from './user'
import { VideosRepository, VideosService } from './video'
import { StatsRepository } from './stats'

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
  init(): IDynamodbService {
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
