/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ChannelsController } from './channels/channels.controller'
import { ChannelsService } from './channels/channels.service'
import { UsersController } from './users/users.controller'
import { VideosController } from './videos/videos.controller'
import { ChannelsRepository, UsersRepository, VideosRepository, YtClient } from '@joystream/ytube'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import QueryNodeApi from 'packages/joy-api/src/graphql/QueryNodeApi'
import { getConfig } from '@youtube-sync/domain'

const { JOYSTREAM_QUERY_NODE_URL, YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = getConfig()

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [VideosController, ChannelsController, UsersController],
  providers: [
    ChannelsService,
    {
      provide: UsersRepository,
      useClass: UsersRepository,
    },
    {
      provide: ChannelsRepository,
      useClass: ChannelsRepository,
    },
    {
      provide: VideosRepository,
      useClass: VideosRepository,
    },
    {
      provide: QueryNodeApi,
      useFactory: () => {
        return new QueryNodeApi(JOYSTREAM_QUERY_NODE_URL)
      },
    },
    {
      provide: 'youtube',
      useFactory: () => {
        return YtClient.create(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)
      },
    },
  ],
})
export class AppModule {}
