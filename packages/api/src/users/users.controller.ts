import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { Channel, Result, User } from '@youtube-sync/domain';
import R from 'ramda'
import { ChannelsRepository, IYoutubeClient, UsersRepository, YtClient } from '@joystream/ytube';
import { ConfigService } from '@nestjs/config';
import { JoystreamClient } from '@youtube-sync/joy-api';
import { ApiBody, ApiOperation, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

export class MembershipDto{
  @ApiProperty() memberId: string
  @ApiProperty() address: string
}
export class ThumbnailsDto{
  @ApiProperty() default: string;
  @ApiProperty() medium: string;
  @ApiProperty() high: string;
  @ApiProperty() maxRes: string;
  @ApiProperty() standard: string;
}
export class ChannelDto{
  /**
   *
   */
  constructor(channel: Channel) {
    this.title = channel.title;
    this.description = channel.description;
    this.joystreamId = channel.chainMetadata?.id
    this.shouldBeInjested = channel.shouldBeInjested;
    this.uploadsPlaylistId = channel.uploadsPlaylistId;
    this.aggregatedStats = channel.aggregatedStats;
    this.thumbnails = channel.thumbnails
  }
  @ApiProperty()
  title: string
  @ApiProperty()
  description: string
  @ApiProperty()
  aggregatedStats: number;
  @ApiProperty()
  uploadsPlaylistId: string;
  @ApiProperty()
  shouldBeInjested: boolean;
  @ApiProperty()
  joystreamId: string
  @ApiProperty()
  thumbnails: ThumbnailsDto
}
export class UserDto {
  /**
   *
   */
  constructor(user: User) {
    this.id = user.id
    this.email = user.email
    this.avatarUrl = user.avatarUrl
    this.channelsCount = user.channelsCount
    this.membership = user.membership
  }
  @ApiProperty() id: string
  @ApiProperty() email:string
  @ApiProperty() avatarUrl: string
  @ApiProperty() channelsCount: number
  @ApiProperty() membership: MembershipDto
}
class UserCreateRequest {
  @ApiProperty({required: true})
  authorizationCode: string;
}
class UserCreateResponse{
  /**
   *
   */
  constructor(user: UserDto, channels: ChannelDto[]) {
    this.user = user;
    this.channels = channels;
  }
  @ApiProperty()
  user: UserDto
  @ApiProperty({type: ChannelDto, isArray: true})
  channels: ChannelDto[]
}
@Controller('users')
@ApiTags('channels')
export class UsersController {
  private youtube: IYoutubeClient
  constructor(
    private configService: ConfigService,
    private jClient: JoystreamClient,
    private usersRespository: UsersRepository,
    private channelsRespository: ChannelsRepository,
  ) {
    this.youtube = YtClient.create(
      configService.get<string>('YOUTUBE_CLIENT_ID'),
      configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      configService.get<string>('YOUTUBE_REDIRECT_URI')
    );
  }

  @ApiOperation({description: 'Creates user from the supplied google authorization code and fetches and stores list of user`s channels'})
  @ApiBody({type: UserCreateRequest})
  @ApiResponse({type: UserCreateResponse})
  @Post()
  async createUserWithChannels(@Body() request: UserCreateRequest) : Promise<UserCreateResponse>{
    const result = await R.pipe(
      (code: string) => this.youtube.getUserFromCode(code),
      R.andThen(user => Result.concat(user, u => this.youtube.getChannels(u))),
      R.andThen(userAndChannels => userAndChannels.map(([user, channels]) => [user, channels] as [User, Channel[]])),
      R.andThen(userAndChannel =>  Result.bindAsync(userAndChannel, ucm => this.saveUserAndChannel(ucm[0], ucm[1])))
    )(request.authorizationCode)
    if(result.isSuccess){
      const [user, channels] = result.value;
      return new UserCreateResponse(new UserDto(user), channels.map(c => new ChannelDto(c)))
    }
      
    throw new HttpException(result.error, 500)
  }

  @ApiOperation({description: 'Creates user from the supplied google authorization code and fetches and stores list of user`s channels. This action will also create membership and channels in joystream network instantly'})
  @ApiBody({type: UserCreateRequest})
  @ApiResponse({type: UserCreateResponse})
  @Post('/ingest')
  async create(@Body() request: UserCreateRequest): Promise<UserCreateResponse> {
    const userAndChannelInitResult = await R.pipe(
        (code: string) => this.youtube.getUserFromCode(code),
        R.andThen(user => Result.concat(user, u => this.youtube.getChannels(u))),
        R.andThen(userAndChannels => Result.concat(userAndChannels, ([user]) => this.jClient.createMembership(user))),
        R.andThen(ucm => ucm.map(([[user, channel], membership]) => [{...user, membership}, channel] as [User, Channel[]])),
        R.andThen(ucm => Result.concat(ucm, ([user, channel]) => this.jClient.createChannel(user.membership, channel[0]))),
        R.andThen(ucm => ucm.map(([[user, channel], joyChannel]) => [user, {...channel[0], chainMetadata: {id: joyChannel.channelId}}] as [User, Channel]))
    )

    const result = await R.pipe(
        userAndChannelInitResult,
        R.andThen(result => Result.bindAsync(result, ([user, channel]) => this.saveUserAndChannel(user, channel[0]))),
        R.andThen(result => result.map(([user, channels]) => new UserCreateResponse(user, channels.map(c => new ChannelDto(c)))))
    )(request.authorizationCode);
    
    return result.value;
  }
  @ApiOperation({description: 'Retrieves user by id'})
  @ApiResponse({type: UserDto})
  @Get(':id')
  async get(@Param('id') id: string): Promise<UserDto> {
    const result = await this.usersRespository.get('users', id);
    if(result.isSuccess)
      return new UserDto(result.value)
    throw new HttpException(result.error, 500)
  }
  @Get()
  @ApiQuery({type: String, required: false, name: 'search'}) 
  @ApiOperation({description: 'Searches users added to the system. Use optional `search` param to filter the results by email.'})
  @ApiResponse({type: UserDto, isArray: true})
  async find(@Query('search') search: string): Promise<UserDto[]> {
    const result =  await R.pipe(
      (searchString:string) => this.usersRespository.query(
        { partition: 'users' },
         q => search ? q.and().attribute('email').contains(searchString) : q),
      R.andThen(users => users.map(u => u.map(user => new UserDto(user))))
    )(search);
    if(result.isSuccess)
      return result.value
    throw new HttpException(result.error, 500)
  }
  private async saveUserAndChannel(user: User, channels: Channel[]){
    const r = await R.pipe(
        () => this.usersRespository.save(user, 'users'),
        R.andThen(u => Result.concat(u, u => this.channelsRespository.upsertAll(channels)))
    )();
    return r;
  }
}
