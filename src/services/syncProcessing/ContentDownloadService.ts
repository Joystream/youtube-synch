import { Job } from 'bullmq'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { DownloadJobData, DownloadJobOutput } from '../../types/youtube'
import { LoggingService } from '../logging'
import { IYoutubeApi } from '../youtube/api'
import { SyncUtils } from './utils'

// Youtube videos download service
export class ContentDownloadService {
  readonly logger: Logger

  public constructor(
    private syncConfig: Required<ReadonlyConfig['sync']>,
    logging: LoggingService,
    private dynamodbService: IDynamodbService,
    private youtubeApi: IYoutubeApi
  ) {
    this.syncConfig = syncConfig
    this.logger = logging.createLogger('ContentDownloadService')
    this.dynamodbService = dynamodbService
    this.youtubeApi = youtubeApi
  }

  async start() {
    this.logger.info(`Starting Video download service.`)

    // Resolve already downloaded videos
    this.resolveDownloadedVideos()
  }

  private expectedVideoFilePath(videoId: string): string {
    const filePath = SyncUtils.downloadedVideoFilePaths.get(videoId)
    if (filePath && fs.existsSync(filePath)) {
      return filePath
    }
    throw new Error(`Failed to get video file path: ${videoId}. File not found.`)
  }

  private async removeVideoFile(videoId: string) {
    try {
      const dir = this.syncConfig.downloadsDir
      const size = this.fileSize(videoId)
      const files = await fsPromises.readdir(dir)
      for (const file of files) {
        if (file.startsWith(videoId)) {
          await fsPromises.unlink(path.join(dir, file))
        }
      }
      SyncUtils.downloadedVideoFilePaths.delete(videoId)
      SyncUtils.updateUsedStorageSize(-size)
    } catch (err) {
      this.logger.error(`Failed to delete media file for video. File not found.`, { videoId: videoId, err })
    }
  }

  private fileSize(videoId: string): number {
    const videoFilePath = this.expectedVideoFilePath(videoId)
    return fs.statSync(videoFilePath).size
  }

  private resolveDownloadedVideos() {
    const videoDownloadsDir = this.syncConfig.downloadsDir
    const resolvedDownloads = fs
      .readdirSync(videoDownloadsDir)
      .map((filePath) => filePath.split('.'))
      .filter((filePath) => filePath.length === 2)
      .map(([videoId, ext]) => {
        const filePath = path.join(this.syncConfig.downloadsDir, `${videoId}.${ext}`)
        SyncUtils.setVideoFilePath(videoId, filePath)
        SyncUtils.updateUsedStorageSize(this.fileSize(videoId))
        return videoId
      })
    this.logger.verbose(`Resolved already downloaded video assets in local storage`, {
      resolvedDownloads,
      usedSpace: SyncUtils.usedSpace,
    })
  }

  /// Process download tasks based on their priority.
  async process(job: Job<DownloadJobData>): Promise<DownloadJobOutput> {
    const video = job.data
    try {
      // download the video from youtube
      const { ext: fileExt } = await this.youtubeApi.downloadVideo(video.url, this.syncConfig.downloadsDir)
      const filePath = path.join(this.syncConfig.downloadsDir, `${video.id}.${fileExt}`)
      SyncUtils.setVideoFilePath(video.id, filePath)
      const size = this.fileSize(video.id)
      SyncUtils.updateUsedStorageSize(size)
      // TODO: fix this as size can be duplicated added if video is already downloaded
      // TODO: once during resolveDownloadedVideos calls and once during re-downloading

      if (video.joystreamVideo) {
        return { filePath }
      }

      /**
       * Post download check (ensure that syncing this video won't
       * violate per channel total videos count & size limits)
       */

      const channel = await this.dynamodbService.channels.getById(video.channelId)
      const isHistoricalVideo = new Date(video.publishedAt) < channel.createdAt
      if (isHistoricalVideo) {
        const sizeLimitReached = channel.historicalVideoSyncedSize + size > SyncUtils.sizeCap(channel)
        if (sizeLimitReached) {
          throw new Error(`size cap for historical videos of channel ${channel.id} has reached.`)
        }
      }

      return { filePath }
    } catch (err) {
      const errorMsg = (err as Error).message
      const errors = [
        { message: 'Video unavailable' },
        { message: 'Private video' },
        { message: 'Postprocessing:' },
        { message: 'The downloaded file is empty' },
        { message: 'This video is private' },
        { message: 'removed by the uploader' },
        { message: 'removed by the uploader' },
        { message: 'size cap for historical videos' },
      ]

      let matchedError = errors.find((e) => errorMsg.includes(e.message))
      if (matchedError) {
        await this.dynamodbService.videos.updateState(video, 'VideoUnavailable')
        this.logger.error(`${errorMsg}. Skipping from syncing...`, { videoId: video.id })
      }

      await this.removeVideoFile(video.id)
      throw err
    }
  }
}
