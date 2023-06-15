import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { StorageNodeApi } from '../storage-node/api'
import { ContentDownloadService } from './ContentDownloadService'

// Video content upload service
export class ContentUploadService {
  private config: ReadonlyConfig
  private logger: Logger
  private logging: LoggingService
  private dynamodbService: IDynamodbService
  private storageNodeApi: StorageNodeApi
  private contentDownloadService: ContentDownloadService
  private queryNodeApi: QueryNodeApi

  public constructor(
    config: ReadonlyConfig,
    logging: LoggingService,
    dynamodbService: IDynamodbService,
    contentDownloadService: ContentDownloadService,
    queryNodeApi: QueryNodeApi
  ) {
    this.config = config
    this.logger = logging.createLogger('ContentUploadService')
    this.logging = logging
    this.dynamodbService = dynamodbService
    this.queryNodeApi = queryNodeApi
    this.contentDownloadService = contentDownloadService
    this.storageNodeApi = new StorageNodeApi(this.logging, this.queryNodeApi)
  }

  async start() {
    this.logger.info(`Starting service to upload video assets to storage-node.`)

    await this.ensureUploadStateConsistency()

    // start assets upload service
    setTimeout(async () => this.uploadAssetsWithInterval(this.config.intervals.contentProcessing), 0)
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

  /**
   * Processes new content after specified interval state.
   * @param processingIntervalMinutes - defines an interval between new uploads to storage nodes
   * @returns void promise.
   */
  private async uploadAssetsWithInterval(processingIntervalMinutes: number) {
    const sleepInterval = processingIntervalMinutes * 60 * 1000
    while (true) {
      this.logger.info(`Content Upload service paused for ${processingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      try {
        this.logger.info(`Resume service....`)
        await this.uploadPendingAssets(this.config.limits.maxConcurrentUploads)
      } catch (err) {
        this.logger.error(`Critical Upload error`, { err })
      }
    }
  }

  private async uploadPendingAssets(limit: number) {
    // Get all videos which are in either `VideoCreated` or `UploadFailed` state, and their assets exist in local download directory
    const videosWithPendingAssets = (await this.dynamodbService.videos.getVideosPendingUpload(limit)).filter(
      (v) => this.contentDownloadService.getVideoFilePath(v.id) !== undefined
    )

    this.logger.verbose(`Found ${videosWithPendingAssets.length} videos with upload still pending to storage-node.`, {
      videos: videosWithPendingAssets.map((v) => v.id),
    })

    await Promise.allSettled(
      videosWithPendingAssets.map(async (video) => {
        try {
          this.logger.info(`Uploading assets for video`, {
            videoId: video.id,
            channelId: video.joystreamChannelId,
          })

          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadStarted')

          const videoFilePath = this.contentDownloadService.expectedVideoFilePath(video.id)

          // Upload the video assets
          await this.storageNodeApi.uploadVideo(video, videoFilePath)

          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadSucceeded')

          // After upload is successful, remove the video file from local storage
          await this.contentDownloadService.removeVideoFile(video.id)

          this.logger.info(`Successfully uploaded assets for video`, {
            videoId: video.id,
            channelId: video.joystreamChannelId,
          })
        } catch (error) {
          const err = (error as Error).message
          this.logger.error(`Got error uploading assets for video`, { videoId: video.id, err })
          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadFailed')
        }
      })
    )
  }
}
