import { Controller, Get, Inject, NotFoundException, Param } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { IDynamodbService } from '../../../repository'
import { YtVideo } from '../../../types/youtube'

@Controller('users/:userId/videos')
@ApiTags('channels')
export class VideosController {
  constructor(@Inject('dynamodbService') private dynamodbService: IDynamodbService) {}

  @Get()
  @ApiResponse({ type: YtVideo, isArray: true })
  @ApiOperation({ description: `Get videos across all channels owned by the user` })
  async get(@Param('userId') userId: string): Promise<YtVideo[]> {
    try {
      // Get channels of the user
      const channel = await this.dynamodbService.channels.getByUserId(userId)

      // Get videos across all channels
      const result = await this.dynamodbService.repo.videos.query({ channelId: channel.id }, (q) => q)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }
}
