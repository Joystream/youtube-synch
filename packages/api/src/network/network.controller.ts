import { ChannelsRepository, IYoutubeClient, UsersRepository, YtClient } from '@joystream/ytube';
import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, Result, User } from '@youtube-sync/domain';
import { JoystreamClient } from '@youtube-sync/joy-api';
import R from 'ramda'
@Controller('network')
export class NetworkController {
    private jClient: JoystreamClient
    private ytClient: IYoutubeClient
    private usersRepo: UsersRepository = new UsersRepository();
    private channelsRepo: ChannelsRepository = new ChannelsRepository()
    constructor(
        private configService: ConfigService) {
        const nodeUrl = this.configService.get<string>('JOYSTREAM_WEBSOCKET_RPC');
        const faucetUrl = this.configService.get<string>('JOYSTREAM_FAUCET_URL');
        const orionUrl = this.configService.get<string>('JOYSTREAM_ORION_URL')
        const rootAccount = this.configService.get<string>('JOYSTREAM_ROOT_ACCOUNT');
        this.jClient = new JoystreamClient(faucetUrl, nodeUrl, orionUrl, rootAccount);
        this.ytClient = YtClient.create(
            configService.get<string>('YOUTUBE_CLIENT_ID'),
            configService.get<string>('YOUTUBE_CLIENT_SECRET'),
            configService.get<string>('YOUTUBE_REDIRECT_URI')
          );
    }
    @Get('e2e')
    async e2eTest(@Query('code') code: string){
        /**
         * 1. Create user from auth code 
         * 2. Ingest user channels
         * 3. Create membership
         * 4. Create channels in joystream
         * 5. Save user and channel in db
         */

        const userAndChannelInitResult = await R.pipe(
            this.ytClient.getUserFromCode,
            R.andThen(user => Result.concat(user, u => this.ytClient.getChannels(u))),
            R.andThen(userAndChannels => userAndChannels.map(([user, channels]) => [user, channels[0]] as [User, Channel])),
            R.andThen(userAndChannels => Result.concat(userAndChannels, ([user, channel]) => this.jClient.createMembership(user))),
            R.andThen(ucm => ucm.map(([[user, channel], membership]) => [{...user, membership}, channel] as [User, Channel])),
            R.andThen(ucm => Result.concat(ucm, ([user, channel]) => this.jClient.createChannel(user.membership, channel))),
            R.andThen(ucm => ucm.map(([[user, channel], joyChannel]) => [user, {...channel, chainMetadata: {id: joyChannel.channelId}}] as [User, Channel]))
        )

        return R.pipe(
            userAndChannelInitResult,
            R.andThen(result => Result.bindAsync(result, ([user, channel]) => this.saveUserAndChannel(user, channel)))
        )(code)
    }

    private async saveUserAndChannel(user: User, channel: Channel){
        return R.pipe(
            () => this.usersRepo.save(user, 'users'),
            R.andThen(u => Result.concat(u, u => this.channelsRepo.save(channel, u.id)))
        )()
    }
}