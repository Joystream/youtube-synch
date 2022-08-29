import { ChannelsRepository, IYoutubeClient, UsersRepository } from '@joystream/ytube'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { Channel, User } from '@youtube-sync/domain'
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import {
  ChannelDto,
  SaveChannelRequest,
  SaveChannelResponse,
  UserDto,
  VerifyChannelRequest,
  VerifyChannelResponse,
} from '../dtos'

@Controller('users')
@ApiTags('channels')
export class UsersController {
  constructor(
    @Inject('youtube') private youtube: IYoutubeClient,
    private usersRepository: UsersRepository,
    private channelsRepository: ChannelsRepository
  ) {}

  @ApiOperation({
    description: `fetches user's channel from the supplied google authorization code, and verifies if it satisfies YPP induction criteria`,
  })
  @ApiBody({ type: VerifyChannelRequest })
  @ApiResponse({ type: VerifyChannelResponse })
  @Post('/verify')
  async verifyUserAndChannel(@Body() { authorizationCode }: VerifyChannelRequest): Promise<VerifyChannelResponse> {
    try {
      // get user from  authorization code
      const user = await this.youtube.getUserFromCode(authorizationCode)

      // TODO: ensure that is only be one channel for one user
      // get channel from user
      const [channel] = await this.youtube.getChannels(user)

      // verify channel
      this.youtube.verifyChannel(channel)

      // save user
      await this.usersRepository.save(user)

      // return verified user
      return { email: user.email, userId: user.id }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new BadRequestException(message)
    }
  }

  @ApiOperation({
    description: `Creates user from the supplied google authorization code and fetches
     user's channel and if it satisfies YPP induction criteria it saves the record`,
  })
  @ApiBody({ type: SaveChannelRequest })
  @ApiResponse({ type: SaveChannelResponse })
  @Post('/verify-and-save')
  async addVerifiedChannel(
    @Body() { userId, joystreamChannelId, referrerId }: SaveChannelRequest
  ): Promise<SaveChannelResponse> {
    try {
      // get user from  authorization code
      const user = await this.usersRepository.get(userId)

      // get channel from user
      const [channel] = await this.youtube.getChannels(user)

      // save user and channel
      await this.saveUserAndChannel(user, { ...channel, joystreamChannelId, referrerId })

      // return user and channel
      return new SaveChannelResponse(new UserDto(user), new ChannelDto(channel))
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new BadRequestException(message)
    }
  }

  @ApiOperation({ description: 'Retrieves authenticated user by id' })
  @ApiResponse({ type: UserDto })
  @Get(':id')
  async get(@Param('id') id: string): Promise<UserDto> {
    try {
      // Get user with given id
      const result = await this.usersRepository.get(id)

      // prepare & return user response
      return new UserDto(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Get()
  @ApiQuery({ type: String, required: false, name: 'search' })
  @ApiOperation({
    description: `Searches users added to the system. Use optional 'search' param to filter the results by email.`,
  })
  @ApiResponse({ type: UserDto, isArray: true })
  async find(@Query('search') search: string): Promise<UserDto[]> {
    // find users with given email
    const users = await this.usersRepository.query({ partition: 'users' }, (q) =>
      search ? q.and().attribute('email').contains(search) : q
    )

    // prepare response
    const result = users.map((user) => new UserDto(user))

    return result
  }

  private async saveUserAndChannel(user: User, channel: Channel) {
    // save user
    await this.usersRepository.save(user)

    // save channel
    return await this.channelsRepository.save(channel)
  }
}
