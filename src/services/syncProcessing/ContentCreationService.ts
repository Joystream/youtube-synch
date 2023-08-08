import BN from 'bn.js'
import _ from 'lodash'
import pWaitFor from 'p-wait-for'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { VideoCreationTask } from '../../types/youtube'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { ContentDownloadService } from './ContentDownloadService'
import { PriorityQueue } from './PriorityQueue'
import { SyncLimits } from './syncLimitations'
// TODO: keep hash calculation separate from extrinsic calling

// Video content creation/processing service
export class ContentCreationService {
  private readonly DEFAULT_SUDO_PRIORITY = 10

  private logger: Logger
  private joystreamClient: JoystreamClient
  private dynamodbService: IDynamodbService
  private contentDownloadService: ContentDownloadService
  private queue: PriorityQueue<VideoCreationTask, 'sequentialProcessor'>
  private lastVideoCreationBlockByChannelId: Map<number, BN> // JsChannelId -> Last video creation block number
  private activeTaskId: string // video Id of the currently running video creation task

  constructor(
    logging: LoggingService,
    dynamodbService: IDynamodbService,
    contentDownloadService: ContentDownloadService,
    joystreamClient: JoystreamClient
  ) {
    this.logger = logging.createLogger('ContentCreationService')
    this.dynamodbService = dynamodbService
    this.joystreamClient = joystreamClient
    this.contentDownloadService = contentDownloadService
    this.lastVideoCreationBlockByChannelId = new Map()
    this.queue = new PriorityQueue(this.processCreateVideoTask.bind(this), (video: VideoCreationTask, cb) => {
      cb(null, video.priorityScore)
    })
  }

  async start(interval: number) {
    this.logger.info(`Starting Video creation service.`)

    await this.ensureContentStateConsistency()

    // start video creation service
    setTimeout(async () => this.createContentWithInterval(interval), 0)
  }

  private async pendingOnchainCreationVideos() {
    const videos = await this.dynamodbService.videos.getVideosPendingOnchainCreation()
    return videos.filter((v) => {
      return v.id !== this.activeTaskId && this.contentDownloadService.getVideoFilePath(v.id)
    })
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
        await this.prepareContentForOnchainCreation()
      } catch (err) {
        this.logger.error(`Critical content creation error`, { err })
      }
    }
  }

  // Prepare new content for downloading with updated priority
  private async prepareContentForOnchainCreation() {
    // Get all videos whose media assets have been downloaded & prepared
    const videos = await this.pendingOnchainCreationVideos()
    this.logger.verbose(`Videos with pending on-chain creation.`, { videosCount: videos.length })

    const pendingOnchainCreationVideosByChannel = _(videos)
      .groupBy((v) => v.channelId)
      .map((videos, channelId) => ({ channelId, unsyncedVideos: [...videos] }))
      .value()

    await Promise.all(
      pendingOnchainCreationVideosByChannel.map(async ({ channelId, unsyncedVideos }) => {
        // Get total videos of channel
        const channel = await this.dynamodbService.channels.getById(channelId)

        const isSyncEnable = channel.shouldBeIngested && channel.allowOperatorIngestion
        if (!isSyncEnable) {
          this.logger.warn(
            `Syncing is disabled for channel ${channel.joystreamChannelId}. Removing ` +
              `all videos from syncing queue & deleting the records from the database.`
          )
          // Remove all videos from queue
          unsyncedVideos.forEach((v) => this.queue.cancel(v as VideoCreationTask))
          // Remove all the videos from db too (so that they wont be requeued)
          await Promise.all(unsyncedVideos.map((v) => this.dynamodbService.videos.delete(v)))
          // Remove the downloaded video file
          await Promise.all(unsyncedVideos.map((v) => this.contentDownloadService.removeVideoFile(v.id)))
          return
        }

        const totalVideos = Math.min(channel.statistics.videoCount, SyncLimits.videoCap(channel))
        const percentageOfCreatorBacklogNotSynched = (unsyncedVideos.length * 100) / totalVideos

        for (const v of unsyncedVideos) {
          const rank = this.queue.calculateVideoRank(
            this.DEFAULT_SUDO_PRIORITY,
            percentageOfCreatorBacklogNotSynched,
            Date.parse(v.publishedAt)
          )
          const task = {
            ...v,
            priorityScore: rank,
            filePath: this.contentDownloadService.expectedVideoFilePath(v.id),
          }
          this.queue.push(task)
        }
      })
    )
  }

  private async processCreateVideoTask(video: VideoCreationTask, cb: (error?: any, result?: null) => void) {
    // set `activeTaskId`
    this.activeTaskId = video.id

    try {
      // * Pre-validation
      // If the channel opted out of YPP program, then skip creating the video
      const isCollaboratorSet = await this.joystreamClient.doesChannelHaveCollaborator(video.joystreamChannelId)
      if (!isCollaboratorSet) {
        this.logger.warn(
          `Channel ${video.joystreamChannelId} opted out of YPP program. So skipping the video ` +
            `${video.id} from syncing & deleting it's record from the database.`
        )
        await this.dynamodbService.videos.delete(video)
        await this.contentDownloadService.removeVideoFile(video.id) // TODO: remove this after adding `isSyncEnable` check?
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

      // TODO: Added temporary fix to resolve duplicate video creation bug, create a proper fix by ensure that
      // TODO: `processCreateVideoTask` is not called for the same video twice.
      await this.dynamodbService.videos.updateState(video, 'CreatingVideo')

      // Extra validation to check state consistency
      const qnVideo = await this.joystreamClient.getVideoByYtResourceId(video.id)
      if (qnVideo) {
        this.logger.error(
          `Inconsistent state. Youtube video ${video.id} was already created on Joystream but the service tried to recreate it.`,
          { videoId: video.id, channelId: video.joystreamChannelId }
        )
        await this.ensureContentStateConsistency()
        return
        // process.exit(-1)
      }

      await this.dynamodbService.videos.updateState(video, 'CreatingVideo')
      const [createdVideo, createdInBlock, size] = await this.joystreamClient.createVideo(video, video.filePath)
      this.lastVideoCreationBlockByChannelId.set(video.joystreamChannelId, createdInBlock)
      await this.dynamodbService.videos.updateState(createdVideo, 'VideoCreated')
      this.logger.info(`Video created on chain.`, { videoId: video.id, channelId: video.joystreamChannelId })

      // Update channel size limit
      const channel = await this.dynamodbService.channels.getById(video.channelId)
      const isHistoricalVideo = new Date(video.publishedAt) < channel.createdAt
      if (isHistoricalVideo) {
        await this.dynamodbService.channels.save({
          ...channel,
          historicalVideoSyncedSize: (channel.historicalVideoSyncedSize || 0) + size,
        })
      }
    } catch (err) {
      this.logger.error(`Got error processing video`, { videoId: video.id, err })
      await this.dynamodbService.videos.updateState(video, 'VideoCreationFailed')
    } finally {
      // unset `activeTaskId` set
      this.activeTaskId = ''
      // Signal that the task is done
      cb(null, null)
    }
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
      const qnVideo = await this.joystreamClient.getVideoByYtResourceId(v.id)
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
