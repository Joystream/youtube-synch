import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from '@youtube-sync/domain';
import { VideosRepository } from '@joystream/ytube';

@Controller({ path: 'users/:userId/channels' })
export class ChannelsController {
  constructor(
    private channelsService: ChannelsService,
    private videosRepository: VideosRepository,
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
    const result = await this.channelsService.getAll(userId);
    if(result.isSuccess)
      return result.value
    throw new HttpException(result.error, 500)
  }
  @Put(':id')
  async updateChannel(@Body() channel: Channel){
    const result = await this.channelsService.update(channel);
    if(result.isSuccess)
      return result.value
    throw new HttpException(result.error, 500)
  }
  
  @Get(':id/videos')
  async getVideos(@Param('userId') userId: string, @Param('id') id: string){
    const result = await this.videosRepository.query({channelId: id}, q => q.sort('descending'));
    if(result.isSuccess)
      return result.value
    throw new HttpException(result.error, 500)
  }
  @Get(':id/videos/:videoId')
  async getVideo(@Param('id') id: string, @Param('videoId') videoId: string){
    const result = await this.videosRepository.get(id, videoId);
    if(result.isSuccess)
      return result.value
    throw new HttpException(result.error, 500)
  }
}
