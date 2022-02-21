import { Channel, User, Result, DomainError, Video, Membership } from "@youtube-sync/domain";
import R from "ramda";
import { Account, AccountsUtil, ChannelInputAssets, ChannelInputMetadata, Faucet, JoystreamLib, RegisteredMember, VideoInputAssets, VideoInputMetadata } from ".";
import { Uploader, VideoUploadResponse } from "../storage/uploader";
export class JoystreamClient{
    private faucet: Faucet;
    private lib: JoystreamLib
    private accounts: AccountsUtil;
    private uploader: Uploader
    constructor(faucetUri: string, private nodeUri: string, private orionUrl:string, private rootAccount: string) {
        this.faucet = new Faucet(faucetUri);
        this.lib = new JoystreamLib(this.nodeUri);
        this.uploader = new Uploader(nodeUri, orionUrl)
        this.accounts = new AccountsUtil()
    }
    createMembership = async(user: User) : Promise<Result<Membership, DomainError>> => {
        await this.ensureApi();
        const accKey = `${user.googleId}-youtube-sync`;
        const result = await this.accounts
            .createAccount(accKey)
            .pipeAsync(account => this.faucet
                .register(randomHandle(), account.address)
                .then(member => member.map(m => [account, m] as [Account, RegisteredMember]))
            )
        return result
            .map(([account, member]) => ({address: account.address, secret: account.secret, memberId: member.memberId, suri: `${account.secret}//${accKey}`}))
            .onFailure(err => console.log(err))
    }
    createChannel = async (member: Membership, channel: Channel) => {
        const input: ChannelInputMetadata = {
            title: channel.title,
            description: channel.description,
            isPublic: true
        }
        const assets: ChannelInputAssets = {}
        const result = await R.pipe(
            (m: Membership) => this.accounts.getOrAddPair(m.address, m.secret),
            pair => Result.bindAsync(pair, p => this.lib.extrinsics.createChannel(p, member.memberId, input, assets)),
            R.andThen(res => res.onFailure(err => console.log(err))),
            R.andThen(res => res.map(c => [c.channelId, channel] as [string, Channel]))
        )(member);
        return result;
    }
    uploadVideo = async (member: Membership, channel: Channel, video: Video): Promise<Result<VideoUploadResponse, DomainError>> => {
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

function randomHandle() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
}