/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ChannelsController } from './channels/channels.controller'
import { ChannelsService } from './channels/channels.service'
import { UsersController } from './users/users.controller'
import { VideosController } from './videos/videos.controller'
import { JoystreamClient } from '@youtube-sync/joy-api'
import { ChannelsRepository, UsersRepository, VideosRepository, YtClient } from '@joystream/ytube'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import QueryNodeApi from 'packages/joy-api/src/graphql/QueryNodeApi'

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
      useFactory: (config: ConfigService) => {
        return new QueryNodeApi(config.get<string>('JOYSTREAM_QUERY_NODE_URL'))
      },
      inject: [ConfigService],
    },
    {
      provide: 'youtube',
      useFactory: (config: ConfigService) => {
        return YtClient.create(
          config.get<string>('YOUTUBE_CLIENT_ID'),
          config.get<string>('YOUTUBE_CLIENT_SECRET'),
          config.get<string>('YOUTUBE_REDIRECT_URI')
        )
      },
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}
