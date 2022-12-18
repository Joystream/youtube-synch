import { IVideoMetadata, VideoMetadata } from '@joystream/metadata-protobuf'
import { createType } from '@joystream/types'
import { ChannelId, MemberId } from '@joystream/types/primitives'
import { Channel, Thumbnails, Video } from '@youtube-sync/domain'
import axios from 'axios'
import { BN } from 'bn.js'
import { Readable } from 'stream'
import ytdl from 'ytdl-core'
import {
  AccountsUtil,
  DataObjectMetadata,
  JoystreamLib,
  VideoFileMetadata,
  VideoInputAssets,
  VideoInputParameters,
} from '.'
import QueryNodeApi from './graphql/QueryNodeApi'
import { computeFileHashAndSize } from './hasher'
import { getVideoFileMetadata } from './helpers'
import { asValidatedMetadata } from './serialization'

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

async function parseVideoInputs(video: Video): Promise<[IVideoMetadata, VideoInputAssets]> {
  const assets: VideoInputAssets = {}
  const hashVideoStream = ytdl(video.url, { quality: 'highest' })
  // const metadataVideoStream = ytdl(video.url, { quality: 'highest' })
  const { hash: videoHash, size: videoSize } = await computeFileHashAndSize(hashVideoStream)
  console.log(`Hash ${videoHash}, size: ${videoSize}`)
  const videoAssetMeta: DataObjectMetadata = {
    ipfsHash: videoHash,
    size: videoSize,
  }

  const thumbnailPhotoStream = await getThumbnailAsset(video.thumbnails)
  const { hash: thumbnailPhotoHash, size: thumbnailPhotoSize } = await computeFileHashAndSize(thumbnailPhotoStream)
  const thumbnailPhotoAssetMeta: DataObjectMetadata = {
    ipfsHash: thumbnailPhotoHash,
    size: thumbnailPhotoSize,
  }

  const videoInputParameters: VideoInputParameters = {
    title: video.title,
    description: video.description,
    category: video.category,
    language: video.language,
    isPublic: true,
    duration: video.duration,
  }
  const videoMetadata = asValidatedMetadata(VideoMetadata, videoInputParameters)

  // const videoFileMetadata = await getVideoFileMetadata(metadataVideoStream)
  // this.log('Video media file parameters established:', videoFileMetadata)
  // videoMetadata = setVideoMetadataDefaults(videoMetadata, videoFileMetadata)

  assets.video = videoAssetMeta
  assets.thumbnailPhoto = thumbnailPhotoAssetMeta

  return [videoMetadata, assets]
}

export async function getThumbnailAsset(thumbnails: Thumbnails) {
  // * We are using `medium` thumbnail because it has correct aspect ratio for Atlas (16/9)
  const response = await axios.get<Readable>(thumbnails.medium, { responseType: 'stream' })
  return response.data
}

function setVideoMetadataDefaults(metadata: IVideoMetadata, videoFileMetadata: VideoFileMetadata): IVideoMetadata {
  return {
    duration: videoFileMetadata.duration,
    mediaPixelWidth: videoFileMetadata.width,
    mediaPixelHeight: videoFileMetadata.height,
    mediaType: {
      codecName: videoFileMetadata.codecName,
      container: videoFileMetadata.container,
      mimeMediaType: videoFileMetadata.mimeType,
    },
    ...metadata,
  }
}
