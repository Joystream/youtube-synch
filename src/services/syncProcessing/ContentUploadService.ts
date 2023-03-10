import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { StorageNodeApi } from '../storage-node/api'
import { ContentDownloadService } from './ContentDownloadService'

// TODO:  fix inconsistency for `uploadStarted` state
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

    // start assets upload service
    setTimeout(async () => this.uploadAssetsWithInterval(this.config.intervals.youtubePolling), 0)
  }

  /**
   * Processes new content after specified interval state.
   * @param processingIntervalMinutes - defines an interval between polling runs
   * @returns void promise.
   */
  private async uploadAssetsWithInterval(processingIntervalMinutes: number) {
    const sleepInterval = processingIntervalMinutes * 60 * 1000
    while (true) {
      this.logger.info(`Content Upload service paused for ${processingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      try {
        this.logger.info(`Resume service....`)
        await this.uploadPendingAssets()
      } catch (err) {
        this.logger.error(`Critical Upload error: ${err}`)
      }
    }
  }

  private async uploadPendingAssets() {
    const videosWithPendingAssets = await this.dynamodbService.videos.getAllVideosInPendingUploadState()
    this.logger.verbose(`Found ${videosWithPendingAssets.length} videos with upload still pending to storage-node.`, {
      videos: videosWithPendingAssets.map((v) => v.resourceId),
    })

    await Promise.allSettled(
      videosWithPendingAssets.map(async (video) => {
        try {
          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadStarted')

          const videoFilePath = this.contentDownloadService.getVideoFilePath(video.resourceId)

          // Upload the video assets
          await this.storageNodeApi.uploadVideo(video, videoFilePath || '')

          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadSucceeded')

          // After upload is successful, remove the video file from local storage
          this.contentDownloadService.removeVideoFile(video.resourceId)
        } catch (error) {
          this.logger.error(`Got error uploading assets for video: ${video.resourceId}, error: ${error}`)
          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadFailed')
        }
      })
    )
  }
}
