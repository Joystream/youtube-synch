import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@youtube-sync/domain';
import { Faucet, JoystreamClient } from '@youtube-sync/joy-api';

@Controller('network')
export class NetworkController {

    /**
     *
     */
    constructor(private configService: ConfigService) {
    }
    @Get()
    async get(){
        const nodeUrl = this.configService.get<string>('JOYSTREAM_WEBSOCKET_RPC');
        const faucetUrl = this.configService.get<string>('JOYSTREAM_FAUCET_URL');

        const client = new JoystreamClient(new Faucet(faucetUrl), nodeUrl);
        const randomHandleStr = (n:number) => Buffer.from(Math.random().toString()).toString("base64").substr(10, n);
        const result = await client.registerUser(new User('123123','example.com', randomHandleStr(8), '123123', '', '', '', 0));
    }
}
