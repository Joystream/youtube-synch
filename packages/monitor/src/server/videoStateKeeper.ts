import { SyncService } from '@joystream/ytube'
import { Logger, VideoEvent, VideoStates, toPrettyJSON } from '@youtube-sync/domain'
import Queue from 'better-queue'
import SqlStore from 'better-queue-sql'

const MAX_SUDO_PRIORITY = 100
const DEFAULT_SUDO_PRIORITY = 10
const MAX_VIEWS_ON_YOUTUBE = 10000000 // 10 Million
const MAX_VIDEO_RANK = measure(MAX_SUDO_PRIORITY, 100, MAX_VIEWS_ON_YOUTUBE)

type VideoQueueTask = {
  id: string // Video id
  title: string // Video id
  channelId: string // Channel id
  priorityScore: number //
}

export class VideoStateKeeper {
  private queue: Queue<VideoQueueTask>
  private syncService: SyncService
  private store = {
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    dbname: process.env.POSTGRES_DB,
  }

  constructor(syncService: SyncService) {
    this.syncService = syncService
    this.queue = new Queue(
      async (video: VideoQueueTask, cb) => {
        try {
          Logger.info(`Processing event: ${toPrettyJSON(video)}`)

          // Process the video creation task based on the priority score
          await this.syncService.createVideo(video.channelId, video.id)

          // Signal that the task is done
          cb(null, null)
        } catch (error) {
          Logger.error(`Got error processing video: ${video.id}, error: ${error}`)

          // Signal that the task is done
          cb(error, null)
        }
      },
      {
        storeMaxRetries: 10,
        store: new SqlStore(this.store),
        priority: (video: VideoQueueTask, cb) => cb(null, video.priorityScore),
      }
    )
  }

  async processNewVideo(videoEvent: VideoEvent) {
    // Get all videos of a channel
    const videosRepo = await this.syncService.getVideosRepo()
    const videosByChannel = await videosRepo.query({ channelId: videoEvent.channelId }, (q) => q)

    const unSyncedVideosByChannel = videosByChannel.filter(
      (v) => VideoStates[v.state] <= VideoStates.VideoCreationFailed && v.privacyStatus === 'public'
    )
    const percentageOfCreatorBacklogNotSynched = (unSyncedVideosByChannel.length * 100) / videosByChannel.length

    // Re-calculate priority score/rank for all unSynced videos of a channel
    for (const v of unSyncedVideosByChannel) {
      const rank = videoRank(DEFAULT_SUDO_PRIORITY, percentageOfCreatorBacklogNotSynched, v.viewCount)
      const task = { id: v.id, title: v.title, channelId: v.channelId, priorityScore: rank }
      this.queue.push(task)
    }
  }

  getStats() {
    return this.queue.getStats()
  }
}

function isIntegerInRange(value: number, min: number, max: number) {
  return value >= min && value <= max
}

function measure(x: number, y: number, z: number) {
  return x * (100 * (MAX_VIEWS_ON_YOUTUBE + 1) + MAX_VIEWS_ON_YOUTUBE + 1) + y * (MAX_VIEWS_ON_YOUTUBE + 1) + z
}

function videoRank(sudoPriority: number, percentageOfCreatorBacklogNotSynched: number, viewsOnYouTube: number) {
  if (!isIntegerInRange(sudoPriority, 0, MAX_SUDO_PRIORITY)) {
    throw new Error(
      `Invalid sudoPriority value ${sudoPriority}, should be an integer between 0 and ${MAX_SUDO_PRIORITY}`
    )
  } else if (!isIntegerInRange(percentageOfCreatorBacklogNotSynched, 0, 100)) {
    throw new Error(`Invalid percentageOfCreatorBacklogNotSynched value ${percentageOfCreatorBacklogNotSynched}`)
  } else if (
    viewsOnYouTube > MAX_VIEWS_ON_YOUTUBE
      ? MAX_VIEWS_ON_YOUTUBE
      : !isIntegerInRange(viewsOnYouTube, 0, MAX_VIEWS_ON_YOUTUBE)
  ) {
    throw new Error('Invalid viewsOnYouTube')
  }

  const rank = Math.ceil(measure(sudoPriority, percentageOfCreatorBacklogNotSynched, viewsOnYouTube))

  if (!isIntegerInRange(rank, 0, MAX_VIDEO_RANK)) {
    throw new Error(`Invalid rank: ${rank}, should be less than ${MAX_VIDEO_RANK}`)
  }

  return rank
}
