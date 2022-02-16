import { Channel, User, Result, DomainError, Video } from "@youtube-sync/domain";
import { Account, AccountsUtil, ChannelInputAssets, ChannelInputMetadata, Faucet, JoystreamLib, RegisteredMember, VideoInputAssets, VideoInputMetadata } from ".";
import { Uploader, VideoUploadResponse } from "../storage/uploader";
export type Membership = {
    memberId: string,
    address: string,
    secret: string
}
export class JoystreamClient{
    private faucet: Faucet;
    private lib: JoystreamLib
    private accounts: AccountsUtil;
    private uploader: Uploader
    constructor(faucetUri: string, private nodeUri: string, private orionUrl:string, private rootAccount: string) {
        this.faucet = new Faucet(faucetUri);
        this.lib = new JoystreamLib(this.nodeUri);
        this.uploader = new Uploader(nodeUri, orionUrl)
    }
    async createMembership(user: User) : Promise<Result<Membership, DomainError>>{
        await this.ensureApi();
        const result = await this.accounts
            .createAccount(user.googleId)
            .pipeAsync(account => this.faucet
                .register(user.googleId, account.address)
                .then(member => member.map(m => [account, m] as [Account, RegisteredMember]))
            )
        return result
            .map(([account, member]) => ({address: account.address, secret: account.secret, memberId: member.memberId}))
            .onFailure(err => console.log(err))
    }
    async createChannel(member: Membership, channel: Channel){
        const input: ChannelInputMetadata = {
            title: channel.title,
            description: channel.description,
            isPublic: true
        }
        const assets: ChannelInputAssets = {}
        const result = await this.accounts
            .getOrAddPair(member.address, member.secret)
            .pipeAsync(pair => this.lib.extrinsics.createChannel(pair, member.memberId, input, assets));
        return result.onFailure(err => console.log(err));
    }
    async uploadVideo(member: Membership, channel: Channel, video: Video): Promise<Result<VideoUploadResponse, DomainError>>{
        const videoInputMetadata : VideoInputMetadata = {
            title: video.title,
            description: video.description,
            isPublic: true
        }
        const assets: VideoInputAssets = {}
        const videoCreateResult = await this.accounts
            .getOrAddPair(member.address, member.secret)
            .pipeAsync(pair => this.lib.extrinsics.createVideo(pair,member.memberId,channel.chainMetadata.id, videoInputMetadata, assets));
        const result = await videoCreateResult
            .map(value => value.videoId)
            .pipeAsync(id => this.uploader.upload(id, channel, video))
        return result.onFailure(err => console.log(err))
    }
    private async ensureApi() : Promise<Result<boolean,DomainError>>{
        await this.lib.connect();
        this.accounts = new AccountsUtil();
        const result = this.accounts.addKnownAccount(this.rootAccount);
        return result.map(_ => true);
    }
}