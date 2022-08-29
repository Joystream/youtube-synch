import { Controller, Get, Param } from '@nestjs/common'
import { ChannelsService } from '../channels/channels.service'
import { VideosRepository } from '@joystream/ytube'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

@Controller('users/:userId/videos')
@ApiTags('channels')
export class VideosController {
  private videosRepository = new VideosRepository()

  constructor(private channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ description: `Get videos across all channels owned by the user` })
  async get(@Param('userId') userId: string) {
    // Get channels of the user
    const channels = await this.channelsService.getAll(userId)

    // Get videos across all channels
    const result = await this.videosRepository.scan({}, (s) => s.attribute('channelId').in(channels.map((c) => c.id)))
    return result
  }
}
