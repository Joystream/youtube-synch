import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { Channel, Result, User } from '@youtube-sync/domain';
import R from 'ramda'
import { ChannelsRepository, IYoutubeClient, UsersRepository, YtClient } from '@joystream/ytube';
import { ConfigService } from '@nestjs/config';
import { JoystreamClient } from '@youtube-sync/joy-api';
interface UserCreateRequest {
  authorizationCode: string;
}
@Controller('users')
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

  @Post()
  async createUserWithChannels(@Body() request: UserCreateRequest) : Promise<User>{
    const result = await R.pipe(
      (code: string) => this.youtube.getUserFromCode(code),
      R.andThen(user => Result.concat(user, u => this.youtube.getChannels(u))),
      R.andThen(userAndChannels => userAndChannels.map(([user, channels]) => [user, channels[0]] as [User, Channel])),
      R.andThen(userAndChannel =>  Result.bindAsync(userAndChannel, ucm => this.saveUserAndChannel(ucm[0], ucm[1])))
    )(request.authorizationCode)
    if(result.isSuccess)
      return result.value[0]
    throw new HttpException(result.error, 500)
  }

  @Post('/ingest')
  async create(@Body() request: UserCreateRequest): Promise<User> {
    const userAndChannelInitResult = await R.pipe(
        (code: string) => this.youtube.getUserFromCode(code),
        R.andThen(user => Result.concat(user, u => this.youtube.getChannels(u))),
        R.andThen(userAndChannels => userAndChannels.map(([user, channels]) => [user, channels[0]] as [User, Channel])),
        R.andThen(userAndChannels => Result.concat(userAndChannels, ([user]) => this.jClient.createMembership(user))),
        R.andThen(ucm => ucm.map(([[user, channel], membership]) => [{...user, membership}, channel] as [User, Channel])),
        R.andThen(ucm => Result.concat(ucm, ([user, channel]) => this.jClient.createChannel(user.membership, channel))),
        R.andThen(ucm => ucm.map(([[user, channel], joyChannel]) => [user, {...channel, chainMetadata: {id: joyChannel.channelId}}] as [User, Channel]))
    )

    const result = await R.pipe(
        userAndChannelInitResult,
        R.andThen(result => Result.bindAsync(result, ([user, channel]) => this.saveUserAndChannel(user, channel))),
        R.andThen(res => res.map(([user]) => user)),
    )(request.authorizationCode);
    
    return result.value;
  }
  @Get(':id')
  async get(@Param('id') id: string): Promise<User> {
    const result = await this.usersRespository.get('users', id);
    if(result.isSuccess)
      return result.value
    throw new HttpException(result.error, 500)
  }
  @Get()
  async find(@Query('search') search?: string): Promise<User[]> {
    const result = await this.usersRespository.query(
      { partition: 'users' },
       q => search ? q.and().attribute('email').contains(search) : q)
    if(result.isSuccess)
      return result.value
    throw new HttpException(result.error, 500)
  }
  private async saveUserAndChannel(user: User, channel: Channel){
    const r = await R.pipe(
        () => this.usersRespository.save(user, 'users'),
        R.andThen(u => Result.concat(u, u => this.channelsRespository.save(channel, u.id)))
    )();
    return r;
  }
}
