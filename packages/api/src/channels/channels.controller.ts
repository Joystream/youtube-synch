import { ChannelsRepository, IYoutubeClient, UsersRepository, VideosRepository } from '@joystream/ytube'
import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, Param, Post, Put } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Channel, User } from '@youtube-sync/domain'
import { ChannelDto, SaveChannelRequest, SaveChannelResponse, UpdateChannelDto, UserDto, VideoDto } from '../dtos'
import { ChannelsService } from './channels.service'

@Controller('channels')
@ApiTags('channels')
export class ChannelsController {
  constructor(
    @Inject('youtube') private youtube: IYoutubeClient,
    private channelsService: ChannelsService,
    private channelsRepository: ChannelsRepository,
    private usersRepository: UsersRepository,
    private videosRepository: VideosRepository
  ) {}

  @ApiOperation({
    description: `Creates user from the supplied google authorization code and fetches
     user's channel and if it satisfies YPP induction criteria it saves the record`,
  })
  @ApiBody({ type: SaveChannelRequest })
  @ApiResponse({ type: SaveChannelResponse })
  @Post()
  async addVerifiedChannel(
    @Body() { authorizationCode, userId, joystreamChannelId, referrerChannelId, email }: SaveChannelRequest
  ): Promise<SaveChannelResponse> {
    try {
      // get user from userId
      const user = await this.usersRepository.get(userId)

      // ensure request's authorization code matches the user's authorization code
      if (user.authorizationCode !== authorizationCode) {
        throw new Error('Invalid request author. Permission denied.')
      }

      // get channel from user
      const [channel] = await this.youtube.getChannels(user)

      const updatedUser: User = { ...user, email }
      const updatedChannel: Channel = { ...channel, joystreamChannelId, referrerChannelId, email }

      // save user and channel
      await this.saveUserAndChannel(updatedUser, updatedChannel)

      // return user and channel
      return new SaveChannelResponse(new UserDto(updatedUser), new ChannelDto(updatedChannel))
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new BadRequestException(message)
    }
  }

  @Get(':joystreamChannelId')
  @ApiOperation({ description: 'Retrieves channel by joystreamChannelId' })
  @ApiResponse({ type: ChannelDto })
  async get(@Param('joystreamChannelId') id: string) {
    try {
      const channel = await this.channelsService.get(id)
      return new ChannelDto(channel)
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Get()
  @ApiOperation({ description: 'Retrieves the most recently verified 30 channels desc by date' })
  @ApiResponse({ type: ChannelDto })
  async getRecentVerifiedChannels() {
    try {
      const channels = await this.channelsService.getRecent(2)
      return channels.map((channel) => new ChannelDto(channel))
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Put(':joystreamChannelId')
  @ApiBody({ type: UpdateChannelDto })
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({
    description: `Updates given channel. Note: only 'shouldBeIngested' is available for update at the moment`,
  })
  async updateChannel(@Param('joystreamChannelId') id: string, @Body() body: UpdateChannelDto) {
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
  @ApiOperation({ description: 'Retrieves particular video by it`s channel id' })
  async getVideo(@Param('id') id: string, @Param('videoId') videoId: string) {
    const result = await this.videosRepository.get(id, videoId)
    return result
  }

  private async saveUserAndChannel(user: User, channel: Channel) {
    // save user
    await this.usersRepository.save(user)

    // save channel
    return await this.channelsRepository.save(channel)
  }
}
