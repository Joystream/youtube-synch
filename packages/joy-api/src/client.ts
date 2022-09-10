import { ChannelId } from '@joystream/types/primitives'
import { Channel, User, Result, DomainError, Video, Membership, Thumbnails } from '@youtube-sync/domain'
import axios from 'axios'
import R from 'ramda'
import ytdl from 'ytdl-core'
import {
  Account,
  AccountsUtil,
  ChannelInputAssets,
  ChannelInputMetadata,
  DataObjectMetadata,
  Faucet,
  JoystreamLib,
  RegisteredMember,
  VideoInputAssets,
  VideoInputMetadata,
} from '.'
import { Uploader } from '../storage/uploader'
import { computeFileHashAndSize } from './hasher'

export class JoystreamClient {
  private faucet: Faucet
  private lib: JoystreamLib
  private accounts: AccountsUtil
  private uploader: Uploader
  constructor(faucetUri: string, private nodeUri: string, private queryNodeUrl: string, private rootAccount: string) {
    this.faucet = new Faucet(faucetUri)
    this.lib = new JoystreamLib(this.nodeUri)
    this.uploader = new Uploader(queryNodeUrl)
    this.accounts = new AccountsUtil()
  }

  createMembership = async (user: User): Promise<Result<Membership, DomainError>> => {
    await this.ensureApi()
    const accKey = `${user.id}-youtube-sync`
    const result = await this.accounts
      .createAccount(accKey)
      .pipeAsync((account) =>
        this.faucet
          .register(randomHandle(), account.address)
          .then((member) => member.map((m) => [account, m] as [Account, RegisteredMember]))
      )
    return result
      .map(([account, member]) => ({
        address: account.address,
        secret: account.secret,
        memberId: member.memberId,
        suri: `${account.secret}//${accKey}`,
      }))
      .onFailure((err) => console.log(err))
  }

  createChannel = async (member: Membership, channel: Channel) => {
    const input: ChannelInputMetadata = {
      title: channel.title,
      description: channel.description,
      isPublic: true,
    }
    const assets: ChannelInputAssets = {}
    const result = await R.pipe(
      (m: Membership) => this.accounts.getOrAddPair(m.address, m.secret),
      (pair) => Result.bindAsync(pair, (p) => this.lib.extrinsics.createChannel(p, member.memberId, input, assets)),
      R.andThen((res) => res.onFailure((err) => console.log(err))),
      R.andThen((res) => res.map((c) => [c.channelId, channel] as [ChannelId, Channel]))
    )(member)
    return result
  }

  uploadVideo = async (member: Membership, channel: Channel, video: Video) => {
    const result = await R.pipe(
      (member: Membership) => this.accounts.getOrAddPair(member.address, member.secret),
      (pair) => Result.concat(pair, (_) => parseVideoInputs(video)),
      R.andThen((pairAndInput) =>
        Result.bindAsync(pairAndInput, ([pair, inputs]) =>
          this.lib.extrinsics.createVideo(
            pair,
            member.memberId,
            channel.joystreamChannelId as unknown as ChannelId,
            inputs[0],
            inputs[1]
          )
        )
      ),
      R.andThen((vid) => Result.bindAsync(vid, (v) => this.uploader.upload(v.assetsIds.media, channel, video))),
      R.andThen((up) => up.map((v) => [v.id, video] as [string, Video])),
      R.andThen((r) => r.onFailure((err) => console.log(err)))
    )(member)
    return result
  }

  private async ensureApi(): Promise<Result<boolean, DomainError>> {
    await this.lib.connect()
    this.accounts = new AccountsUtil()
    const result = this.accounts.addKnownAccount(this.rootAccount)
    return result.map((_) => true)
  }
}

async function parseVideoInputs(video: Video): Promise<Result<[VideoInputMetadata, VideoInputAssets], DomainError>> {
  const videoInputMetadata: VideoInputMetadata = {
    title: video.title,
    description: video.description,
    isPublic: true,
  }
  const assets: VideoInputAssets = {}
  const readable = ytdl(video.url, { quality: 'highest' })
  const { hash, size } = await computeFileHashAndSize(readable)
  console.log(`Hash ${hash}, size: ${size}`)
  const metadata: DataObjectMetadata = {
    ipfsHash: hash,
    size: size,
  }
  assets.media = metadata
  return Result.Success<[VideoInputMetadata, VideoInputAssets], DomainError>([videoInputMetadata, assets])
}

async function getThumbnailAsset(thumbnails: Thumbnails) {
  const candidates = [thumbnails.maxRes, thumbnails.high, thumbnails.medium, thumbnails.standard, thumbnails.default]
  const selectedThumb = R.reduce((acc, next) => (acc = acc ? acc : next), '', candidates)
  axios.get(selectedThumb, { responseType: 'arraybuffer' })
}

function randomHandle() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5)
}
