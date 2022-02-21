import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChannelsController } from './channels/channels.controller';
import { ChannelsService } from './channels/channels.service';
import { UsersController } from './users/users.controller';
import { VideosController } from './videos/videos.controller';
import { NetworkController } from './network/network.controller';
import { JoystreamClient } from '@youtube-sync/joy-api';
import { ChannelsRepository, UsersRepository, VideosRepository } from '@joystream/ytube';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [
    VideosController,
    ChannelsController,
    UsersController,
    NetworkController,
  ],
  providers: [ChannelsService, {
    provide: JoystreamClient,
    useFactory: (config: ConfigService) => {
    return new JoystreamClient(
      config.get<string>("JOYSTREAM_FAUCET_URL"),
      config.get<string>("JOYSTREAM_WEBSOCKET_RPC"),
      config.get<string>("JOYSTREAM_ORION_URL"),
      config.get<string>("JOYSTREAM_ROOT_ACCOUNT")
      )},
    inject: [ConfigService]
  }, {
    provide: UsersRepository,
    useClass: UsersRepository
  },
  {
    provide: ChannelsRepository,
    useClass: ChannelsRepository
  },
  {
    provide: VideosRepository,
    useClass: VideosRepository
  }],
})
export class AppModule {}
