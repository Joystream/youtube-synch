import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { ChannelsService } from '../channels/channels.service'
import { VideosRepository } from '@joystream/ytube'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Video } from '@youtube-sync/domain'

@Controller('users/:userId/videos')
@ApiTags('channels')
export class VideosController {
  private videosRepository = new VideosRepository()

  constructor(private channelsService: ChannelsService) {}

  @Get()
  @ApiResponse({ type: Video, isArray: true })
  @ApiOperation({ description: `Get videos across all channels owned by the user` })
  async get(@Param('userId') userId: string): Promise<Video[]> {
    try {
      // Get channels of the user
      const channel = await this.channelsService.getByUserId(userId)

      // Get videos across all channels
      const result = await this.videosRepository.query({ channelId: channel.id }, (q) => q)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }
}
