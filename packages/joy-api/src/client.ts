import { ChannelId, MemberId } from '@joystream/types/primitives'
import { Channel, Thumbnails, Video } from '@youtube-sync/domain'
import axios from 'axios'
import { BN } from 'bn.js'
import R from 'ramda'
import ytdl from 'ytdl-core'
import { AccountsUtil, DataObjectMetadata, JoystreamLib, VideoInputAssets, VideoInputMetadata } from '.'
import { Uploader } from '../storage/uploader'
import QueryNodeApi from './graphql/QueryNodeApi'
import { computeFileHashAndSize } from './hasher'
import { createType } from '@joystream/types'

export class JoystreamClient {
  private lib: JoystreamLib
  private accounts: AccountsUtil
  private uploader: Uploader
  private qnApi: QueryNodeApi
  constructor(private nodeUri: string, private queryNodeUrl: string) {
    this.lib = new JoystreamLib(this.nodeUri)
    this.qnApi = new QueryNodeApi(queryNodeUrl)
    this.uploader = new Uploader(this.qnApi)
    this.accounts = new AccountsUtil()
  }

  async createVideo(memberId: MemberId, channel: Channel, video: Video) {
    const member = await this.qnApi.memberById(memberId)
    const keyPair = this.accounts.getPair(member.controllerAccount)

    const inputs = await parseVideoInputs(video)

    const createdVideo = await this.lib.extrinsics.createVideo(
      keyPair,
      createType('u64', new BN(member.id)),
      channel.joystreamChannelId as unknown as ChannelId,
      inputs[0],
      inputs[1]
    )

    await this.uploader.upload(createdVideo.assetsIds[0].toString(), channel, video)

    return createdVideo
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
