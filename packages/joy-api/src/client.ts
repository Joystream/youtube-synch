import { createType } from '@joystream/types'
import { ChannelId, MemberId } from '@joystream/types/primitives'
import { Channel, Thumbnails, Video } from '@youtube-sync/domain'
import axios from 'axios'
import { BN } from 'bn.js'
import { Readable } from 'stream'
import ytdl from 'ytdl-core'
import { AccountsUtil, DataObjectMetadata, JoystreamLib, VideoInputAssets, VideoInputMetadata } from '.'
import QueryNodeApi from './graphql/QueryNodeApi'
import { computeFileHashAndSize } from './hasher'

export class JoystreamClient {
  private lib: JoystreamLib
  private accounts: AccountsUtil
  private qnApi: QueryNodeApi
  constructor(private nodeUri: string, private queryNodeUrl: string) {
    this.lib = new JoystreamLib(this.nodeUri)
    this.qnApi = new QueryNodeApi(this.queryNodeUrl)
    this.accounts = new AccountsUtil()
  }

  async createVideo(memberId: MemberId, channel: Channel, video: Video): Promise<Video> {
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

    console.log('Video created', createdVideo)

    return {
      ...video,
      joystreamVideo: {
        id: createdVideo.videoId.toString(),
        assetIds: createdVideo.assetsIds.map((a) => a.toString()),
      },
    }
  }
}

async function parseVideoInputs(video: Video): Promise<[VideoInputMetadata, VideoInputAssets]> {
  const videoInputMetadata: VideoInputMetadata = {
    title: video.title,
    description: video.description,
    category: video.category,
    language: video.language,
    isPublic: true,
    duration: video.duration,
  }

  const assets: VideoInputAssets = {}
  const videoStream = ytdl(video.url, { quality: 'highest' })
  const { hash: videoHash, size: videoSize } = await computeFileHashAndSize(videoStream)
  console.log(`Hash ${videoHash}, size: ${videoSize}`)
  const videoMetadata: DataObjectMetadata = {
    ipfsHash: videoHash,
    size: videoSize,
  }

  const thumbnailPhotoStream = await getThumbnailAsset(video.thumbnails)
  const { hash: thumbnailPhotoHash, size: thumbnailPhotoSize } = await computeFileHashAndSize(thumbnailPhotoStream)
  const thumbnailPhotoMetadata: DataObjectMetadata = {
    ipfsHash: thumbnailPhotoHash,
    size: thumbnailPhotoSize,
  }

  assets.media = videoMetadata
  assets.thumbnailPhoto = thumbnailPhotoMetadata
  return [videoInputMetadata, assets]
}

export async function getThumbnailAsset(thumbnails: Thumbnails) {
  // * We are using `medium` thumbnail because it has correct aspect ratio for Atlas (16/9)
  const response = await axios.get<Readable>(thumbnails.medium, { responseType: 'stream' })
  return response.data
}
