import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from '@youtube-sync/domain';

@Controller({ path: 'users/:userId/channels' })
export class ChannelsController {
  constructor(
    private channelsService: ChannelsService,
  ) {}

  @Get(':id')
  async get(@Param('userId') userId: string, @Param('id') id: string) {
    const channel = await this.channelsService.get(userId, id);
    return channel;
  }
  @Get()
  async getAll(
    @Param('userId') userId: string
  ) {
    return this.channelsService.getAll(userId);
  }
  @Put(':id')
  async updateChannel(@Body() channel: Channel){
    return this.channelsService.update(channel);
  }

}
