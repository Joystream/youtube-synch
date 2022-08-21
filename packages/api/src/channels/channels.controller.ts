import { Body, Controller, Get, HttpException, Param, Put } from '@nestjs/common'
import { ChannelsService } from './channels.service'
import { Result } from '@youtube-sync/domain'
import { VideosRepository } from '@joystream/ytube'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import R from 'ramda'
import { ChannelDto, UpdateChannelDto, VideoDto } from '../dtos'

@Controller('users/:userId/channels')
@ApiTags('channels')
export class ChannelsController {
  constructor(private channelsService: ChannelsService, private videosRepository: VideosRepository) {}

  @Get(':id')
  @ApiOperation({ description: 'Retrieves channel by id' })
  @ApiResponse({ type: ChannelDto })
  async get(@Param('userId') userId: string, @Param('id') id: string) {
    const channel = await this.channelsService.get(userId, id)
    const result = channel.map((channel) => new ChannelDto(channel))
    if (result.isSuccess) return result.value
    throw new HttpException(result.error, 500)
  }

  @Get()
  @ApiOperation({ description: 'Retrieves all channels of particular user' })
  @ApiResponse({ type: ChannelDto, isArray: true })
  async getAll(@Param('userId') userId: string) {
    const result = await this.channelsService.getAll(userId)
    if (result.isSuccess) return result.value
    throw new HttpException(result.error, 500)
  }

  @Put(':id')
  @ApiBody({ type: UpdateChannelDto })
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({
    description: `Updates given channel. Note: only 'shouldBeInjested' is available for update at the moment`,
  })
  async updateChannel(@Param('userId') userId: string, @Param('id') id: string, @Body() body: UpdateChannelDto) {
    const result = await R.pipe(
      (userId, id) => this.channelsService.get(userId, id),
      R.andThen((ch) => Result.bindAsync(ch, (channel) => this.channelsService.update({ ...channel, ...body })))
    )(userId, id)
    if (result.isSuccess) return new ChannelDto(result.value)
    throw new HttpException(result.error, 500)
  }

  @Get(':id/videos')
  @ApiResponse({ type: VideoDto, isArray: true })
  @ApiOperation({
    description: `Retrieves already ingested(spotted on youtube and saved to the database) videos for a given channel.`,
  })
  async getVideos(@Param('userId') userId: string, @Param('id') id: string) {
    const result = await this.videosRepository.query({ channelId: id }, (q) => q.sort('descending'))
    if (result.isSuccess) return result.value
    throw new HttpException(result.error, 500)
  }

  @Get(':id/videos/:videoId')
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({ description: 'Retrieves particular video by it`s id' })
  async getVideo(@Param('id') id: string, @Param('videoId') videoId: string) {
    const result = await this.videosRepository.get(id, videoId)
    if (result.isSuccess) return result.value
    throw new HttpException(result.error, 500)
  }
}
