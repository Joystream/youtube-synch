import { Job } from 'bullmq'
import fs from 'fs'
import pTimeout from 'p-timeout'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { DownloadJobOutput, MetadataJobData, MetadataJobOutput } from '../../types/youtube'
import { FileHash, computeFileHashAndSize } from '../../utils/hasher'
import { LoggingService } from '../logging'
import { getVideoFileMetadata } from '../runtime/client'
import { VideoFileMetadata } from '../runtime/types'
import { SyncUtils } from './utils'
import { ReadonlyConfig } from '../../types'

export type VideoMetadataAndHash = {
  thumbnailHash: FileHash
  mediaHash: FileHash
  mediaMetadata: VideoFileMetadata
}

/**
 * Videos assets hash & metadata computation service
 */
export class ContentMetadataService {
  readonly logger: Logger

  public constructor(
    private config: Required<ReadonlyConfig['sync']>,
    logging: LoggingService,
    private dynamodbService: IDynamodbService
  ) {
    this.logger = logging.createLogger('ContentHashingService')
  }

  async start() {}

  /// Process metadata creation tasks based on their priority.
  async process(job: Job<MetadataJobData>): Promise<MetadataJobOutput> {
    // get video data from job
    const video = job.data

    // get downloaded video path
    const downloadJobOutput = Object.values(await job.getChildrenValues<DownloadJobOutput>())[0]
    if (!downloadJobOutput) {
      throw new Error(`Failed to get video file path from 'completed' child job: ${video.id}. File not found.`)
    }

    const videoHashStream = fs.createReadStream(downloadJobOutput.video)
    const thumbnailPhotoStream = fs.createReadStream(downloadJobOutput.thumbnail)

    const [thumbnailHash, mediaHash, mediaMetadata] = await pTimeout(
      Promise.all([
        computeFileHashAndSize(thumbnailPhotoStream),
        computeFileHashAndSize(videoHashStream),
        getVideoFileMetadata(downloadJobOutput.video),
      ]),
      30 * 60 * 1000, // 30 mins
      'Video metadata & hash calculation operation timed=out'
    )

    const { maxVideoSizeMB, maxVideoDuration } = this.config.limits
    if (
      (maxVideoSizeMB && mediaMetadata.size > maxVideoSizeMB * 1_000_000) || 
      (maxVideoDuration && mediaMetadata.duration && mediaMetadata.duration > maxVideoDuration)
    ) {
      // Skip video creation
      await this.dynamodbService.videos.updateState(video, 'VideoUnavailable::Skipped')

      // Remove video file
      await SyncUtils.removeVideoAssets(video.id)

      // Throw error to stop processing
      throw new Error(`Video size or duration exceeds the limit (`+
        `size: ${mediaMetadata.size} / ${maxVideoSizeMB ? maxVideoSizeMB * 1_000_000 : undefined}, `+
        `duration: ${mediaMetadata.duration} / ${maxVideoDuration}` +
      `). Video skipped.`)
    }
    return { thumbnailHash, mediaHash, mediaMetadata }
  }
}
