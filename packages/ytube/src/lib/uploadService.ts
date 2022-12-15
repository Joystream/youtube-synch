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

// export class S3UploadService implements ISyncService {
//   constructor(private youtubeClient: IYoutubeClient, q) {}
//   async uploadVideo(channelId: string, videoId: string): Promise<Video> {
//     const videoRepository = new VideosRepository()
//     const video = await videoRepository.get(channelId, videoId)
//     await videoRepository.save({ ...video, state: 'UploadStarted' })

//     const passThroughStream = new stream.PassThrough()
//     this.youtubeClient
//       .downloadVideo(video.url)
//       .pipe(passThroughStream)
//       .on('data', (chunk) => console.log(chunk))
//     return video
//     // // TODO: this is for demo purposes only, will be replaces by the upload to joystream network
//     // const s3 = new S3({ endpoint: AWS_ENDPOINT })
//     // const exists = await this.bucketExists(s3, channelId.toLowerCase())
//     // console.log('Bucket exists:', exists)
//     // if (!exists) {
//     //   console.log('Creating bucket', channelId.toLowerCase())
//     //   await s3
//     //     .createBucket({
//     //       Bucket: channelId.toLowerCase(),
//     //       ACL: 'public-read-write',
//     //     })
//     //     .promise()
//     // }

//     // const upload = new S3.ManagedUpload({
//     //   params: {
//     //     Bucket: channelId.toLowerCase(),
//     //     Key: video.title ?? video.id,
//     //     Body: passThroughStream,
//     //   },
//     //   service: s3,
//     // })

//     // return await upload
//     //   .promise()
//     //   .then((up) =>
//     //     videoRepository.save({
//     //       ...video,
//     //       state: 'UploadSucceeded',
//     //       destinationUrl: up.Location,
//     //     })
//     //   )
//     //   .catch((err) => {
//     //     console.log(err)
//     //     return videoRepository.save({
//     //       ...video,
//     //       state: 'UploadFailed',
//     //     })
//     //   })
//   }

//   private async bucketExists(s3: S3, channelId: string) {
//     try {
//       await s3
//         .headBucket({
//           Bucket: channelId.toLowerCase(),
//         })
//         .promise()
//       return true
//     } catch (err: any) {
//       if (err.statusCode === 404) return false
//       throw err
//     }
//   }
// }

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
