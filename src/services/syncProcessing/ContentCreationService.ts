import { SubmittableExtrinsic } from '@polkadot/api/types'
import type { ISubmittableResult } from '@polkadot/types/types'
import { Job } from 'bullmq'
import _ from 'lodash'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { CreateVideoJobData, MetadataJobOutput, YtChannel } from '../../types/youtube'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { SyncUtils } from './utils'

// Video content creation/processing service
export class ContentCreationService {
  readonly logger: Logger
  private lastVideoCreationBlockByChannelId: Map<number, number> // JsChannelId -> Last video creation block number

  constructor(
    logging: LoggingService,
    private dynamodbService: IDynamodbService,
    private joystreamClient: JoystreamClient
  ) {
    this.logger = logging.createLogger('ContentCreationService')
    this.lastVideoCreationBlockByChannelId = new Map()
  }

  async start() {
    await this.ensureContentStateConsistency()
  }

  async process(jobs: Job<CreateVideoJobData>[]): Promise<Job<CreateVideoJobData>[]> {
    const txByJob: Map<Job<CreateVideoJobData>, SubmittableExtrinsic<'promise', ISubmittableResult>> = new Map()

    // updated channel data (historicalVideoSyncedSize)
    const updatedChannels: YtChannel[] = []

    // Helper function to return the planned/completed jobs
    const jobsToComplete = () => {
      const jobs = [...txByJob.keys()]
      const data = jobs.map((j) => j.data)
      return { jobs, data }
    }

    try {
      const [app, collaborator] = await Promise.all([
        this.joystreamClient.getApp(),
        this.joystreamClient.getCollaboratorMember(),
      ])

      const jobsByChannelId = _(jobs)
        .groupBy((j) => j.data.channelId)
        .map((jobs, channelId) => ({ channelId, jobs: [...jobs] }))
        .value()

      await Promise.all(
        jobsByChannelId.map(async ({ channelId, jobs }) => {
          const channel = await this.dynamodbService.channels.getById(channelId)
          const blockNumber = this.lastVideoCreationBlockByChannelId.get(channel.joystreamChannelId) || 0
          if (!(await this.joystreamClient.hasQueryNodeProcessedBlock(blockNumber))) {
            return []
          }

          const [appActionNonce, extrinsicDefaults] = await Promise.all([
            this.joystreamClient.totalVideosCreatedByChannel(channel.joystreamChannelId),
            this.joystreamClient.createVideoExtrinsicDefaults(channel.joystreamChannelId),
          ])

          // Important: Don't use Promise.all(jobs.map(...)) here, as we need to sequentially construct the
          // TXs from jobs and place them in the batched tx call in the same order as the jobs. This is to
          // correctly construct app action nonce (using job's index in the "jobs" array) for each video.
          for (const [i, job] of jobs.entries()) {
            // get computed metadata object
            const videoMetadata = Object.values(await job.getChildrenValues<MetadataJobOutput>())[0]
            if (!videoMetadata) {
              throw new Error(`Failed to get video metadata from 'completed' child job: ${job.id}`)
            }

            // TODO: Remove this. temporary fix to ensure no duplicate videos created
            const qnVideo = await this.joystreamClient.getVideoByYtResourceId(job.data.id)
            if (qnVideo) {
              this.logger.error(
                `Inconsistent state. Youtube video ${job.data.id} was already created on Joystream but the service tried to recreate it.`,
                { videoId: job.data.id, channelId: channel.joystreamChannelId }
              )
              await this.dynamodbService.videos.updateState(job.data, 'CreatingVideo')
              process.exit(1)
            }

            // create submittable tx
            const tx = await this.joystreamClient.createVideoTx(
              app.id,
              appActionNonce + i,
              collaborator,
              extrinsicDefaults,
              { ...job.data, joystreamChannelId: channel.joystreamChannelId, videoMetadata }
            )

            // set submittable tx for each job
            txByJob.set(job, tx)

            // update historicalVideoSyncedSize by adding the size of historical videos
            const isHistoricalVideo = new Date(job.data.publishedAt) < channel.createdAt
            if (isHistoricalVideo) {
              const size = SyncUtils.getSizeFromVideoMetadata(videoMetadata)
              channel.historicalVideoSyncedSize += size
            }
          }

          updatedChannels.push(channel)
        })
      )

      // No jobs planned to be executed in this batch
      if (jobsToComplete().jobs.length === 0) {
        return []
      }

      // pre-commit videos state to 'CreatingVideo' to lock the videos
      await this.dynamodbService.videos.batchUpdateState(jobsToComplete().data, 'CreatingVideo')

      // send batch extrinsic
      const { blockNumber, result } = await this.joystreamClient.sendBatchExtrinsic(collaborator.controllerAccount.id, [
        ...txByJob.values(),
      ])

      // update last video creation block number
      updatedChannels.map((c) => this.lastVideoCreationBlockByChannelId.set(c.joystreamChannelId, blockNumber))

      // update jobs data
      await Promise.all(jobsToComplete().jobs.map((j, i) => j.updateData({ ...j.data, ...result[i] })))

      // post creation videos and channels state updates
      await this.dynamodbService.videos.batchUpdateState(jobsToComplete().data, 'VideoCreated')
      await this.dynamodbService.channels.batchSave(updatedChannels)

      this.logger.info(`Successfully created ${txByJob.size} videos on chain using TX batch.`, {
        videoIds: jobsToComplete().data.map((j) => j.id),
      })

      // return completed jobs
      return [...jobsToComplete().jobs]
    } catch (err) {
      err = new Error(
        `Got error creating ${txByJob.size} videos: \n ${JSON.stringify({
          videoIds: jobsToComplete().data.map((j) => j.id),
          err: (err as Error).message,
        })}`
      )

      await this.dynamodbService.videos.batchUpdateState(jobsToComplete().data, 'VideoCreationFailed')

      // No Job was completed
      throw err
    }
  }

  /**
   * Whenever the service exits unexpectedly and starts again, we need to ensure that the state of the videos
   * is consistent, since task processing function isn't an atomic operation. For example, if the service is
   * killed while processing the video, it may happen that the video is in the `CreatingVideo` state, but it
   * was actually created on the chain. So for this video we need to update the state to `VideoCreated`.
   */
  private async ensureContentStateConsistency() {
    const videosInProcessingState = await this.dynamodbService.videos.getVideosInState('CreatingVideo')

    for (const v of videosInProcessingState) {
      const qnVideo = await this.joystreamClient.getVideoByYtResourceId(v.id)
      if (qnVideo) {
        // If QN return a video with given YT video ID attribution, then it means that
        // video was already created so video state should be updated accordingly.
        const { id, media, thumbnailPhoto } = qnVideo
        const createdVideo = { ...v, joystreamVideo: { id, assetIds: [media?.id || '', thumbnailPhoto?.id || ''] } }
        await this.dynamodbService.videos.updateState(createdVideo, 'VideoCreated')
      } else {
        await this.dynamodbService.videos.updateState(v, 'New')
      }
    }
  }
}
