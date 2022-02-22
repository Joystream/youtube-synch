import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { ChannelsService } from '../channels/channels.service';
import R from 'ramda'
import { Result } from '@youtube-sync/domain';
import { VideosRepository } from '@joystream/ytube';

@Controller({ path: 'users/:userId/videos' })
export class VideosController {
  private videosRepository: VideosRepository = new VideosRepository()
  constructor(
    private channelsService: ChannelsService
  ) {}

  @Get()
  async get(@Param('userId') userId: string) {
    const result = await R.pipe(
      (userId:string) => this.channelsService.getAll(userId),
      R.andThen(ch => Result.bindAsync(ch, channels => this.videosRepository.scan({}, s => s.attribute('channelId').in(channels.map(c => c.id)))))
    )(userId)
    if(result.isSuccess)
      return result.value
    throw new HttpException(result.error, 500)
  }
}
