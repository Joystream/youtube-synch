import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './channel.entity';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Channel])],
  providers: [ChannelsService],
  controllers: [ChannelsController],
})
export class ChannelsModule {}