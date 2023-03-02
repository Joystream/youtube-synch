import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { ReadonlyConfig } from '../../types'
import { LoggingService } from '../logging'
import _ from 'lodash'
import { IDynamodbService } from '../../repository'
import { StorageNodeApi } from '../storage-node/api'
import { QueryNodeApi } from '../query-node/api'

// Video content creation/processing service
export class ContentUploadService {
  private config: ReadonlyConfig
  private logger: Logger
  private logging: LoggingService
  private dynamodbService: IDynamodbService
  private storageNodeApi: StorageNodeApi
  private queryNodeApi: QueryNodeApi

  public constructor(
    config: ReadonlyConfig,
    logging: LoggingService,
    dynamodbService: IDynamodbService,
    queryNodeApi: QueryNodeApi
  ) {
    this.config = config
    this.logger = logging.createLogger('ContentUploadService')
    this.logging = logging
    this.dynamodbService = dynamodbService
    this.queryNodeApi = queryNodeApi
    this.storageNodeApi = new StorageNodeApi(this.logging, this.queryNodeApi)
  }

  async start() {
    this.logger.info(`Starting Video assets upload (to storage-node) service.`)

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
    const videosWithPendingAssets = await this.dynamodbService.videos.getAllVideosWithPendingAssets()

    this.logger.verbose(`Found ${videosWithPendingAssets.length} videos with pending assets.`, {
      videos: videosWithPendingAssets.map((v) => v.resourceId),
    })

    await Promise.all(
      videosWithPendingAssets.map(async (video) => {
        try {
          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadStarted')

          // Upload the video assets
          await this.storageNodeApi.uploadVideo(video)

          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadSucceeded')
        } catch (error) {
          this.logger.error(`Got error uploading assets for video: ${video.id}, error: ${error}`)
          // Update video state and save to DB
          await this.dynamodbService.videos.updateState(video, 'UploadFailed')
        }
      })
    )
  }
}
