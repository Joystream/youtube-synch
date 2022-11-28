import { getConfig, Video } from '@youtube-sync/domain'
import { S3 } from 'aws-sdk'
import * as stream from 'stream'
import { ChannelsRepository, VideosRepository } from './database'
import { IYoutubeClient } from './youtubeClient'
import { JoystreamClient } from '@youtube-sync/joy-api'
import { createType } from '@joystream/types'
import { BN } from 'bn.js'

export interface IUploadService {
  uploadVideo(channelId: string, videoId: string): Promise<Video>
}

export class S3UploadService implements IUploadService {
  constructor(private youtubeClient: IYoutubeClient, q) {}
  async uploadVideo(channelId: string, videoId: string): Promise<Video> {
    const videoRepository = new VideosRepository()
    const video = await videoRepository.get(channelId, videoId)
    await videoRepository.save({ ...video, state: 'UploadStarted' })

    const passThroughStream = new stream.PassThrough()
    this.youtubeClient
      .downloadVideo(video.url)
      .pipe(passThroughStream)
      .on('data', (chunk) => console.log(chunk))
    return video
    // // TODO: this is for demo purposes only, will be replaces by the upload to joystream network
    // const s3 = new S3({ endpoint: AWS_ENDPOINT })
    // const exists = await this.bucketExists(s3, channelId.toLowerCase())
    // console.log('Bucket exists:', exists)
    // if (!exists) {
    //   console.log('Creating bucket', channelId.toLowerCase())
    //   await s3
    //     .createBucket({
    //       Bucket: channelId.toLowerCase(),
    //       ACL: 'public-read-write',
    //     })
    //     .promise()
    // }

    // const upload = new S3.ManagedUpload({
    //   params: {
    //     Bucket: channelId.toLowerCase(),
    //     Key: video.title ?? video.id,
    //     Body: passThroughStream,
    //   },
    //   service: s3,
    // })

    // return await upload
    //   .promise()
    //   .then((up) =>
    //     videoRepository.save({
    //       ...video,
    //       state: 'UploadSucceeded',
    //       destinationUrl: up.Location,
    //     })
    //   )
    //   .catch((err) => {
    //     console.log(err)
    //     return videoRepository.save({
    //       ...video,
    //       state: 'UploadFailed',
    //     })
    //   })
  }

  private async bucketExists(s3: S3, channelId: string) {
    try {
      await s3
        .headBucket({
          Bucket: channelId.toLowerCase(),
        })
        .promise()
      return true
    } catch (err: any) {
      if (err.statusCode === 404) return false
      throw err
    }
  }
}

export class JoystreamUploadService implements IUploadService {
  constructor(private youtubeClient: IYoutubeClient) {}
  async uploadVideo(channelId: string, videoId: string): Promise<Video> {
    const videosRepository = new VideosRepository()
    const video = await videosRepository.get(channelId, videoId)
    await videosRepository.save({ ...video, state: 'UploadStarted' })

    const channelsRepository = new ChannelsRepository()
    const channel = await channelsRepository.get(channelId)

    const { JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL, JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID } = getConfig()
    const client = new JoystreamClient(JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL)

    const createdVideo = await client.createVideo(
      createType('u64', new BN(JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID)),
      channel,
      video
    )

    console.log('video stats', createdVideo)

    return video
  }
}
