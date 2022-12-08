import { createType } from '@joystream/types'
import { ChannelId, MemberId } from '@joystream/types/primitives'
import { Channel, Video } from '@youtube-sync/domain'
import axios from 'axios'
import { BN } from 'bn.js'
import { Readable } from 'stream'
import ytdl from 'ytdl-core'
import {
  AccountsUtil,
  AssetUploadInput,
  DataObjectMetadata,
  JoystreamLib,
  VideoInputAssets,
  VideoInputMetadata,
} from '.'
import { Uploader } from '../storage/uploader'
import QueryNodeApi from './graphql/QueryNodeApi'
import { computeFileHashAndSize } from './hasher'

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

    console.log('Creating video', inputs)

    const createdVideo = await this.lib.extrinsics.createVideo(
      keyPair,
      createType('u64', new BN(member.id)),
      channel.joystreamChannelId as unknown as ChannelId,
      inputs[0],
      inputs[1]
    )

    console.log('Uploading video', createdVideo)

    const assetsInput: AssetUploadInput[] = [
      { dataObjectId: createdVideo.assetsIds[0], file: ytdl(video.url, { quality: 'highest' }) },
      { dataObjectId: createdVideo.assetsIds[1], file: await getThumbnailAsset(video.thumbnails.default) },
    ]
    await this.uploader.upload(assetsInput, channel)

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
  const videoStream = ytdl(video.url, { quality: 'highest' })
  const { hash: videoHash, size: videoSize } = await computeFileHashAndSize(videoStream)
  console.log(`Hash ${videoHash}, size: ${videoSize}`)
  const videoMetadata: DataObjectMetadata = {
    ipfsHash: videoHash,
    size: videoSize,
  }

  const thumbnailPhotoStream = await getThumbnailAsset(video.thumbnails.default)
  const { hash: thumbnailPhotoHash, size: thumbnailPhotoSize } = await computeFileHashAndSize(thumbnailPhotoStream)

  const thumbnailPhotoMetadata: DataObjectMetadata = {
    ipfsHash: thumbnailPhotoHash,
    size: thumbnailPhotoSize,
  }
  assets.media = videoMetadata
  assets.thumbnailPhoto = thumbnailPhotoMetadata
  return [videoInputMetadata, assets]
}

async function getThumbnailAsset(thumbnailUrl: string) {
  const response = await axios.get<Readable>(thumbnailUrl, { responseType: 'stream' })
  return response.data
}
