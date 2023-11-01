import fs from 'fs'
import fsPromises from 'fs/promises'
import { VideoMetadataAndHash } from './ContentMetadataService'

export class SyncUtils {
  private static readonly MAX_BULLMQ_PRIORITY = 2097152
  private static readonly MAX_SUDO_PRIORITY = 100
  static readonly DEFAULT_SUDO_PRIORITY = 10
  private static readonly OLDEST_PUBLISHED_DATE = 946684800 // Unix timestamp of year 2000

  static readonly downloadedVideoFilePaths = new Map<string, string>()

  private static downloadedVideosSizeSum = 0

  /**
   * Utility methods track and manage the local disk space used by the downloaded video assets.
   */
  static get usedSpace() {
    return this.downloadedVideosSizeSum
  }

  static updateUsedStorageSize(size: number) {
    this.downloadedVideosSizeSum += size
  }

  static setVideoFilePath(videoId: string, filePath: string) {
    this.downloadedVideoFilePaths.set(videoId, filePath)
  }

  static expectedVideoFilePath(videoId: string): string {
    const filePath = this.downloadedVideoFilePaths.get(videoId)
    if (filePath && fs.existsSync(filePath)) {
      return filePath
    }
    throw new Error(`Failed to get video file path: ${videoId}. File not found.`)
  }

  static fileSize(videoId: string): number {
    const videoFilePath = this.expectedVideoFilePath(videoId)
    return fs.statSync(videoFilePath).size
  }

  static async removeVideoFile(videoId: string) {
    const path = this.expectedVideoFilePath(videoId)
    const size = this.fileSize(videoId)
    await fsPromises.unlink(path)
    this.downloadedVideoFilePaths.delete(videoId)
    this.downloadedVideosSizeSum -= size
  }

  static getSizeFromVideoMetadata(videoMetadata: VideoMetadataAndHash) {
    return videoMetadata.mediaMetadata.size + videoMetadata.thumbnailHash.size
  }

  /**
   * Re/calculates the priority score/rank of a video based on the following parameters:
   * - sudoPriority: a number between 0 and 100, where 0 is the lowest priority and 100 is the highest priority.
   * - percentageOfCreatorBacklogNotSynched: a number between 0 and 100, where 0 is the lowest priority and 100 is the highest priority.
   * - viewsOnYouTube: a number between 0 and 10,000,000, where 0 is the lowest priority and 10,000,000 is the highest priority.
   * @returns a number between 0 and 10,000,000, where 0 is the lowest priority and 10,000,000 is the highest priority.
   */
  public static calculateJobPriority(
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
      //TODO: fix - sometimes percentageOfCreatorBacklogNotSynched is greater than 100
      // throw new Error(`Invalid percentageOfCreatorBacklogNotSynched value ${percentageOfCreatorBacklogNotSynched}`)
    }

    return this.convertToBullMQPriority(
      this.measure(sudoPriority, percentageOfCreatorBacklogNotSynched, viewsOnYouTube)
    )
  }

  // Measure the priority of a video for download / creation queue.
  private static measure(sudoPriority: number, percentage: number, publishedAt: number) {
    const currentUnixTime = Date.now()
    const normalizedPublishedDate =
      (100 * (currentUnixTime - publishedAt)) / (currentUnixTime - this.OLDEST_PUBLISHED_DATE)
    const percentageWeight = 1000
    const sudoPriorityWeight = 2 * percentageWeight

    return sudoPriorityWeight * sudoPriority + percentageWeight * percentage + normalizedPublishedDate
  }

  // New function to convert your measurement to BullMQ's priority
  private static convertToBullMQPriority(measuredPriority: number): number {
    // Normalize your measured value into BullMQ's range. For this example,
    // I'm assuming your `measure` function can't produce negative values.
    // The maxMeasuredValue is an assumed value for the maximum output of the measure function.
    // You can adjust this based on your actual possible output or run tests to determine it.
    const maxMeasuredValue = this.MAX_SUDO_PRIORITY * 2 * 1000 + 1000 + 100
    const normalizedPriority = (measuredPriority / maxMeasuredValue) * this.MAX_BULLMQ_PRIORITY

    // Invert the priority for BullMQ's scheme
    return Math.round(this.MAX_BULLMQ_PRIORITY - normalizedPriority + 1)
  }
}
