import { ChannelId } from '@joystream/types/primitives'
import { Channel, DomainError, Membership, Result, Thumbnails, Video } from '@youtube-sync/domain'
import axios from 'axios'
import R from 'ramda'
import ytdl from 'ytdl-core'
import { AccountsUtil, DataObjectMetadata, JoystreamLib, VideoInputAssets, VideoInputMetadata } from '.'
import { Uploader } from '../storage/uploader'
import { computeFileHashAndSize } from './hasher'

export class JoystreamClient {
  private lib: JoystreamLib
  private accounts: AccountsUtil
  private uploader: Uploader
  constructor(private nodeUri: string, private queryNodeUrl: string) {
    this.lib = new JoystreamLib(this.nodeUri)
    this.uploader = new Uploader(this.queryNodeUrl)
    this.accounts = new AccountsUtil()
  }

  async createVideo(member: Membership, channel: Channel, video: Video) {
    const keyPair = this.accounts.getOrAddPair(member.address, member.secret)
    const inputs = parseVideoInputs(video)

    const v = await this.lib.extrinsics.createVideo(
      keyPair,
      member.memberId,
      channel.joystreamChannelId as unknown as ChannelId,
      inputs[0],
      inputs[1]
    )

    const { id } = await this.uploader.upload(v.assetsIds.media, channel, video)

    return [id, video] as const
  }
}

async function parseVideoInputs(video: Video): Promise<[VideoInputMetadata, VideoInputAssets]> {
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
  return [videoInputMetadata, assets]
}

async function getThumbnailAsset(thumbnails: Thumbnails) {
  const candidates = [thumbnails.maxRes, thumbnails.high, thumbnails.medium, thumbnails.standard, thumbnails.default]
  const selectedThumb = R.reduce((acc, next) => (acc = acc ? acc : next), '', candidates)
  axios.get(selectedThumb, { responseType: 'arraybuffer' })
}
