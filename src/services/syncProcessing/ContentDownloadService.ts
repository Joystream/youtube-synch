import fs from 'fs'
import fsPromises from 'fs/promises'
import _ from 'lodash'
import path from 'path'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { VideoDownloadTask } from '../../types/youtube'
import { LoggingService } from '../logging'
import { IYoutubeApi } from '../youtube/api'
import { PriorityQueue } from './PriorityQueue'

// Youtube videos download service
export class ContentDownloadService {
  private readonly DEFAULT_SUDO_PRIORITY = 10

  private config: ReadonlyConfig
  private logger: Logger
  private youtubeApi: IYoutubeApi
  private dynamodbService: IDynamodbService
  private downloadQueue: PriorityQueue<VideoDownloadTask, 'batchProcessor'>
  private activeDownloadsIds: string[]
  private activeDownloadsCount: number
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
    this.activeDownloadsIds = []
    this.activeDownloadsCount = 0
    this.downloadedVideoPathByResourceId = new Map()
    this.downloadQueue = new PriorityQueue(
      this.processDownloadTasks.bind(this),
      (video: VideoDownloadTask, cb) => {
        cb(null, video.priorityScore)
      },
      this.config.limits.maxConcurrentDownloads
    )
  }

  async start() {
    this.logger.info(`Starting Video download service.`)

    // Resolve already downloaded videos
    this.resolveDownloadedVideos()

    // start video creation service
    setTimeout(async () => this.downloadContentWithInterval(this.config.intervals.contentProcessing), 0)
  }

  public getVideoFilePath(resourceId: string): string | undefined {
    return this.downloadedVideoPathByResourceId.get(resourceId)
  }

  public expectedVideoFilePath(resourceId: string): string {
    const filePath = this.downloadedVideoPathByResourceId.get(resourceId)
    if (filePath && fs.existsSync(filePath)) {
      return filePath
    }
    throw new Error(`Failed to get video file path: ${resourceId}. File not found.`)
  }

  public async removeVideoFile(resourceId: string) {
    try {
      const dir = this.config.directories.assets
      const size = this.fileSize(resourceId)
      const files = await fsPromises.readdir(dir)
      for (const file of files) {
        if (file.startsWith(resourceId)) {
          await fsPromises.unlink(path.join(dir, file))
        }
      }
      this.downloadedVideoPathByResourceId.delete(resourceId)
      this.contentSizeSum -= size
    } catch (err) {
      this.logger.error(`Failed to delete media file for video. File not found.`, { videoId: resourceId, err })
    }
  }

  private fileSize(resourceId: string): number {
    const videoFilePath = this.expectedVideoFilePath(resourceId)
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
    this.logger.verbose(`Resolved already downloaded video assets in local storage`, {
      resolvedDownloads,
      spaceUsed: this.contentSizeSum,
    })
  }

  private async pendingDownloadVideos() {
    const allUnsyncedVideos = await this.dynamodbService.videos.getAllUnsyncedVideos()
    return allUnsyncedVideos.filter((v) => {
      return !this.activeDownloadsIds.includes(v.id) && this.getVideoFilePath(v.id) === undefined
    })
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
        await this.prepareContentForDownloading()
      } catch (err) {
        this.logger.error(`Critical content download error`, { err })
      }
    }
  }

  // Prepare new content for downloading with updated priority
  private async prepareContentForDownloading() {
    const pendingDownloadVideos = await this.pendingDownloadVideos()

    this.logger.verbose(`Video downloads progress status`, {
      activeDownloadsCount: this.activeDownloadsCount,
      pendingDownloadsCount: pendingDownloadVideos.length,
    })

    if (!this.freeSpace && pendingDownloadVideos.length) {
      this.logger.warn(`Not enough space available to download new videos. Will try again later.`)
      return
    }

    const pendingDownloadVideosByChannel = _(pendingDownloadVideos)
      .groupBy((v) => v.channelId)
      .map((videos, channelId) => ({ channelId, unsyncedVideos: [...videos] }))
      .value()

    await Promise.all(
      pendingDownloadVideosByChannel.map(async ({ channelId, unsyncedVideos }) => {
        // Get total videos of channel
        const { videoCount } = (await this.dynamodbService.channels.getById(channelId)).statistics
        const percentageOfCreatorBacklogNotSynched = (unsyncedVideos.length * 100) / videoCount

        for (const v of unsyncedVideos) {
          const rank = this.downloadQueue.calculateVideoRank(
            this.DEFAULT_SUDO_PRIORITY,
            percentageOfCreatorBacklogNotSynched,
            Date.parse(v.publishedAt)
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

  /// Process download tasks based on their priority.
  private async processDownloadTasks(videos: VideoDownloadTask[], cb: (error?: any, result?: null) => void) {
    // set `activeDownloadsIds`
    this.activeDownloadsIds = videos.map((v) => v.id)
    this.activeDownloadsCount = videos.length

    await Promise.allSettled(
      videos.map(async (video) => {
        try {
          // download the video from youtube
          this.logger.info(`Downloading video`, { videoId: video.id, channelId: video.joystreamChannelId })
          const { ext: fileExt } = await this.youtubeApi.downloadVideo(video.url, this.config.directories.assets)
          this.setVideoFilePath(video.id, fileExt)
          this.contentSizeSum += this.fileSize(video.id)
          this.logger.info(`Video downloaded.`, { videoId: video.id, channelId: video.joystreamChannelId })
        } catch (err) {
          const errorMsg = (err as Error).message
          if (errorMsg.includes('Video unavailable')) {
            await this.dynamodbService.videos.updateState(video, 'VideoUnavailable')
            this.logger.warn(`Video not found. Skipping from syncing...`, {
              videoId: video.id,
            })
          } else if (errorMsg.includes('Private video')) {
            await this.dynamodbService.videos.updateState(video, 'VideoUnavailable')
            this.logger.warn(`Video visibility was set to private. Skipping from syncing...`, {
              videoId: video.id,
            })
          } else if (errorMsg.includes('Postprocessing: Conversion failed!')) {
            await this.dynamodbService.videos.updateState(video, 'VideoUnavailable')
            this.logger.error(`Video Postprocessing error. Skipping from syncing...`, {
              videoId: video.id,
            })
          } else {
            this.logger.error(`Got error downloading video. Retrying...`, { videoId: video.id, err })
          }

          await this.removeVideoFile(video.id)
        } finally {
          this.activeDownloadsCount--
        }
      })
    )

    // unset `activeDownloadsIds` set
    this.activeDownloadsIds = []
    // Signal that the batch is done
    cb(null, null)
  }
}
