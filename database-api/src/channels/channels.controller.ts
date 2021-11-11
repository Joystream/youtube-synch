import { Controller, Get, Param, ParseUUIDPipe, Post, Body, Delete, Put, ParseIntPipe } from '@nestjs/common';

import { ChannelsService, UserIdAndChannel } from './channels.service';
import { Channel } from './channel.entity';

@Controller("channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  public async findAll(): Promise<Channel[]> {
    return this.channelsService.findAll();
  }

  @Get(":id")
  public async find(@Param("id", ParseUUIDPipe) id: string): Promise<Channel> {
    return this.channelsService.findOne(id);
  }

  @Post()
  public async create(@Body() userIdAndChannel: UserIdAndChannel): Promise<Channel> {
    return this.channelsService.create(userIdAndChannel);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.channelsService.delete(id);
  }

  @Put(':id')
  public async update(@Param('id', ParseUUIDPipe) id: string, @Body() channel: Channel): Promise<void> {
    this.channelsService.update(id, channel);
  }
}
