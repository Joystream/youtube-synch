import BN from 'bn.js'
import queue from 'queue'
import sleep from 'sleep-promise'
import { YtVideo } from 'src/types/youtube'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { ExitCodes, QueryNodeApiError } from '../../types/errors'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { ContentDownloadService } from './ContentDownloadService'

// Video content creation/processing service
export class ContentCreationService {
  private config: ReadonlyConfig
  private logger: Logger
  private joystreamClient: JoystreamClient
  private dynamodbService: IDynamodbService
  private contentDownloadService: ContentDownloadService
  private queue: queue
  private lastVideoCreationBlockByChannelId: Map<number, BN> // JsChannelId -> Last video creation block number

  constructor(
    config: ReadonlyConfig,
    logging: LoggingService,
    dynamodbService: IDynamodbService,
    contentDownloadService: ContentDownloadService,
    joystreamClient: JoystreamClient
  ) {
    this.config = config
    this.logger = logging.createLogger('ContentCreationService')
    this.dynamodbService = dynamodbService
    this.joystreamClient = joystreamClient
    this.contentDownloadService = contentDownloadService
    this.lastVideoCreationBlockByChannelId = new Map()
    this.queue = queue({ concurrency: 1, autostart: true })
    this.queue.on('error', (err) => {
      this.logger.error(`Got error processing video`, { err })
    })
  }

  async start() {
    this.logger.info(`Starting Video creation service.`)

    await this.ensureContentStateConsistency()

    // start video creation service
    setTimeout(async () => this.createContentWithInterval(this.config.intervals.youtubePolling), 0)
  }

  /**
   * Create new videos after specified interval.
   * @param downloadIntervalMinutes - defines an interval between new content creation.
   * @returns void promise.
   */
  private async createContentWithInterval(processingIntervalMinutes: number) {
    const sleepInterval = processingIntervalMinutes * 60 * 1000
    while (true) {
      this.logger.info(`Content creation service paused for ${processingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      try {
        this.logger.info(`Resume service....`)

        // Only when queue is empty, prepare new videos for on chain creation.
        // Otherwise we might add the same video twice.
        if (this.queue.length === 0) {
          const videos = [
            ...(await this.dynamodbService.videos.getVideosInState('VideoCreationFailed')),
            ...(await this.dynamodbService.videos.getVideosInState('New')), // TODO: only get public/processed videos
          ]

          for (const v of videos) {
            const videoFilePath = this.contentDownloadService.getVideoFilePath(v.resourceId)
            if (videoFilePath) {
              await this.addVideoCreationTask(v, videoFilePath)
            }
          }
        }
      } catch (err) {
        this.logger.error(`Critical content creation error: ${err}`)
      }
    }
  }

  private async addVideoCreationTask(video: YtVideo, videoFilePath: string) {
    this.logger.info(`Adding video ${video.resourceId} to the queue`)
    this.queue.push(async () => {
      try {
        // * Pre-validation
        /**
         * If the last synced video of the same channel is still being processed by the QN, then skip creating the next video
         * of that channel because  QN will return outdated `totalVideosCreated` field and incorrect AppAction message will be
         * constructed for the next video, which would lead to youtube attribution information missing in the QN video metadata.
         */
        const isQueryNodeUptodate = await this.joystreamClient.hasQueryNodeProcessedBlock(
          this.lastVideoCreationBlockByChannelId.get(video.joystreamChannelId) || new BN(0)
        )
        if (!isQueryNodeUptodate) {
          throw new QueryNodeApiError(ExitCodes.QueryNodeApi.OUTDATED_STATE, 'Query Node is not up to date')
        }

        await this.dynamodbService.videos.updateState(video, 'CreatingVideo')
        const [createdVideo, createdInBlock] = await this.joystreamClient.createVideo(video, videoFilePath)
        this.lastVideoCreationBlockByChannelId.set(video.joystreamChannelId, createdInBlock)
        await this.dynamodbService.videos.updateState(createdVideo, 'VideoCreated')
      } catch (error) {
        this.logger.error(`Got error processing video: ${video.resourceId}, error: ${error}`)
        await this.dynamodbService.videos.updateState(video, 'VideoCreationFailed')
      }
    })
  }

  /**
   * Whenever the service exits unexpectedly and starts again, we need to ensure that the state of the videos
   * is consistent, since task processing function isn't an atomic operation. For example, if the service is
   * killed while processing the video, it may happen that the video is in the `CreatingVideo` state, but it
   * was actually created on the chain. So for this video we need to update the state to `VideoCreated`.
   */
  private async ensureContentStateConsistency() {
    const videosInProcessingState = await this.dynamodbService.videos.getVideosInState('CreatingVideo')

    for (const v of videosInProcessingState) {
      const qnVideo = await this.joystreamClient.getVideoByYtResourceId(v.resourceId)
      if (qnVideo) {
        // If QN return a video with given YT video ID attribution, then it means that
        // video was already created so video state should be updated accordingly.
        await this.dynamodbService.videos.updateState(v, 'VideoCreated')
      } else {
        await this.dynamodbService.videos.updateState(v, 'New')
      }
    }
  }
}
