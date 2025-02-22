import _ from 'lodash'
import sleep from 'sleep-promise'
import { Job } from 'bullmq'
import fs, { promises as fsp } from 'fs'
import fsPromises from 'fs/promises'
import pTimeout from 'p-timeout'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { DownloadJobData, DownloadJobOutput, DurationLimitExceededError, VideoUnavailableReasons, YtChannel } from '../../types/youtube'
import { LoggingService } from '../logging'
import { IYoutubeApi } from '../youtube/api'
import { SyncUtils } from './utils'
import { Socks5ProxyService } from '../proxy/Socks5ProxyService'
import { SCRIPT_PATH as DOWNLOAD_ASSET_SCRIPT_PATH } from '../../scripts/downloadAsset'

export const THUMBNAILS_SUBDIR = 'thumbs'

// Youtube videos download service
export class ContentDownloadService {
  readonly logger: Logger

  public constructor(
    private config: Required<ReadonlyConfig['sync']>,
    logging: LoggingService,
    private dynamodbService: IDynamodbService,
    private youtubeApi: IYoutubeApi,
    private proxyService?: Socks5ProxyService
  ) {
    this.logger = logging.createLogger('ContentDownloadService')
  }

  async start() {
    this.logger.info(`Starting Video download service.`)

    // Resolve already downloaded videos
    this.resolveDownloadedVideos()
  }

  private async removeAllVideoFiles(videoId: string) {
    try {
      const videoDir = this.config.downloadsDir
      const thumbDir = path.join(videoDir, THUMBNAILS_SUBDIR)
      const videoDirFiles = (await fsPromises.readdir(videoDir, { withFileTypes: true }))
        .filter((e) => e.isFile() && e.name.startsWith(videoId))
        .map((e) => path.join(videoDir, e.name))
      const thumbDirFiles = (await fsPromises.readdir(thumbDir, { withFileTypes: true }))
        .filter((e) => e.isFile() && e.name.startsWith(videoId))
        .map((e) => path.join(thumbDir, e.name))

      for (const filePath of videoDirFiles.concat(thumbDirFiles)) {
        const size = this.fileSize(filePath)
        await fsPromises.unlink(filePath)
        SyncUtils.updateUsedStorageSize(-size)
      }
      SyncUtils.downloadedVideoAssetPaths.delete(videoId)
    } catch (err) {
      this.logger.error(`Failed to remove all files associated with video.`, { videoId, err })
    }
  }

  private fileSize(filePath: string): number {
    return fs.statSync(filePath).size
  }

  private resolveDownloadedVideos() {
    const videoDownloadsDir = this.config.downloadsDir
    const resolvedVideos = fs
      .readdirSync(videoDownloadsDir)
      .map((fileName) => fileName.split('.'))
      .filter((fileNameParts) => fileNameParts.length === 2)
      .map(([videoId, ext]) => {
        const filePath = path.join(videoDownloadsDir, `${videoId}.${ext}`)
        SyncUtils.setVideoAssetPath(videoId, 'video', filePath)
        SyncUtils.updateUsedStorageSize(this.fileSize(filePath))
        return videoId
      })
    const thumbDownloadsDir = path.join(videoDownloadsDir, THUMBNAILS_SUBDIR)
    const resolvedThumbs = fs
      .readdirSync(thumbDownloadsDir)
      .map((fileName) => fileName.split('.'))
      .filter((fileNameParts) => fileNameParts.length === 2)
      .map(([videoId, ext]) => {
        const filePath = path.join(thumbDownloadsDir, `${videoId}.${ext}`)
        SyncUtils.setVideoAssetPath(videoId, 'thumbnail', filePath)
        SyncUtils.updateUsedStorageSize(this.fileSize(filePath))
        return videoId
      })
    this.logger.verbose(`Resolved already downloaded video assets in local storage`, {
      resolvedVideos: resolvedVideos.length,
      resolvedThumbs: resolvedThumbs.length,
      usedSpace: SyncUtils.usedSpace,
    })
  }

  async downloadThumbnail(video: DownloadJobData, proxy?: string): Promise<string> {
    const assetUrl = video.thumbnails?.medium
    if (!assetUrl) {
      throw new Error(`Cannot download thumbnail: Missing thumbnail asset url`)
    }
    const [ext] = assetUrl.split('.').slice(-1)
    const thumbnailPath = path.join(
      this.config.downloadsDir,
      THUMBNAILS_SUBDIR,
      `${video.id}.${ext}`,
    )
    const tmpPath = `${thumbnailPath}.tmp`
    try {
      await promisify(exec)(
        `${this.proxyService?.proxychainExec?.concat(' ') || ''}` +
        `node ${DOWNLOAD_ASSET_SCRIPT_PATH} ` +
        `${assetUrl} ` +
        `${tmpPath} ` +
        `${proxy}` 
      )
      await fsPromises.rename(tmpPath, thumbnailPath)
    } catch (e: any) {
      throw new Error(`Thumbnail download failed: ${e.toString()}`)
    }
    return thumbnailPath
  }

  async preDownloadSleep(): Promise<number | undefined> {
    const {preDownloadSleep} = this.config.limits || {}
    if (preDownloadSleep) {
      const { min, max } = preDownloadSleep
      const sleepTime = _.random(min, max)
      this.logger.debug(`Sleeping ${sleepTime}...`)
      await sleep(sleepTime)
      return sleepTime
    }
  }

  /// Process download tasks based on their priority.
  async process(job: Job<DownloadJobData>): Promise<DownloadJobOutput> {
    const video = job.data
    let proxy: string | undefined
    try {
      const { maxVideoDuration } = this.config.limits
      if (maxVideoDuration && video.duration > maxVideoDuration) {
        throw new DurationLimitExceededError(video.duration, maxVideoDuration)
      }

      const channel = await this.dynamodbService.channels.getById(video.channelId)
      const isHistoricalVideo = new Date(video.publishedAt) < channel.createdAt

      // Establish a proxy endpoint to use
      proxy = await this.proxyService?.getProxy(video.id)

      // check available video formats before attempting to download
      // (we're using sleep here, because this is also a yt-dlp request)
      await this.preDownloadSleep()
      const ytpMetadata = await this.youtubeApi.checkVideo(video.url, proxy)
      // check historical videos size cap
      const expectedFilesize = ytpMetadata.filesize_approx
      if (
        isHistoricalVideo &&
        expectedFilesize &&
        (channel.historicalVideoSyncedSize + expectedFilesize) > YtChannel.sizeCap(channel)
      ) {
        throw new Error(`aborted: size cap for historical videos of channel ${channel.id} reached.`)
      }

      const alreadyDownloadedAssets = SyncUtils.downloadedVideoAssetPaths.get(video.id)
      // download thumbnail if missing
      if (!alreadyDownloadedAssets?.thumbnail) {
        await this.preDownloadSleep()
        const thumbnailPath = await this.downloadThumbnail(video, proxy)
        const thumbnailSize = this.fileSize(thumbnailPath)
        SyncUtils.setVideoAssetPath(video.id, 'thumbnail', thumbnailPath)
        SyncUtils.updateUsedStorageSize(thumbnailSize)
      } else {
        this.logger.info(`Thumbnail already downloaded, skipping...`, { jobId: video.id })
      }
      
      // download the video from youtube if missing
      if (!alreadyDownloadedAssets?.video) {
        await this.preDownloadSleep()
        const ytpOutput = await pTimeout(
          this.youtubeApi.downloadVideo(video.url, this.config.downloadsDir, proxy),
          this.config.limits.pendingDownloadTimeoutSec * 1000,
          `Download timed-out`
        )
        const { ext: fileExt } = ytpOutput
        const videoPath = path.join(this.config.downloadsDir, `${video.id}.${fileExt}`)
        const videoSize = this.fileSize(videoPath)
        SyncUtils.setVideoAssetPath(video.id, 'video', videoPath)
        SyncUtils.updateUsedStorageSize(videoSize)
      } else {
        this.logger.info(`Video already downloaded, skipping...`, { jobId: video.id })
      }

      const videoAssets = SyncUtils.expectedVideoAssetPaths(video.id)
      const assetsSize = Object.values(videoAssets).reduce((sizeSum, assetPath) => sizeSum += this.fileSize(assetPath), 0)

      // TODO: Why would that ever happen?
      if (video.joystreamVideo) {
        return videoAssets
      }

      /**
       * Post download check (ensure that syncing this video won't
       * violate per channel total videos count & size limits)
       */
      if (isHistoricalVideo) {
        const sizeLimitReached = channel.historicalVideoSyncedSize + assetsSize > YtChannel.sizeCap(channel)
        if (sizeLimitReached) {
          throw new Error(`size cap for historical videos of channel ${channel.id} reached.`)
        }
      }

      return videoAssets
    } catch (err) {
      const logDetails = { videoId: video.id, proxy }
      if (err instanceof DurationLimitExceededError) {
        // Skip video creation
        this.logger.error(`${err.message}. Skipping from syncing...`, { ...logDetails }),
        await this.dynamodbService.videos.updateState(video, 'VideoUnavailable::Skipped')
      } else {
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
          { message: 'members-only content', code: VideoUnavailableReasons.Private },
          { message: "This video is available to this channel's members on level", code: VideoUnavailableReasons.Private },
          { message: 'size cap for historical videos', code: VideoUnavailableReasons.Skipped },
          { message: 'Offline', code: VideoUnavailableReasons.LiveOffline },
          { message: 'This live event will begin in a few moments', code: VideoUnavailableReasons.LiveOffline },
          { message: 'Download timed-out', code: VideoUnavailableReasons.DownloadTimedOut },
        ]

        let matchedError = errors.find((e) => errorMsg.includes(e.message))
        if (matchedError) {
          await this.dynamodbService.videos.updateState(video, `VideoUnavailable::${matchedError.code}`)
          this.logger.error(`${errorMsg}. Skipping from syncing...`, { ...logDetails, reason: matchedError.code })
        }
        else if (errorMsg.includes('Sign in to confirm you’re not a bot.')) {
          this.logger.error('Download blocked by YouTube', { ...logDetails })
          if (proxy) {
            this.proxyService?.reportFaultyProxy(proxy)
          }
        }
      }

      // TODO: If Download timed out, should we keep it on disk so it can be resumed later?

      await this.removeAllVideoFiles(video.id)
      throw err
    }
  }
}
