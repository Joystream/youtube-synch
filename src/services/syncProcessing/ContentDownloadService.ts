import Queue from 'better-queue'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import sleep from 'sleep-promise'
import { VideoDownloadTask } from '../../types/youtube'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { LoggingService } from '../logging'
import { IYoutubeApi } from '../youtube/api'

// Youtube videos download service
export class ContentDownloadService {
  private readonly MAX_SUDO_PRIORITY = 100
  private readonly DEFAULT_SUDO_PRIORITY = 10
  private readonly MAX_VIEWS_ON_YOUTUBE = 10000000 // 10 Million
  private readonly MAX_VIDEO_RANK = this.measure(this.MAX_SUDO_PRIORITY, 100, this.MAX_VIEWS_ON_YOUTUBE)

  private config: ReadonlyConfig
  private logger: Logger
  private youtubeApi: IYoutubeApi
  private dynamodbService: IDynamodbService
  private downloadQueue: Queue<VideoDownloadTask>
  private downloadedVideoPathByResourceId: Map<string, string>
  private contentSizeSum = 0

  public get usedSpace(): number {
    return this.contentSizeSum
  }

  public get freeSpace(): number {
    const freeSpace = this.config.limits.storage - this.contentSizeSum
    return freeSpace > 0 ? freeSpace : 0
  }

  public constructor(
    config: ReadonlyConfig,
    logging: LoggingService,
    dynamodbService: IDynamodbService,
    youtubeApi: IYoutubeApi
  ) {
    this.config = config
    this.logger = logging.createLogger('ContentDownloadService')
    this.dynamodbService = dynamodbService
    this.youtubeApi = youtubeApi
    this.downloadedVideoPathByResourceId = new Map()
    this.downloadQueue = new Queue(
      /// Process download tasks based on their priority.
      async (videos: VideoDownloadTask[], cb: (error?: any, result?: null) => void) => {
        await Promise.allSettled(
          videos.map(async (video) => {
            try {
              // download the video from youtube
              const { ext: fileExt } = await this.youtubeApi.downloadVideo(video.url, this.config.directories.assets)
              this.setVideoFilePath(video.resourceId, fileExt)
              this.contentSizeSum += this.fileSize(video.resourceId)
            } catch (error) {
              this.logger.error(`Got error downloading video: ${video.resourceId}, error: ${error}. Retrying...`)
            }
          })
        )
        // Signal that the batch is done
        cb(null, null)
      },
      {
        priority: (video: VideoDownloadTask, cb) => {
          cb(null, video.priorityScore)
        },

        batchSize: this.config.limits.concurrentDownloads,
      }
    )
  }

  async start() {
    this.logger.info(`Starting Video download service.`)

    // Resolve already downloaded videos
    this.resolveDownloadedVideos()

    // start video creation service
    setTimeout(async () => this.downloadContentWithInterval(this.config.intervals.youtubePolling), 0)
  }

  public getVideoFilePath(resourceId: string): string | undefined {
    return this.downloadedVideoPathByResourceId.get(resourceId)
  }

  public removeVideoFile(resourceId: string) {
    const videoFilePath = this.getVideoFilePath(resourceId)
    if (!videoFilePath) {
      this.logger.error(`Failed to delete video file: ${videoFilePath}. File not found.`)
      return
    }
    const size = this.fileSize(resourceId)
    fs.unlinkSync(videoFilePath)
    this.contentSizeSum -= size
  }

  private fileSize(resourceId: string): number {
    const videoFilePath = this.getVideoFilePath(resourceId)
    if (!videoFilePath) {
      throw new Error(`Failed to get video file path: ${resourceId}. File not found.`)
    }
    return fs.statSync(videoFilePath).size
  }

  private setVideoFilePath(resourceId: string, fileExt: string) {
    this.downloadedVideoPathByResourceId.set(
      resourceId,
      path.join(this.config.directories.assets, `${resourceId}.${fileExt}`)
    )
  }

  private resolveDownloadedVideos() {
    const videoDownloadsDir = this.config.directories.assets
    const resolvedDownloads = fs
      .readdirSync(videoDownloadsDir)
      .map((filePath) => filePath.split('.'))
      .filter((filePath) => filePath.length === 2)
      .map(([videoId, ext]) => {
        this.setVideoFilePath(videoId, ext)
        this.contentSizeSum += this.fileSize(videoId)
        return videoId
      })
    this.logger.verbose(`Resolved already downloaded video assets in local storage`, { resolvedDownloads })
  }

  /**
   * Download new content after specified interval.
   * @param downloadIntervalMinutes - defines an interval between new content downloads.
   * @returns void promise.
   */
  private async downloadContentWithInterval(processingIntervalMinutes: number) {
    const sleepInterval = processingIntervalMinutes * 60 * 1000
    while (true) {
      this.logger.info(`Content Download service paused for ${processingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      try {
        this.logger.info(`Resume service....`)
        await this.downloadNewContentWithUpdatedPriority()
      } catch (err) {
        this.logger.error(`Critical content download error: ${err}`)
      }
    }
  }

  private async downloadNewContentWithUpdatedPriority() {
    const allUnsyncedVideos = await this.dynamodbService.videos.getAllUnsyncedVideos()

    this.logger.info(`Found ${allUnsyncedVideos.length} unsynced videos.`)
    if (!this.freeSpace && allUnsyncedVideos.length) {
      this.logger.warn(`Not enough space available to download new videos. Will try again later.`)
      return
    }

    const downloadPendingVideos = allUnsyncedVideos.filter((v) => this.getVideoFilePath(v.resourceId) === undefined)

    this.logger.verbose(`Found ${downloadPendingVideos.length} videos with pending download.`, {
      videos: downloadPendingVideos.map((v) => v.resourceId),
    })

    const downloadPendingVideosByChannel = _(downloadPendingVideos)
      .groupBy((v) => v.channelId)
      .map((videos, channelId) => ({ channelId, unsyncedVideos: [...videos] }))
      .value()

    await Promise.all(
      downloadPendingVideosByChannel.map(async ({ channelId, unsyncedVideos }) => {
        // Get total videos of channel
        const videosCount = await this.dynamodbService.videos.getCountByChannel(channelId)
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
          }
          this.downloadQueue.push(task)
        }
      })
    )
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
