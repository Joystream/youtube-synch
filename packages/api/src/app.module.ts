import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChannelsController } from './channels/channels.controller';
import { ChannelsService } from './channels/channels.service';
import { UsersController } from './users/users.controller';
import { VideosController } from './videos/videos.controller';
import { NetworkController } from './network/network.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [
    VideosController,
    ChannelsController,
    UsersController,
    NetworkController,
  ],
  providers: [ChannelsService],
})
export class AppModule {}
