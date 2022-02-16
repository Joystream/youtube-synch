import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JoystreamClient } from '@youtube-sync/joy-api';
import { ChannelsService } from '../channels/channels.service';
import {UsersService} from '../users/users.service'
import { VideosService } from '../videos/videos.service';
@Controller('network')
export class NetworkController {
    private jClient: JoystreamClient
    constructor(
        private configService: ConfigService, 
        private usersService: UsersService,
        private channelsService: ChannelsService,
        private videoService: VideosService) {
        const nodeUrl = this.configService.get<string>('JOYSTREAM_WEBSOCKET_RPC');
        const faucetUrl = this.configService.get<string>('JOYSTREAM_FAUCET_URL');
        const orionUrl = this.configService.get<string>('JOYSTREAM_ORION_URL')
        const rootAccount = this.configService.get<string>('JOYSTREAM_ROOT_ACCOUNT');
        this.jClient = new JoystreamClient(faucetUrl, nodeUrl, orionUrl, rootAccount);
    }
    @Get('e2e')
    async e2eTest(@Query('code') code: string){
        const user = await this.usersService.createFromCode(code);
        const channels = await this.channelsService.ingest(user);
        const videos = await this.videoService.ingest(channels[0])
        const channel = channels[0];
        const video = videos[0];
        const videoResult = await this.jClient
        .createMembership(user)
        .then(membershipResult => membershipResult
            .pipeAsync(mem => this.jClient
                .createChannel(mem, channel)
                .then(ch => ch.pipeAsync(c => this.jClient.uploadVideo(mem, {...channel, chainMetadata: {id: c.channelId}}, video)))));
        return videoResult;
    }
}