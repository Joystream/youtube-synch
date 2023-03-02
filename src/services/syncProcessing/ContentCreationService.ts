import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { ReadonlyConfig, VideoProcessingTask, toPrettyJSON } from '../../types'
import { LoggingService } from '../logging'
import Queue from 'better-queue'
import _ from 'lodash'
import { IDynamodbService } from '../../repository'
import { JoystreamClient } from '../runtime/client'

// Video content creation/processing service
export class ContentCreationService {
  private readonly MAX_SUDO_PRIORITY = 100
  private readonly DEFAULT_SUDO_PRIORITY = 10
  private readonly MAX_VIEWS_ON_YOUTUBE = 10000000 // 10 Million
  private readonly MAX_VIDEO_RANK = this.measure(this.MAX_SUDO_PRIORITY, 100, this.MAX_VIEWS_ON_YOUTUBE)

  private config: ReadonlyConfig
  private logger: Logger
  private joystreamClient: JoystreamClient
  private dynamodbService: IDynamodbService
  private queue: Queue<VideoProcessingTask>

  public constructor(
    config: ReadonlyConfig,
    logging: LoggingService,
    dynamodbService: IDynamodbService,
    joystreamClient: JoystreamClient
  ) {
    this.config = config
    this.logger = logging.createLogger('ContentCreationService')
    this.dynamodbService = dynamodbService
    this.joystreamClient = joystreamClient
    this.queue = new Queue(
      /// Process a single task (video) based on its priority.
      async (video: VideoProcessingTask, cb: (error?: any, result?: null) => void) => {
        try {
          await this.dynamodbService.videos.updateState(video, 'CreatingVideo')
          const createdVideo = await this.joystreamClient.createVideo(video)
          await this.dynamodbService.videos.updateState(createdVideo, 'VideoCreated')
          // Signal that the task is done
          cb(null, null)
        } catch (error) {
          this.logger.error(`Got error processing video: ${video.id}, error: ${error}`)

          await this.dynamodbService.videos.updateState(video, 'VideoCreationFailed')

          // Signal that the task is done
          cb(error, null)
        }
      },
      {
        priority: (video: VideoProcessingTask, cb) => cb(null, video.priorityScore),
        afterProcessDelay: 60,
      }
    )
  }

  async start() {
    this.logger.info(`Starting Video processing (download/creation) service.`)

    await this.ensureContentStateConsistency()

    // start video creation worker service
    setTimeout(async () => this.processContentWithInterval(this.config.intervals.youtubePolling), 0)
  }

  /**
   * Whenever the service exits unexpectedly and starts again, we need to ensure that the state of the videos
   * is consistent, since task processing function isn't an atomic operation. For example, if the service is
   * killed while processing the video, it may happen that the video is in the `CreatingVideo` state, but it
   * was actually created on the chain. So for this video we need to update the state to `VideoCreated`.
   */
  private async ensureContentStateConsistency() {
    const videosInProcessingState = await this.dynamodbService.repo.videos.query({ state: 'CreatingVideo' }, (q) =>
      q.using('state-channelId-index')
    )

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

  /**
   * Processes new content after specified interval state.
   * @param processingIntervalMinutes - defines an interval between polling runs
   * @returns void promise.
   */
  private async processContentWithInterval(processingIntervalMinutes: number) {
    const sleepInterval = processingIntervalMinutes * 60 * 1000
    while (true) {
      this.logger.info(`Content Processing service paused for ${processingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      try {
        this.logger.info(`Resume service....`)
        await this.processNewContentWithUpdatedPriority()
      } catch (err) {
        this.logger.error(`Critical content creation error: ${err}`)
      }
    }
  }

  private async processNewContentWithUpdatedPriority() {
    const allUnsyncedVideos = await this.dynamodbService.videos.getAllUnsyncedVideos()

    this.logger.verbose(`Found ${allUnsyncedVideos.length} unsynced videos.`, {
      videos: allUnsyncedVideos.map((v) => v.resourceId),
    })

    const unsyncedVideosByChannel = _(allUnsyncedVideos)
      .groupBy((v) => v.channelId)
      .map((videos, channelId) => ({ channelId, unsyncedVideos: [...videos] }))
      .value()

    for (const { channelId, unsyncedVideos } of unsyncedVideosByChannel) {
      // Get channel & total number of videos of that channel
      const videosCount = await this.dynamodbService.videos.getCountByChannel(channelId)
      const channel = await this.dynamodbService.channels.getByChannelId(channelId)

      const percentageOfCreatorBacklogNotSynched = (unsyncedVideos.length * 100) / videosCount
      for (const v of unsyncedVideos) {
        const rank = this.calculateVideoRank(
          this.DEFAULT_SUDO_PRIORITY,
          percentageOfCreatorBacklogNotSynched,
          v.viewCount
        )
        const task = {
          ...v,
          priorityScore: rank,
          joystreamChannelId: channel.joystreamChannelId,
        }
        this.queue.push(task)
      }
    }
  }

  private measure(sudoPriority: number, percentage: number, views: number) {
    return (
      sudoPriority * (100 * (this.MAX_VIEWS_ON_YOUTUBE + 1) + this.MAX_VIEWS_ON_YOUTUBE + 1) +
      percentage * (this.MAX_VIEWS_ON_YOUTUBE + 1) +
      views
    )
  }

  /**
   * Re/calculates the priority score/rank of a video based on the following parameters:
   * - sudoPriority: a number between 0 and 100, where 0 is the lowest priority and 100 is the highest priority.
   * - percentageOfCreatorBacklogNotSynched: a number between 0 and 100, where 0 is the lowest priority and 100 is the highest priority.
   * - viewsOnYouTube: a number between 0 and 10,000,000, where 0 is the lowest priority and 10,000,000 is the highest priority.
   * @returns a number between 0 and 10,000,000, where 0 is the lowest priority and 10,000,000 is the highest priority.
   */
  private calculateVideoRank(
    sudoPriority: number,
    percentageOfCreatorBacklogNotSynched: number,
    viewsOnYouTube: number
  ) {
    const isIntegerInRange = (value: number, min: number, max: number) => {
      return value >= min && value <= max
    }
    if (!isIntegerInRange(sudoPriority, 0, this.MAX_SUDO_PRIORITY)) {
      throw new Error(
        `Invalid sudoPriority value ${sudoPriority}, should be an integer between 0 and ${this.MAX_SUDO_PRIORITY}`
      )
    } else if (!isIntegerInRange(percentageOfCreatorBacklogNotSynched, 0, 100)) {
      throw new Error(`Invalid percentageOfCreatorBacklogNotSynched value ${percentageOfCreatorBacklogNotSynched}`)
    } else if (
      viewsOnYouTube > this.MAX_VIEWS_ON_YOUTUBE
        ? this.MAX_VIEWS_ON_YOUTUBE
        : !isIntegerInRange(viewsOnYouTube, 0, this.MAX_VIEWS_ON_YOUTUBE)
    ) {
      throw new Error('Invalid viewsOnYouTube')
    }

    const rank = Math.ceil(this.measure(sudoPriority, percentageOfCreatorBacklogNotSynched, viewsOnYouTube))

    if (!isIntegerInRange(rank, 0, this.MAX_VIDEO_RANK)) {
      throw new Error(`Invalid rank: ${rank}, should be less than ${this.MAX_VIDEO_RANK}`)
    }

    return rank
  }
}
