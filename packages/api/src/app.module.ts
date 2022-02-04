import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChannelsController } from './channels/channels.controller';
import { ChannelsService } from './channels/channels.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { VideosController } from './videos/videos.controller';
import { VideosService } from './videos/videos.service';
import { NetworkController } from './network/network.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [
    VideosController,
    ChannelsController,
    UsersController,
    NetworkController,
  ],
  providers: [ChannelsService, VideosService, UsersService],
})
export class AppModule {}
