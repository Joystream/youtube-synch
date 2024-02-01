import AsyncLock from 'async-lock'
import { FlowJob, FlowProducer, Job, Queue, QueueEvents, Worker } from 'bullmq'
import { randomUUID } from 'crypto'
import IORedis from 'ioredis'
import _ from 'lodash'
import { Logger } from 'winston'
import { DynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { YtChannel, YtVideo } from '../../types/youtube'
import { SyncUtils } from './utils'

export const QUEUE_NAME_PREFIXES = ['Upload', 'Creation', 'Metadata', 'Download'] as const

export type QueueNamePrefix = typeof QUEUE_NAME_PREFIXES[number]

export type QueueName = `${QueueNamePrefix}Queue`

export type TaskType<T = YtVideo> = { id: string; priority: number } & T

export type ProcessorType = 'batch' | 'concurrent'

export type ConcurrentProcessor<Task, ReturnData> = (job: Job<Task, ReturnData>) => Promise<ReturnData>

export type BatchProcessor<Task> = (jobs: Job<Task>[]) => Promise<Job<Task>[]>

export interface ProcessorInstance<P, T, R> {
  logger: Logger
  start: () => void
  process: P extends 'concurrent' ? ConcurrentProcessor<T, R> : BatchProcessor<T>
}

type PriorityQueueOptions<
  N extends QueueName = QueueName,
  P extends ProcessorType = ProcessorType,
  T extends TaskType = TaskType,
  R = P extends 'concurrent' ? any : Job<T>[],
  I extends ProcessorInstance<P, T, R> = ProcessorInstance<P, T, R>
> = {
  name: N
  processorType: P
  concurrencyOrBatchSize: number
  processorInstance: I
}

class PriorityJobQueue<
  N extends QueueName = QueueName,
  P extends ProcessorType = ProcessorType,
  T extends TaskType = TaskType,
  R = P extends 'concurrent' ? any : Job<T>[],
  I extends ProcessorInstance<P, T, R> = ProcessorInstance<P, T, R>
> {
  private readonly BATCH_LOCK_KEY = 'batch'
  private readonly RECALCULATE_PRIORITY_LOCK_KEY: string
  private processingCount: number = 0

  private asyncLock: AsyncLock = new AsyncLock({ maxPending: Number.MAX_SAFE_INTEGER })

  private logger: Logger
  private concurrencyOrBatchSize: number
  readonly queue: Queue<T>
  private worker: Worker
  private connection: IORedis

  constructor(redis: ReadonlyConfig['endpoints']['redis'], options: PriorityQueueOptions<N, P, T, R, I>) {
    this.logger = options.processorInstance.logger
    this.concurrencyOrBatchSize = options.concurrencyOrBatchSize
    this.connection = new IORedis(redis.port, redis.host, { maxRetriesPerRequest: null })

    this.queue = new Queue(options.name, { connection: this.connection })
    this.RECALCULATE_PRIORITY_LOCK_KEY = this.queue.name
    // Check processor type
    options.processorType === 'concurrent'
      ? this.setupConcurrentProcessing(
          options.processorInstance.process.bind(options.processorInstance) as ConcurrentProcessor<T, R>
        )
      : this.setupBatchProcessing(
          options.processorInstance.process.bind(options.processorInstance) as BatchProcessor<T>
        )
  }

  private setupConcurrentProcessing(processor: ConcurrentProcessor<T, R>) {
    const wrappedProcessor = async (job: Job<T, R>) => {
      await this.asyncLock.acquire(this.RECALCULATE_PRIORITY_LOCK_KEY, () => this.processingCount++)

      try {
        return await processor(job)
      } finally {
        this.processingCount--
      }
    }

    // Reuse the ioredis instance
    this.worker = new Worker(this.queue.name, wrappedProcessor, {
      connection: this.connection,
      concurrency: this.concurrencyOrBatchSize,
      skipStalledCheck: true,
    })

    this.worker.on('active', (job) => {
      this.logger.debug(`Started job in queue '${this.queue.name}'`, { jobId: job.data.id })
    })

    this.worker.on('completed', (job) => {
      this.logger.debug(`Completed job in queue '${this.queue.name}'`, { jobId: job.data.id })
    })

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Failed job in queue '${this.queue.name}'`, { jobId: job?.data.id, err: err?.message })
    })

    this.worker.on('error', (err) => {
      // log the error
      this.logger.error(err)
    })
  }

  /**
   * A custom batch processor as BullMQ doesn't natively provide any construct to do batch processing of jobs
   */
  private setupBatchProcessing(processor: BatchProcessor<T>) {
    const jobsLockDuration = 60000 // 60 seconds
    let jobsLockTimeout!: NodeJS.Timeout

    this.worker = new Worker(this.queue.name, undefined, {
      connection: this.connection,
      lockDuration: jobsLockDuration,
    })

    // get `N` next jobs that need to be processed
    const getNJobs = async (n: number): Promise<Job[]> => {
      let jobs: Job[] = []
      while (jobs.length < n) {
        const job = await this.worker.getNextJob(randomUUID())

        if (!job) return jobs
        jobs.push(job)
      }
      return jobs
    }

    // Helper to renew job locks in case the jobs batch didn't finish in given lock time
    const renewJobsLock = async (jobs: Job[]) => {
      await Promise.all(jobs.map((job) => job.extendLock(job.token || '', jobsLockDuration)))
      jobsLockTimeout = setTimeout(() => renewJobsLock(jobs), jobsLockDuration / 2) // Half of jobsLockDuration
    }

    const doBatchProcessing = () =>
      this.asyncLock.acquire([this.RECALCULATE_PRIORITY_LOCK_KEY, this.BATCH_LOCK_KEY], async () => {
        const jobs = await getNJobs(this.concurrencyOrBatchSize)
        try {
          if (jobs.length) {
            // Extend lock after half the lock duration has passed
            jobsLockTimeout = setTimeout(async () => await renewJobsLock(jobs), jobsLockDuration / 2)

            // Move all the successfully completed batch jobs to 'completed' state
            const completed = await processor(jobs)
            await Promise.all(completed.map((job) => job.moveToCompleted(job.data, job.token || '', false)))

            // Move all the unprocessed batch jobs to 'delayed' state, so that they can be processed in the next batch
            const unprocessed = jobs.filter((job) => !completed.some((c) => c.id === job.id))
            await Promise.all(unprocessed.map((job) => job.moveToDelayed(Date.now(), job.token || '')))
          }
        } catch (err) {
          this.logger.error(err)

          // Move all the failed batch jobs to 'failed' state
          await Promise.all(jobs.map((job) => job.moveToFailed(err as Error, job.token || '', false)))
        } finally {
          clearTimeout(jobsLockTimeout)
        }
      })

    setInterval(async () => await doBatchProcessing(), 6000 /* 6 seconds (1 block time) interval */)
  }

  async addJob(data: T): Promise<void> {
    const maybeJob = await Job.fromId(this.queue, data.id)
    if (maybeJob) {
      await maybeJob.changePriority({ priority: data.priority })
    } else {
      await this.queue.add(`${this.queue.name}Job`, data, { jobId: data.id, priority: data.priority })
    }
  }

  async recalculateJobsPriority({ channels }: DynamodbService) {
    await this.asyncLock.acquire(this.RECALCULATE_PRIORITY_LOCK_KEY, async () => {
      // Wait until all processing tasks have completed
      while (this.processingCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      const jobs = await this.queue.getJobs(['prioritized'])

      const jobsByChannelId = _(jobs)
        .groupBy((v) => v.data.channelId)
        .map((jobs, channelId) => ({ channelId, unprocessedJobs: [...jobs] }))
        .value()

      await Promise.all(
        jobsByChannelId.map(async ({ channelId, unprocessedJobs }) => {
          // Get total videos of channel
          const channel = await channels.getById(channelId)

          const totalVideos = YtChannel.totalVideos(channel)
          const percentageOfCreatorBacklogNotSynched = (unprocessedJobs.length * 100) / totalVideos

          for (const job of unprocessedJobs) {
            let sudoPriority = SyncUtils.DEFAULT_SUDO_PRIORITY

            // Prioritize syncing new videos over old ones
            if (new Date(job.data.publishedAt) > channel.createdAt && job.data.duration > 300) {
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
              Date.parse(job.data.publishedAt)
            )

            await job.changePriority({ priority })
          }
        })
      )
    })
  }
}

export class FlowJobManager {
  private flowProducer: FlowProducer
  private pJobQueueByName: Map<QueueName, PriorityJobQueue> = new Map()
  private queueByName: Map<QueueName, Queue> = new Map()
  private queueEventsByName: Map<QueueName, QueueEvents> = new Map()
  private connection: IORedis

  constructor(private redis: ReadonlyConfig['endpoints']['redis']) {
    this.connection = new IORedis(redis.port, redis.host, { maxRetriesPerRequest: null })
    this.flowProducer = new FlowProducer({ connection: this.connection })
  }

  /**
   * @param options queue options
   */
  createJobQueue(options: PriorityQueueOptions) {
    if (this.pJobQueueByName.has(options.name)) {
      throw new Error(`Job queue with name ${options.name} already exists`)
    }

    const pJobQueue = new PriorityJobQueue(this.redis, options)

    this.pJobQueueByName.set(options.name, pJobQueue)
    this.queueByName.set(options.name, pJobQueue.queue)
  }

  /**
   * @param name queue name
   * @returns Queue instance
   */
  getJobQueue(name: QueueName): Queue {
    const queue = this.queueByName.get(name)

    if (!queue) {
      const connection = new IORedis(this.redis.port, this.redis.host, { maxRetriesPerRequest: null })
      const newQueue = new Queue(name, { connection })
      this.queueByName.set(name, newQueue)
      return newQueue
    }

    return queue
  }

  /**
   * @param name queue name
   * @returns Queue events listener
   */
  getQueueEvents(name: QueueName): QueueEvents {
    const jobQueue = this.pJobQueueByName.get(name)

    if (!jobQueue) {
      throw new Error(`Can't get queue events listener for non-existent queue ${name}`)
    }

    return this.queueEventsByName.get(name) || new QueueEvents(name, { connection: this.connection })
  }

  get getQueues(): Queue[] {
    const queues = [...this.queueByName.values()]

    if (queues.length !== QUEUE_NAME_PREFIXES.length) {
      return QUEUE_NAME_PREFIXES.map((prefix) => {
        const queueName: QueueName = `${prefix}Queue`
        const connection = new IORedis(this.redis.port, this.redis.host, { maxRetriesPerRequest: null })
        const newQueue = new Queue(queueName, { connection })
        this.queueByName.set(queueName, newQueue)
        return newQueue
      })
    }

    return queues
  }

  async addFlowJob(flowJob: FlowJob) {
    return this.flowProducer.add(flowJob)
  }

  async recalculateJobsPriority(dynamodbService: DynamodbService) {
    await Promise.all(
      [...this.pJobQueueByName.values()].map((jobQueue) => jobQueue.recalculateJobsPriority(dynamodbService))
    )
  }
}
