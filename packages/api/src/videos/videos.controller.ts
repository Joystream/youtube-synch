import { Controller, Get, Param } from '@nestjs/common';
import { ChannelsService } from '../channels/channels.service';
import { VideosService } from './videos.service';

@Controller({ path: 'users/:userId/videos' })
export class VideosController {
  constructor(
    private videosService: VideosService,
    private channelsService: ChannelsService
  ) {}

  @Get()
  async get(@Param('userId') userId: string) {
    const channels = await this.channelsService.getAll(userId);
    const promises = channels.map((c) => this.videosService.getVideos(c));
    const results = await Promise.all(promises);
    return results.flat();
  }
}
