import { Job } from 'bullmq'
import fs from 'fs'
import fsPromises from 'fs/promises'
import pTimeout from 'p-timeout'
import path from 'path'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { DownloadJobData, DownloadJobOutput, VideoUnavailableReasons, YtChannel } from '../../types/youtube'
import { LoggingService } from '../logging'
import { IYoutubeApi } from '../youtube/api'
import { SyncUtils } from './utils'

// Youtube videos download service
export class ContentDownloadService {
  readonly logger: Logger

  public constructor(
    private config: Required<ReadonlyConfig['sync']> & ReadonlyConfig['proxy'],
    logging: LoggingService,
    private dynamodbService: IDynamodbService,
    private youtubeApi: IYoutubeApi
  ) {
    this.logger = logging.createLogger('ContentDownloadService')
  }

  async start() {
    this.logger.info(`Starting Video download service.`)

    // Resolve already downloaded videos
    this.resolveDownloadedVideos()
  }

  private async removeVideoFile(videoId: string) {
    try {
      const dir = this.config.downloadsDir
      const files = await fsPromises.readdir(dir)
      for (const file of files) {
        if (file.startsWith(videoId)) {
          const filePath = path.join(dir, file)
          const size = fs.statSync(filePath).size
          SyncUtils.updateUsedStorageSize(-size)

          await fsPromises.unlink(filePath)
        }
      }
      SyncUtils.downloadedVideoFilePaths.delete(videoId)
    } catch (err) {
      this.logger.error(`Failed to delete media file for video. File not found.`, { videoId: videoId, err })
    }
  }

  private fileSize(filePath: string): number {
    return fs.statSync(filePath).size
  }

  private resolveDownloadedVideos() {
    const videoDownloadsDir = this.config.downloadsDir
    const resolvedDownloads = fs
      .readdirSync(videoDownloadsDir)
      .map((filePath) => filePath.split('.'))
      .filter((filePath) => filePath.length === 2)
      .map(([videoId, ext]) => {
        const filePath = path.join(this.config.downloadsDir, `${videoId}.${ext}`)
        SyncUtils.setVideoFilePath(videoId, filePath)
        SyncUtils.updateUsedStorageSize(this.fileSize(filePath))
        return videoId
      })
    this.logger.verbose(`Resolved already downloaded video assets in local storage`, {
      resolvedDownloads: resolvedDownloads.length,
      usedSpace: SyncUtils.usedSpace,
    })
  }

  /// Process download tasks based on their priority.
  async process(job: Job<DownloadJobData>): Promise<DownloadJobOutput> {
    const video = job.data
    try {
      // download the video from youtube
      const { ext: fileExt } = await pTimeout(
        this.youtubeApi.downloadVideo(video.url, this.config.downloadsDir),
        this.config.limits.pendingDownloadTimeoutSec * 1000,
        `Download timed-out`
      )

      const filePath = path.join(this.config.downloadsDir, `${video.id}.${fileExt}`)
      const size = this.fileSize(filePath)
      if (!SyncUtils.downloadedVideoFilePaths.has(video.id)) {
        SyncUtils.setVideoFilePath(video.id, filePath)
        SyncUtils.updateUsedStorageSize(size)
      }

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
        const sizeLimitReached = channel.historicalVideoSyncedSize + size > YtChannel.sizeCap(channel)
        if (sizeLimitReached) {
          throw new Error(`size cap for historical videos of channel ${channel.id} has reached.`)
        }
      }

      return { filePath }
    } catch (err) {
      const errorMsg = (err as Error).message
      const errors: { message: string; code: VideoUnavailableReasons }[] = [
        { message: 'Video unavailable', code: VideoUnavailableReasons.Unavailable },
        { message: 'This video is not available', code: VideoUnavailableReasons.Unavailable },
        { message: 'This video has been removed', code: VideoUnavailableReasons.Unavailable },
        { message: 'Private video', code: VideoUnavailableReasons.Private },
        { message: 'Postprocessing:', code: VideoUnavailableReasons.PostprocessingError },
        { message: 'The downloaded file is empty', code: VideoUnavailableReasons.EmptyDownload },
        { message: 'This video is private', code: VideoUnavailableReasons.Private },
        { message: 'removed by the uploader', code: VideoUnavailableReasons.Private },
        { message: 'Join this channel to get access to members-only content', code: VideoUnavailableReasons.Private },
        { message: 'size cap for historical videos', code: VideoUnavailableReasons.Skipped },
        { message: 'Offline', code: VideoUnavailableReasons.LiveOffline },
        { message: 'This live event will begin in a few moments', code: VideoUnavailableReasons.LiveOffline },
        { message: 'Download timed-out', code: VideoUnavailableReasons.DownloadTimedOut },
      ]

      let matchedError = errors.find((e) => errorMsg.includes(e.message))
      if (matchedError) {
        await this.dynamodbService.videos.updateState(video, `VideoUnavailable::${matchedError.code}`)
        this.logger.error(`${errorMsg}. Skipping from syncing...`, { videoId: video.id, reason: matchedError.code })
      }

      console.log('errorMsg', errorMsg)

      // If the error is 403 Forbidden means the IP address was blocked
      if (errorMsg.includes('Sign in to confirm')) {
        console.log('Download blocked by youtube')
      }

      // TODO: If Download timed out, should we keep it on disk so it can be resumed later?

      await this.removeVideoFile(video.id)
      throw err
    }
  }
}
