import { Body, Controller, Get, HttpException, Inject, Param, Post, Query } from '@nestjs/common'
import { Channel, Result, User } from '@youtube-sync/domain'
import R from 'ramda'
import { ChannelsRepository, IYoutubeClient, UsersRepository } from '@joystream/ytube'
import { JoystreamClient } from '@youtube-sync/joy-api'
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { UserCreateRequest, UserCreateResponse, UserDto, ChannelDto } from '../dtos'

@Controller('users')
@ApiTags('channels')
export class UsersController {
  constructor(
    @Inject('youtube') private youtube: IYoutubeClient,
    private jClient: JoystreamClient,
    private usersRespository: UsersRepository,
    private channelsRespository: ChannelsRepository
  ) {}

  @ApiOperation({
    description:
      'Creates user from the supplied google authorization code and fetches and stores list of user`s channels',
  })
  @ApiBody({ type: UserCreateRequest })
  @ApiResponse({ type: UserCreateResponse })
  @Post()
  async createUserWithChannels(@Body() request: UserCreateRequest): Promise<UserCreateResponse> {
    const result = await R.pipe(
      (code: string) => this.youtube.getUserFromCode(code),
      R.andThen((user) => Result.concat(user, (u) => this.youtube.getChannels(u))),
      R.andThen((userAndChannels) => userAndChannels.map(([user, channels]) => [user, channels] as [User, Channel[]])),
      R.andThen((userAndChannel) => Result.bindAsync(userAndChannel, (ucm) => this.saveUserAndChannel(ucm[0], ucm[1])))
    )(request.authorizationCode)

    if (result.isSuccess) {
      const [user, channels] = result.value
      return new UserCreateResponse(
        new UserDto(user),
        channels.map((c) => new ChannelDto(c))
      )
    }

    throw new HttpException(result.error, 500)
  }

  @ApiOperation({
    description:
      'Creates user from the supplied google authorization code and fetches and stores list of user`s channels. This action will also create membership and channels in joystream network instantly',
  })
  @ApiBody({ type: UserCreateRequest })
  @ApiResponse({ type: UserCreateResponse })
  @Post('/ingest')
  async create(@Body() request: UserCreateRequest): Promise<UserCreateResponse> {
    const userAndChannelInitResult = await R.pipe(
      (code: string) => this.youtube.getUserFromCode(code),
      R.andThen((user) => Result.concat(user, (u) => this.youtube.getChannels(u))),
      R.andThen((userAndChannels) => Result.concat(userAndChannels, ([user]) => this.jClient.createMembership(user))),
      R.andThen((ucm) =>
        ucm.map(([[user, channel], membership]) => [{ ...user, membership }, channel] as [User, Channel[]])
      ),
      R.andThen((ucm) =>
        Result.concat(ucm, ([user, channel]) => this.jClient.createChannel(user.membership, channel[0]))
      ),
      R.andThen((ucm) =>
        ucm.map(
          ([[user, channel], joyChannel]) =>
            [user, { ...channel[0], chainMetadata: { id: joyChannel[0] } }] as [User, Channel]
        )
      )
    )

    const result = await R.pipe(
      userAndChannelInitResult,
      R.andThen((result) => Result.bindAsync(result, ([user, channel]) => this.saveUserAndChannel(user, channel[0]))),
      R.andThen((result) =>
        result.map(
          ([user, channels]) =>
            new UserCreateResponse(
              user,
              channels.map((c) => new ChannelDto(c))
            )
        )
      )
    )(request.authorizationCode)

    return result.value
  }

  @ApiOperation({ description: 'Retrieves user by id' })
  @ApiResponse({ type: UserDto })
  @Get(':id')
  async get(@Param('id') id: string): Promise<UserDto> {
    const result = await this.usersRespository.get('users', id)
    if (result.isSuccess) return new UserDto(result.value)
    throw new HttpException(result.error, 500)
  }

  @Get()
  @ApiQuery({ type: String, required: false, name: 'search' })
  @ApiOperation({
    description: 'Searches users added to the system. Use optional `search` param to filter the results by email.',
  })
  @ApiResponse({ type: UserDto, isArray: true })
  async find(@Query('search') search: string): Promise<UserDto[]> {
    const result = await R.pipe(
      (searchString: string) =>
        this.usersRespository.query({ partition: 'users' }, (q) =>
          search ? q.and().attribute('email').contains(searchString) : q
        ),
      R.andThen((users) => users.map((u) => u.map((user) => new UserDto(user))))
    )(search)
    if (result.isSuccess) return result.value
    throw new HttpException(result.error, 500)
  }

  private async saveUserAndChannel(user: User, channels: Channel[]) {
    const r = await R.pipe(
      () => this.usersRespository.save(user, 'users'),
      R.andThen((u) => Result.concat(u, (u) => this.channelsRespository.upsertAll(channels)))
    )()
    return r
  }
}
