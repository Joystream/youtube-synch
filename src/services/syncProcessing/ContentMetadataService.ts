import { Job } from 'bullmq'
import fs from 'fs'
import pTimeout from 'p-timeout'
import { Logger } from 'winston'
import { DownloadJobOutput, MetadataJobData, MetadataJobOutput } from '../../types/youtube'
import { FileHash, computeFileHashAndSize } from '../../utils/hasher'
import { LoggingService } from '../logging'
import { getThumbnailAsset, getVideoFileMetadata } from '../runtime/client'
import { VideoFileMetadata } from '../runtime/types'

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

  public constructor(logging: LoggingService) {
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

    const videoHashStream = fs.createReadStream(downloadJobOutput.filePath)
    const thumbnailPhotoStream = await getThumbnailAsset(video.thumbnails)

    const [thumbnailHash, mediaHash, mediaMetadata] = await pTimeout(
      Promise.all([
        computeFileHashAndSize(thumbnailPhotoStream),
        computeFileHashAndSize(videoHashStream),
        getVideoFileMetadata(downloadJobOutput.filePath),
      ]),
      30 * 60 * 1000, // 30 mins
      'Video metadata & hash calculation operation timed=out'
    )

    return { thumbnailHash, mediaHash, mediaMetadata }
  }
}
