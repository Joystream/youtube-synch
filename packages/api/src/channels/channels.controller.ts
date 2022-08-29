import { VideosRepository } from '@joystream/ytube'
import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ChannelDto, UpdateChannelDto, VideoDto } from '../dtos'
import { ChannelsService } from './channels.service'

@Controller('channels')
@ApiTags('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService, private videosRepository: VideosRepository) {}

  @Get(':id')
  @ApiOperation({ description: 'Retrieves channel by id' })
  @ApiResponse({ type: ChannelDto })
  async get(@Param('id') id: string) {
    const channel = await this.channelsService.get(id)
    return new ChannelDto(channel)
  }

  @Put(':id')
  @ApiBody({ type: UpdateChannelDto })
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({
    description: `Updates given channel. Note: only 'shouldBeIngested' is available for update at the moment`,
  })
  async updateChannel(@Param('id') id: string, @Body() body: UpdateChannelDto) {
    const channel = await this.channelsService.get(id)

    this.channelsService.update({ ...channel, ...body })
  }

  @Get(':id/videos')
  @ApiResponse({ type: VideoDto, isArray: true })
  @ApiOperation({
    description: `Retrieves already ingested(spotted on youtube and saved to the database) videos for a given channel.`,
  })
  async getVideos(@Param('userId') userId: string, @Param('id') id: string) {
    const result = await this.videosRepository.query({ channelId: id }, (q) => q.sort('descending'))
    return result
  }

  @Get(':id/videos/:videoId')
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({ description: 'Retrieves particular video by it`s id' })
  async getVideo(@Param('id') id: string, @Param('videoId') videoId: string) {
    const result = await this.videosRepository.get(id, videoId)
    return result
  }
}
