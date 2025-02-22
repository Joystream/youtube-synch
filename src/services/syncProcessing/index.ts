import { FlowChildJob, FlowJob, Job, Queue } from 'bullmq'
import IORedis from 'ioredis'
import _ from 'lodash'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { DynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { ChannelSyncStatus, YtChannel, YtVideo } from '../../types/youtube'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { RuntimeApi } from '../runtime/api'
import { JoystreamClient } from '../runtime/client'
import { IYoutubeApi } from '../youtube/api'
import { ContentCreationService } from './ContentCreationService'
import { ContentDownloadService } from './ContentDownloadService'
import { ContentMetadataService } from './ContentMetadataService'
import { ContentUploadService } from './ContentUploadService'
import { FlowJobManager, QUEUE_NAME_PREFIXES, QueueNamePrefix, TaskType } from './PriorityQueue'
import { SyncUtils } from './utils'
import { Socks5ProxyService } from '../proxy/Socks5ProxyService'

export interface IContentProcessingClient {
  getQueues: Queue<TaskType<YtVideo>, any, string>[]
  getJobsCount(): Promise<{ totalCount: number }>
  getJobsStatForChannel(channelId: string): Promise<ChannelSyncStatus>
}

export class ContentProcessingClient implements IContentProcessingClient {
  protected flowManager: FlowJobManager
  private videoCreationBatchSize: number

  constructor(config: ReadonlyConfig['sync'] & ReadonlyConfig['endpoints']) {
    this.flowManager = new FlowJobManager(config.redis)
    this.videoCreationBatchSize = config.limits?.createVideoTxBatchSize || 10
  }

  get getQueues() {
    return this.flowManager.getQueues
  }

  public async getJobsCount() {
    const totalCount = await this.flowManager
      .getJobQueue('UploadQueue')
      .getJobCountByTypes('prioritized', 'waiting-children', 'active')
    return { totalCount }
  }

  public async getJobsStatForChannel(channelId: string): Promise<ChannelSyncStatus> {
    const activeJobs = await this.flowManager.getJobQueue('UploadQueue').getJobs('active')
    const waitingJobs = await this.flowManager.getJobQueue('UploadQueue').getJobs(['prioritized', 'waiting-children'])

    // TODO: check whether the jobs returned are in the correct order of priority or do we need to sort them
    const waitingJobsIndices = waitingJobs.reduce((indices: number[], job, i) => {
      if (job.data.channelId === channelId) {
        // Since the `CreationQueue` is the limiting factor in jobs processing throughput, we will use it's configuration option to
        const jobIndex = Math.ceil((i + activeJobs.length + 1) / this.videoCreationBatchSize)
        indices.push(jobIndex)
      }
      return indices
    }, [])

    // TODO: another improvement -> get all the ['active', 'prioritized', 'waiting-children'] jobs separately and then assign different eta to each stage respectively

    // TODO: improve ETA calculation by taking into consideration the size of each video as well as its place in the queue

    const CONFIGURED_ETA_PER_JOB_IN_SECS = 60 // 1 min
    const channelActiveJobs = activeJobs.filter((j) => j.data.channelId === channelId)
    const activeJobsEta = channelActiveJobs.length ? CONFIGURED_ETA_PER_JOB_IN_SECS : 0
    const waitingJobsEta = waitingJobsIndices.reduce((eta, index) => eta + CONFIGURED_ETA_PER_JOB_IN_SECS * index, 0)
    const fullSyncEta = activeJobsEta + waitingJobsEta

    // take constant ETA time consideration for all the active jobs
    return {
      backlogCount: channelActiveJobs.length + waitingJobsIndices.length,
      // TODO: if channelJobsIndices[0] < maxUploadsCount, then placeInSyncQueue = 1
      placeInSyncQueue: channelActiveJobs.length ? 1 : waitingJobsIndices[0],
      fullSyncEta,
    }
  }
}

export class ContentProcessingService extends ContentProcessingClient implements IContentProcessingClient {
  private logger: Logger
  private contentDownloadService: ContentDownloadService
  private contentMetadataService: ContentMetadataService
  private contentCreationService: ContentCreationService
  private contentUploadService: ContentUploadService

  constructor(
    private config: Required<ReadonlyConfig['sync']> & ReadonlyConfig['endpoints'],
    logging: LoggingService,
    private dynamodbService: DynamodbService,
    youtubeApi: IYoutubeApi,
    runtimeApi: RuntimeApi,
    private joystreamClient: JoystreamClient,
    queryNodeApi: QueryNodeApi,
    private proxyService?: Socks5ProxyService
  ) {
    super(config)
    this.logger = logging.createLogger('ContentProcessingService')

    this.contentDownloadService = new ContentDownloadService(config, logging, dynamodbService, youtubeApi, proxyService)
    this.contentMetadataService = new ContentMetadataService(config, logging, dynamodbService)
    this.contentCreationService = new ContentCreationService(logging, dynamodbService, joystreamClient)
    this.contentUploadService = new ContentUploadService(logging, dynamodbService, runtimeApi, queryNodeApi)

    // create job queues

    const { maxConcurrentDownloads, maxConcurrentUploads, createVideoTxBatchSize } = this.config.limits
    const onFailedJob = (queueName: string) => (jobId: string | undefined, err: Error, logger: Logger) => {
      const usedProxy = jobId ? this.proxyService?.unbindProxy(jobId) : undefined
      logger.error(`Failed job in queue '${queueName}'`, { jobId, proxy: usedProxy, err })
    }
    this.flowManager.createJobQueue({
      name: 'DownloadQueue',
      processorType: 'concurrent',
      concurrencyOrBatchSize: maxConcurrentDownloads,
      processorInstance: this.contentDownloadService,
      onFailure: onFailedJob('DownloadQueue')
    })

    this.flowManager.createJobQueue({
      name: 'MetadataQueue',
      processorType: 'concurrent',
      concurrencyOrBatchSize: maxConcurrentDownloads,
      processorInstance: this.contentMetadataService,
      onFailure: onFailedJob('MetadataQueue')
    })

    this.flowManager.createJobQueue({
      name: 'CreationQueue',
      processorType: 'batch',
      concurrencyOrBatchSize: createVideoTxBatchSize,
      processorInstance: this.contentCreationService,
      onFailure: onFailedJob('CreationQueue')
    })

    this.flowManager.createJobQueue({
      name: 'UploadQueue',
      processorType: 'concurrent',
      concurrencyOrBatchSize: maxConcurrentUploads,
      processorInstance: this.contentUploadService,
      onFailure: onFailedJob('UploadQueue')
    })

    // log starting and completed events for each job
    const downloadQueueEvents = this.flowManager.getQueueEvents('DownloadQueue')
    const uploadQueueEvents = this.flowManager.getQueueEvents('UploadQueue')
    downloadQueueEvents.on('active', ({ jobId }) => this.logger.verbose(`Started processing of job:`, { jobId }))
    uploadQueueEvents.on('completed', ({ jobId }) => {
      const usedProxy = this.proxyService?.unbindProxy(jobId)
      this.logger.verbose(`Completed processing of job:`, { jobId, proxy: usedProxy })
    })
  }

  async start(interval: number) {
    this.logger.info(`Starting content processing service.`)

    // Clean up queue state on startup from redis. This is being done to avoid having
    // inconsistent state between queue (redis) and dynamodb (which is persistent storage).
    const { host, port } = this.config.redis
    const connection = new IORedis(port, host, { maxRetriesPerRequest: null })
    await connection.flushall()
    connection.disconnect()

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
      try {
        // process unsynced videos
        await this.prepareVideosForProcessing()

        // recalculate jobs priority in each queue
        await this.flowManager.recalculateJobsPriority(this.dynamodbService)
      } catch (err) {
        this.logger.error(`Critical content processing error`, { err })
      }
      this.logger.info(`Content processing service paused for ${processingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      this.logger.info(`Resume service....`)
    }
  }

  private async prepareVideosForProcessing() {
    const allUnsyncedVideos = await this.dynamodbService.videos.getAllUnsyncedVideos()

    if (this.config.limits.storage - SyncUtils.usedSpace < 0) {
      this.logger.warn(`Local disk space is fully used. The processing of new videos will be postponed.`)
    }

    console.log('allUnsyncedVideos', allUnsyncedVideos.length)
    const allUnsyncedVideosByChannelId = _(allUnsyncedVideos)
      .groupBy((v) => v.channelId)
      .map((videos, channelId) => ({ channelId, unsyncedVideos: [...videos] }))
      .value()

    // Parents of failed jobs are not automatically cleaned up, so make sure
    // to clean any jobs in `completed` and `failed` state before adding new ones.
    // (otherwise it may fail due to jobId clash)
    await this.cleanCompletedAndFailedJobs()

    await Promise.all(
      allUnsyncedVideosByChannelId.map(async ({ channelId, unsyncedVideos }) => {
        const channel = await this.dynamodbService.channels.getById(channelId)
        const totalVideos = YtChannel.totalVideos(channel)
        const percentageOfCreatorBacklogNotSynched = (unsyncedVideos.length * 100) / (totalVideos || 1)

        for (const video of unsyncedVideos) {
          if ((await this.ensureVideoCanBeProcessed(video, channel)) && !(await this.jobFlowExists(video.id))) {
            let sudoPriority = SyncUtils.DEFAULT_SUDO_PRIORITY

            // Prioritize syncing new videos over old ones
            if (new Date(video.publishedAt) > channel.createdAt && video.duration > 300) {
              sudoPriority += 20
            }

            // Prioritize syncing videos of the non-Bronze channels
            if (
              channel.yppStatus === 'Verified::Diamond' ||
              channel.yppStatus === 'Verified::Gold' ||
              channel.yppStatus === 'Verified::Silver'
            ) {
              sudoPriority += 20
            }

            const priority = SyncUtils.calculateJobPriority(
              sudoPriority,
              percentageOfCreatorBacklogNotSynched,
              Date.parse(video.publishedAt)
            )

            // create new job flow
            const flowJob = this.createFlow(video, priority)

            // add job flow to the flow producer
            const jobNode = await this.flowManager.addFlowJob(flowJob)

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
    const isSyncEnabled = YtChannel.isSyncEnabled(channel)
    const sizeLimitReached = YtChannel.hasSizeLimitReached(channel)
    const isCollaboratorSet = await this.joystreamClient.doesChannelHaveCollaborator(channel.joystreamChannelId)
    const isHistoricalVideo = new Date(video.publishedAt) < channel.createdAt
    const freeSpace = this.config.limits.storage - SyncUtils.usedSpace

    // Consider video for processing if it has been created on-chain, and only needs
    // to be uploaded on the storage network. Otherwise postpone the video creation.
    const spaceCondition = freeSpace > 0 || (freeSpace <= 0 && video.joystreamVideo !== undefined)

    const shouldBeProcessed =
      isSyncEnabled &&
      isCollaboratorSet &&
      (!isHistoricalVideo || (isHistoricalVideo && !sizeLimitReached)) &&
      spaceCondition

    if (!shouldBeProcessed && SyncUtils.downloadedVideoAssetPaths.has(video.id)) {
      await SyncUtils.removeVideoAssets(video.id)
    }

    return shouldBeProcessed
  }

  private async jobFlowExists(videoId: string): Promise<boolean> {
    for (const jobType of QUEUE_NAME_PREFIXES) {
      const jobQueue = this.flowManager.getJobQueue(`${jobType}Queue`)
      const job = await Job.fromId(jobQueue, videoId)
      if (job) {
        return true
      }
    }
    return false
  }

  private async cleanCompletedAndFailedJobs(): Promise<void> {
    this.logger.verbose('Cleaning up completed and failed jobs...')
    for (const jobType of QUEUE_NAME_PREFIXES) {
      const jobQueue = this.flowManager.getJobQueue(`${jobType}Queue`)
      await jobQueue.clean(0, 0, 'completed')
      await jobQueue.clean(0, 0, 'failed')
    }
  }

  private createFlow(video: YtVideo, priority: number): FlowJob {
    const jobUnit = (jobType: QueueNamePrefix): FlowChildJob => {
      return {
        name: 'flowJob',
        data: video,
        queueName: `${jobType}Queue`,
        opts: {
          priority,
          failParentOnFailure: true,
          removeOnComplete: true,
          removeOnFail: true,
          jobId: video.id,
        },
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
}
