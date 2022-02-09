import { MemberId } from '@joystream/types/members';
import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, DomainError, User } from '@youtube-sync/domain';
import { Account, ChannelInputAssets, ChannelInputMetadata, Faucet, JoystreamLib, RegisteredMember, AccountsUtil } from '@youtube-sync/joy-api';
import axios from 'axios';
import {createHash} from 'blake3'
@Controller('network')
export class NetworkController {

    /**
     *
     */
    private client: JoystreamLib;
    private signer: AccountsUtil;
    private faucet: Faucet
    constructor(private configService: ConfigService) {
        const nodeUrl = this.configService.get<string>('JOYSTREAM_WEBSOCKET_RPC');
        const faucetUrl = this.configService.get<string>('JOYSTREAM_FAUCET_URL');
        this.client = new JoystreamLib(nodeUrl);
        this.signer = new AccountsUtil()
        this.faucet = new Faucet(faucetUrl)
    }
    @Get()
    async get(){
        const channel: ChannelInputMetadata = {
            title: 'This is channel',
            description: 'This is description',
            isPublic: true
        }
        const handle = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)
        const assets: ChannelInputAssets = {}
        const signer = new AccountsUtil()
        const result = await signer.addKnownAccount('//Alice')
            .pipe(id => signer.createAccount('ihork'))
            .pipeAsync(account => this.faucet
                .register(handle, account.address.address)
                .then(member => member.map(m => [account, m] as [Account, RegisteredMember]))
            )
    
        const channelResult = await result.pipeAsync(
            ([account, member]) => this.client.extrinsics.createChannel(account.address, member.memberId , channel, assets))
    }
}

const mapChannel = (channel: Channel) : ChannelInputMetadata => ({
    title: channel.title,
    description: channel.description,
    isPublic: true
})