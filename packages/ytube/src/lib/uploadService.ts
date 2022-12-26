import { createType } from '@joystream/types'
import { Channel, getConfig, Video } from '@youtube-sync/domain'
import { AssetUploadInput, getThumbnailAsset, JoystreamClient } from '@youtube-sync/joy-api'
import { BN } from 'bn.js'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Uploader } from 'packages/joy-api/storage/uploader'
import ytdl from 'ytdl-core'

export interface ISyncService {
  createVideo(channel: Channel, video: Video): Promise<Video>
  uploadVideo(channel: Channel, video: Video): Promise<void>
}

export class JoystreamSyncService implements ISyncService {
  constructor(private joystreamClient: JoystreamClient, private storageClient: Uploader) {}

  async createVideo(channel: Channel, video: Video): Promise<Video> {
    const { JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID } = getConfig()
    return await this.joystreamClient.createVideo(
      createType('u64', new BN(JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID)),
      channel,
      video
    )
  }

  async uploadVideo(channel: Channel, video: Video): Promise<void> {
    const assetsInput: AssetUploadInput[] = [
      {
        dataObjectId: createType('u64', new BN(video.joystreamVideo.assetIds[0])),
        file: ytdl(video.url, { quality: 'highest' }),
      },
      {
        dataObjectId: createType('u64', new BN(video.joystreamVideo.assetIds[1])),
        file: await getThumbnailAsset(video.thumbnails),
      },
    ]
    return await this.storageClient.upload(channel, assetsInput)
  }
}
