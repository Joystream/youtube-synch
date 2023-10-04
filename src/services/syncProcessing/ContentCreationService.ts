import { SubmittableExtrinsic } from '@polkadot/api/types'
import type { ISubmittableResult } from '@polkadot/types/types'
import BN from 'bn.js'
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
  private lastVideoCreationBlockByChannelId: Map<number, BN> // JsChannelId -> Last video creation block number

  constructor(
    logging: LoggingService,
    private dynamodbService: IDynamodbService,
    private joystreamClient: JoystreamClient
  ) {
    this.logger = logging.createLogger('ContentCreationService')
    this.dynamodbService = dynamodbService
    this.joystreamClient = joystreamClient
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

      const tasksByJoystreamChannelId = _(jobs)
        .groupBy((j) => j.data.joystreamChannelId)
        .map((jobs, joystreamChannelId) => ({ joystreamChannelId, jobs: [...jobs] }))
        .value()

      await Promise.all(
        tasksByJoystreamChannelId.map(async ({ joystreamChannelId, jobs }) => {
          const channelId = Number(joystreamChannelId)
          const blockNumber = this.lastVideoCreationBlockByChannelId.get(channelId) || new BN(0)
          if (!(await this.joystreamClient.hasQueryNodeProcessedBlock(blockNumber))) {
            return []
          }

          const [channel, appActionNonce, extrinsicDefaults] = await Promise.all([
            this.dynamodbService.channels.getByJoystreamId(channelId),
            this.joystreamClient.totalVideosCreatedByChannel(channelId),
            this.joystreamClient.createVideoExtrinsicDefaults(channelId),
          ])

          await Promise.all(
            jobs.map(async (job, i) => {
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
                  { videoId: job.data.id, channelId: job.data.joystreamChannelId }
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
                { ...job.data, videoMetadata }
              )

              // set submittable tx for each job
              txByJob.set(job, tx)

              // update historicalVideoSyncedSize by adding the size of historical videos
              const isHistoricalVideo = new Date(job.data.publishedAt) < channel.createdAt
              if (isHistoricalVideo) {
                const size = SyncUtils.getSizeFromVideoMetadata(videoMetadata)
                channel.historicalVideoSyncedSize += size
              }
            })
          )

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
      const { blockNumber, result } = await this.joystreamClient.sendBatchExtrinsic(collaborator.controllerAccount, [
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
      return jobsToComplete().jobs
    } catch (err) {
      this.logger.error(`Got error creating ${txByJob.size} videos`, {
        videoIds: jobsToComplete().data.map((j) => j.id),
        err,
      })

      await this.dynamodbService.videos.batchUpdateState(jobsToComplete().data, 'VideoCreationFailed')

      // No Job was completed
      return []
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
