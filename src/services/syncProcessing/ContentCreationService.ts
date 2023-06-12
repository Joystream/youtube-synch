import BN from 'bn.js'
import pWaitFor from 'p-wait-for'
import queue from 'queue'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { YtVideo } from '../../types/youtube'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { ContentDownloadService } from './ContentDownloadService'

// TODO: keep hash calculation separate from extrinsic calling

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
    this.queue = queue({ concurrency: 1, autostart: true, timeout: 120000 /* 2 minute */ })
    this.queue.on('error', (err) => {
      this.logger.error(`Got error processing video`, { err })
    })
    this.queue.on('timeout', async (e) => {
      this.logger.error(`Timeout processing video`, { e })
      await this.ensureContentStateConsistency()
    })
  }

  async start() {
    this.logger.info(`Starting Video creation service.`)

    await this.ensureContentStateConsistency()

    // start video creation service
    setTimeout(async () => this.createContentWithInterval(this.config.intervals.contentProcessing), 0)
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
            ...(await this.dynamodbService.videos.getVideosInState('New')),
          ]

          this.logger.info(`Found ${videos.length} videos with pending on-chain creation.`)

          for (const v of videos) {
            const videoFilePath = this.contentDownloadService.getVideoFilePath(v.resourceId)
            if (videoFilePath) {
              await this.addVideoCreationTask(v, videoFilePath)
            }
          }
        }
      } catch (err) {
        this.logger.error(`Critical content creation error`, { err })
      }
    }
  }

  private async addVideoCreationTask(video: YtVideo, videoFilePath: string) {
    this.logger.debug(`Adding video ${video.resourceId} to the queue`)
    this.queue.push(async () => {
      try {
        // * Pre-validation
        /**
         * If the channel opted out of YPP program, then skip creating the video
         */
        const isCollaboratorSet = await this.joystreamClient.doesChannelHaveCollaborator(video.joystreamChannelId)
        if (!isCollaboratorSet) {
          this.logger.warn(
            `Channel ${video.joystreamChannelId} opted out of YPP program. So skipping the video ` +
              `${video.resourceId} from syncing & deleting it's record from the database.`
          )
          await this.dynamodbService.videos.delete(video)
          return
        }

        /**
         * If the last synced video of the same channel is still being processed by the QN, then skip creating the next video
         * of that channel because  QN will return outdated `totalVideosCreated` field and incorrect AppAction message will be
         * constructed for the next video, which would lead to youtube attribution information missing in the QN video metadata.
         */

        await pWaitFor(async () => {
          const blockNumber = this.lastVideoCreationBlockByChannelId.get(video.joystreamChannelId) || new BN(0)
          return await this.joystreamClient.hasQueryNodeProcessedBlock(blockNumber)
        })

        // Extra validation to check state consistency
        const qnVideo = await this.joystreamClient.getVideoByYtResourceId(video.resourceId)
        if (qnVideo) {
          this.logger.error(
            `Inconsistent state. Youtube video ${video.resourceId} was already created on Joystream but the service tried to recreate it.`,
            { videoId: video.resourceId, channelId: video.joystreamChannelId }
          )
          process.exit(-1)
        }

        await this.dynamodbService.videos.updateState(video, 'CreatingVideo')
        const [createdVideo, createdInBlock] = await this.joystreamClient.createVideo(video, videoFilePath)
        this.lastVideoCreationBlockByChannelId.set(video.joystreamChannelId, createdInBlock)
        await this.dynamodbService.videos.updateState(createdVideo, 'VideoCreated')
        this.logger.info(`Video created on chain.`, { videoId: video.resourceId, channelId: video.joystreamChannelId })
      } catch (err) {
        this.logger.error(`Got error processing video`, { videoId: video.resourceId, err })
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
        const { id, media, thumbnailPhoto } = qnVideo
        const createdVideo = { ...v, joystreamVideo: { id, assetIds: [media?.id || '', thumbnailPhoto?.id || ''] } }
        await this.dynamodbService.videos.updateState(createdVideo, 'VideoCreated')
      } else {
        await this.dynamodbService.videos.updateState(v, 'New')
      }
    }
  }
}
