import { FlowJob, Job, JobsOptions } from 'bullmq'
import IORedis from 'ioredis'
import _ from 'lodash'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { DynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { ChannelSyncStatus, YtChannel, YtVideo } from '../../types/youtube'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { JoystreamClient } from '../runtime/client'
import { IYoutubeApi } from '../youtube/api'
import { ContentCreationService } from './ContentCreationService'
import { ContentDownloadService } from './ContentDownloadService'
import { ContentMetadataService } from './ContentMetadataService'
import { ContentUploadService } from './ContentUploadService'
import { JobsFlowManager } from './PriorityQueue'
import { SyncUtils } from './utils'

export class ContentProcessingService {
  private readonly QUEUE_NAME_PREFIXES = ['Upload', 'Creation', 'Metadata', 'Download'] as const

  private jobsManager: JobsFlowManager
  private redisConn: IORedis
  private logger: Logger
  private contentDownloadService: ContentDownloadService
  private contentMetadataService: ContentMetadataService
  private contentCreationService: ContentCreationService
  private contentUploadService: ContentUploadService

  constructor(
    private config: Required<ReadonlyConfig['sync']> & Required<ReadonlyConfig['endpoints']>,
    logging: LoggingService,
    private dynamodbService: DynamodbService,
    youtubeApi: IYoutubeApi,
    private joystreamClient: JoystreamClient,
    queryNodeApi: QueryNodeApi
  ) {
    this.logger = logging.createLogger('ContentProcessingService')
    const { host, port } = this.config.redis
    this.redisConn = new IORedis(port, host, { maxRetriesPerRequest: null })
    this.jobsManager = new JobsFlowManager(this.redisConn)

    this.contentDownloadService = new ContentDownloadService(config, logging, this.dynamodbService, youtubeApi)
    this.contentMetadataService = new ContentMetadataService(logging)
    this.contentCreationService = new ContentCreationService(logging, this.dynamodbService, this.joystreamClient)
    this.contentUploadService = new ContentUploadService(logging, this.dynamodbService, queryNodeApi)

    // create job queues

    const { maxConcurrentDownloads, maxConcurrentUploads, createVideoTxBatchSize } = this.config.limits
    this.jobsManager.createJobQueue({
      name: 'DownloadQueue',
      processorType: 'concurrent',
      concurrencyOrBatchSize: maxConcurrentDownloads,
      processorInstance: this.contentDownloadService,
    })

    this.jobsManager.createJobQueue({
      name: 'MetadataQueue',
      processorType: 'concurrent',
      concurrencyOrBatchSize: maxConcurrentDownloads,
      processorInstance: this.contentMetadataService,
    })

    this.jobsManager.createJobQueue({
      name: 'CreationQueue',
      processorType: 'batch',
      concurrencyOrBatchSize: createVideoTxBatchSize,
      processorInstance: this.contentCreationService,
    })

    this.jobsManager.createJobQueue({
      name: 'UploadQueue',
      processorType: 'concurrent',
      concurrencyOrBatchSize: maxConcurrentUploads,
      processorInstance: this.contentUploadService,
    })

    // log starting and completed events for each job
    const downloadQueueEvents = this.jobsManager.getQueueEvents('DownloadQueue')
    const uploadQueueEvents = this.jobsManager.getQueueEvents('UploadQueue')
    downloadQueueEvents.on('active', (jobId) => this.logger.debug(`Started new job: `, { jobId }))
    uploadQueueEvents.on('completed', (jobId) => this.logger.debug(`Completed a job: `, { jobId }))
  }

  async start(interval: number) {
    this.logger.info(`Starting content processing service.`)

    // Clean up queue state on startup from redis. This is being done to avoid having
    // inconsistent state between queue (redis) and dynamodb (which is persistent storage).
    await this.redisConn.flushall()

    await this.contentDownloadService.start()
    await this.contentMetadataService.start()
    await this.contentCreationService.start()
    await this.contentUploadService.start()

    // start video processing service
    setTimeout(async () => this.processVideosWithInterval(interval), 0)
  }

  private async processVideosWithInterval(processingIntervalMinutes: number) {
    const sleepInterval = processingIntervalMinutes * 60 * 1000
    while (true) {
      this.logger.info(`Content processing service paused for ${processingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      try {
        this.logger.info(`Resume service....`)
        // process unsynced videos
        await this.prepareVideosForProcessing()

        // recalculate jobs priority in each queue
        await Promise.all(this.jobsManager.getJobQueues().map((q) => q.recalculateJobsPriority(this.dynamodbService)))
      } catch (err) {
        this.logger.error(`Critical content processing error`, { err })
      }
    }
  }

  private async prepareVideosForProcessing() {
    const allUnsyncedVideos = await this.dynamodbService.videos.getAllUnsyncedVideos()

    const allUnsyncedVideosByChannelId = _(allUnsyncedVideos)
      .groupBy((v) => v.channelId)
      .map((videos, channelId) => ({ channelId, unsyncedVideos: [...videos] }))
      .value()

    await Promise.all(
      allUnsyncedVideosByChannelId.map(async ({ channelId, unsyncedVideos }) => {
        const channel = await this.dynamodbService.channels.getById(channelId)
        const totalVideos = Math.min(channel.statistics.videoCount, SyncUtils.videoCap(channel))
        const percentageOfCreatorBacklogNotSynched = (unsyncedVideos.length * 100) / totalVideos

        for (const video of unsyncedVideos) {
          let sudoPriority = SyncUtils.DEFAULT_SUDO_PRIORITY
          if (new Date(video.publishedAt) > channel.createdAt && video.duration > 300) {
            sudoPriority += 50
          }

          const priority = SyncUtils.calculateJobPriority(
            sudoPriority,
            percentageOfCreatorBacklogNotSynched,
            Date.parse(video.publishedAt)
          )

          if ((await this.ensureVideoCanBeProcessed(video, channel)) && !(await this.isActiveJobFlow(video.id))) {
            // create new job flow
            const flowJob = this.createFlow(video, priority)

            // add job flow to the flow producer
            const jobNode = await this.jobsManager.addFlowJob(flowJob)

            jobNode.job
          }
        }
      })
    )
  }

  /**
   * Since polling service interval can be arbitrary greater than the video
   * processing service interval, we need to check that video can be created
   * based on it's channel state before adding it to the processing queue.
   */
  private async ensureVideoCanBeProcessed(video: YtVideo, channel: YtChannel): Promise<boolean> {
    const isSyncEnabled = SyncUtils.isSyncEnabled(channel)
    const sizeLimitReached = SyncUtils.hasSizeLimitReached(channel)
    const isCollaboratorSet = await this.joystreamClient.doesChannelHaveCollaborator(channel.joystreamChannelId)
    const isHistoricalVideo = new Date(video.publishedAt) < channel.createdAt
    const freeSpace = this.config.limits.storage - SyncUtils.usedSpace

    const spaceCondition = freeSpace > 0 || (freeSpace === 0 && video.joystreamVideo !== undefined)

    return (
      isSyncEnabled &&
      isCollaboratorSet &&
      (!isHistoricalVideo || (isHistoricalVideo && !sizeLimitReached)) &&
      spaceCondition
    )
  }

  private async isActiveJobFlow(videoId: string): Promise<boolean> {
    for (const jobType of this.QUEUE_NAME_PREFIXES) {
      const jobQueue = this.jobsManager.getJobQueue(`${jobType}Queue`)
      const state = await (await Job.fromId(jobQueue.queue, `${jobType}:${videoId}`))?.getState()
      if (state === 'active' || state === 'delayed' || state === 'prioritized' || state === 'waiting-children') {
        return true
      }
    }
    return false
  }

  private createFlow(video: YtVideo, priority: number): FlowJob {
    // Job name
    const jobName = 'flowJob'

    // Job options
    const jobOptions: JobsOptions = {
      priority,
      failParentOnFailure: true,
    }

    const jobUnit = (jobType: typeof this.QUEUE_NAME_PREFIXES[number]) => {
      return {
        name: jobName,
        data: video,
        queueName: `${jobType}Queue`,
        opts: { ...jobOptions, jobId: `${jobType}:${video.id}` },
      }
    }

    if (video.state === 'VideoCreated' || video.state === 'UploadFailed') {
      return {
        ...jobUnit('Upload'),
        children: [
          {
            ...jobUnit('Download'),
          },
        ],
      }
    } else {
      // Otherwise video state is either 'New' or 'VideoCreationFailed', so return full job flow
      return {
        ...jobUnit('Upload'),
        children: [
          {
            ...jobUnit('Creation'),
            children: [
              {
                ...jobUnit('Metadata'),
                children: [
                  {
                    ...jobUnit('Download'),
                  },
                ],
              },
            ],
          },
        ],
      }
    }
  }

  /**
   * Public Getters
   */

  public async getQueues() {
    return this.jobsManager.getJobQueues().map((q) => q.queue)
  }

  public async getJobsStat() {
    const totalJobs = await this.jobsManager
      .getJobQueue('UploadQueue')
      .queue.getJobCountByTypes('prioritized', 'waiting-children', 'active')
    return { totalJobs }
  }

  public async getJobsStatForChannel(joystreamChannelId: number): Promise<ChannelSyncStatus> {
    const jobs = await this.jobsManager
      .getJobQueue('UploadQueue')
      .queue.getJobs(['active', 'prioritized', 'waiting-children'])

    // TODO: check whether the jobs returned are in the correct order of priority or do we need to sort them
    const channelJobsIndices = jobs.reduce((indices: number[], job, i) => {
      if (job.data.joystreamChannelId === joystreamChannelId) {
        indices.push(i + 1)
      }
      return indices
    }, [])

    // TODO: improve ETA calculation
    const CONFIGURED_ETA_PER_JOB = 60 * 1000 // 1 min
    const fullSyncEta = channelJobsIndices.reduce((eta, index) => eta + CONFIGURED_ETA_PER_JOB * index, 0)

    return {
      backlogCount: channelJobsIndices.length,
      placeInSyncQueue: channelJobsIndices[0],
      fullSyncEta,
    }
  }
}
