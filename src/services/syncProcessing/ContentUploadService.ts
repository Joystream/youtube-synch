import { Job } from 'bullmq'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { UploadJobData } from '../../types/youtube'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { RuntimeApi } from '../runtime/api'
import { StorageNodeApi } from '../storage-node/api'
import { SyncUtils } from './utils'

// Video content upload service
export class ContentUploadService {
  readonly logger: Logger
  private storageNodeApi: StorageNodeApi

  public constructor(
    logging: LoggingService,
    private dynamodbService: IDynamodbService,
    private runtimeApi: RuntimeApi,
    private queryNodeApi: QueryNodeApi
  ) {
    this.logger = logging.createLogger('ContentUploadService')
    this.storageNodeApi = new StorageNodeApi(logging, this.queryNodeApi)
  }

  async start() {
    await this.ensureUploadStateConsistency()
  }

  async process(job: Job<UploadJobData>): Promise<void> {
    let video = job.data
    try {
      // get created data object IDs
      if (!video.joystreamVideo) {
        const uploadJobData = Object.values(await job.getChildrenValues<UploadJobData>())[0]
        if (!uploadJobData) {
          throw new Error(`Failed to get created data object IDs from 'completed' child job: ${job.id}`)
        }

        video = uploadJobData
      }

      const { inChannel } = await this.runtimeApi.query.content.videoById(video.joystreamVideo.id)

      // Before starting the upload, ensure that video still exists on
      // Joystream. If not, mark video as Unavailable and skip uploading
      if (!inChannel.toNumber()) {
        await this.dynamodbService.videos.updateState(video, 'VideoUnavailable::Deleted')
        await SyncUtils.removeVideoFile(video.id)
        return
      }

      // Update video state and save to DB
      await this.dynamodbService.videos.updateState(video, 'UploadStarted')

      // Get video file path
      const filePath = SyncUtils.expectedVideoFilePath(video.id)

      // Upload the video assets
      await this.storageNodeApi.uploadVideo(`dynamic:channel:${inChannel}`, video, filePath)

      // Update video state and save to DB
      await this.dynamodbService.videos.updateState(video, 'UploadSucceeded')

      // After upload is successful, remove the video file from local storage
      await SyncUtils.removeVideoFile(video.id)
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes(`File multihash doesn't match the data object's ipfsContentId`) ||
          error.message.includes(`File size doesn't match the data object's`))
      ) {
        console.log('VideoUnavailable::Other', job.data.id)
        await this.dynamodbService.videos.updateState(job.data, 'VideoUnavailable::Other')
        await SyncUtils.removeVideoFile(video.id)
        return
      }

      // Update video state and save to DB
      await this.dynamodbService.videos.updateState(job.data, 'UploadFailed')

      throw error
    }
  }

  /**
   * Whenever the service exits unexpectedly and starts again, we need to ensure that the state of the videos
   * is consistent w.r.t its assets, since upload function isn't an atomic operation. It may happen that the
   * video is in the `UploadStarted` state, but its assets were actually accepted by the storage-node.
   * So for all these videos we need to update the state to `UploadSucceeded`.
   */
  private async ensureUploadStateConsistency() {
    const videosInUploadState = await this.dynamodbService.videos.getVideosInState('UploadStarted')

    for (const v of videosInUploadState) {
      const qnVideo = await this.queryNodeApi.videoById(v.joystreamVideo.id)
      if (qnVideo?.media?.isAccepted && qnVideo.thumbnailPhoto?.isAccepted) {
        await this.dynamodbService.videos.updateState(v, 'UploadSucceeded')
      } else {
        // If QN return a video that was synced, but its assets are not accepted, then need to retry the upload
        await this.dynamodbService.videos.updateState(v, 'UploadFailed')
      }
    }
  }
}
