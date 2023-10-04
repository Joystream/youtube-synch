import AsyncLock from 'async-lock'
import { FlowJob, FlowProducer, Job, Queue, QueueEvents, Worker } from 'bullmq'
import { randomUUID } from 'crypto'
import IORedis from 'ioredis'
import _ from 'lodash'
import { Logger } from 'winston'
import { DynamodbService } from '../../repository'
import { YtVideo } from '../../types/youtube'
import { SyncUtils } from './utils'

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
  P extends ProcessorType,
  T extends TaskType,
  R = P extends 'concurrent' ? any : Job<T>[],
  I extends ProcessorInstance<P, T, R> = ProcessorInstance<P, T, R>
> = {
  name: string
  processorType: P
  concurrencyOrBatchSize: number
  processorInstance: I
}

export class PriorityJobQueue<
  P extends ProcessorType = ProcessorType,
  T extends TaskType = TaskType,
  R = P extends 'concurrent' ? any : Job<T>[],
  I extends ProcessorInstance<P, T, R> = ProcessorInstance<P, T, R>
> {
  private readonly BATCH_LOCK_ID = 'batch'
  private asyncLock: AsyncLock = new AsyncLock({ maxPending: Number.MAX_SAFE_INTEGER })

  private logger: Logger
  private concurrencyOrBatchSize: number
  readonly queue: Queue<T>
  private worker: Worker

  constructor(private connection: IORedis, options: PriorityQueueOptions<P, T, R, I>) {
    this.logger = options.processorInstance.logger
    this.concurrencyOrBatchSize = options.concurrencyOrBatchSize

    // Reuse the ioredis instance
    this.queue = new Queue(options.name, { connection: this.connection })
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
    this.worker = new Worker(this.queue.name, processor, {
      connection: this.connection,
      concurrency: this.concurrencyOrBatchSize,
      removeOnComplete: { count: 0, age: 0 },
      removeOnFail: { count: 0, age: 0 },
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
    this.worker = new Worker(this.queue.name, undefined, {
      connection: this.connection,
      removeOnComplete: { count: 0 },
      removeOnFail: { count: 0 },
    })

    const getNJobs = async (n: number): Promise<Job[]> => {
      let jobs: Job[] = []
      do {
        const job = await this.worker.getNextJob(randomUUID(), { block: true })
        if (!job) return jobs
        jobs.push(job)
      } while (jobs.length <= n)
      return jobs
    }

    const doBatchProcessing = () =>
      this.asyncLock.acquire(this.BATCH_LOCK_ID, async () => {
        const jobs = await getNJobs(this.concurrencyOrBatchSize)
        try {
          if (jobs.length) {
            // Move all the successfully completed batch jobs to 'completed' state
            const completed = await processor(jobs)
            await Promise.all(completed.map((job) => job.moveToCompleted(job.data, job.token || '', false)))

            // Move all the unprocessed batch jobs to 'delayed' state, so that they can be processed in the next batch
            const unprocessed = jobs.filter((job) => !completed.some((c) => c.id === job.id))
            await Promise.all(unprocessed.map((job) => job.moveToDelayed(Date.now(), job.token || '')))
          }
        } catch (err) {
          // Move all the failed batch jobs to 'failed' state
          await Promise.all(jobs.map((job) => job.moveToFailed(err as Error, job.token || '', false)))
          this.logger.error(err)
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
    const jobs = await this.queue.getJobs('prioritized')

    const jobsByChannelId = _(jobs)
      .groupBy((v) => v.data.channelId)
      .map((jobs, channelId) => ({ channelId, unprocessedJobs: [...jobs] }))
      .value()

    await Promise.all(
      jobsByChannelId.map(async ({ channelId, unprocessedJobs }) => {
        // Get total videos of channel
        const channel = await channels.getById(channelId)

        const totalVideos = Math.min(channel.statistics.videoCount, SyncUtils.videoCap(channel))
        const percentageOfCreatorBacklogNotSynched = (unprocessedJobs.length * 100) / totalVideos

        for (const job of unprocessedJobs) {
          let sudoPriority = SyncUtils.DEFAULT_SUDO_PRIORITY
          if (new Date(job.data.publishedAt) > channel.createdAt && job.data.duration > 300) {
            sudoPriority += 50
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
  }
}

export class JobsFlowManager {
  private flowProducer: FlowProducer
  private jobQueuesByName: Map<string, PriorityJobQueue> = new Map()
  private queueEventsByName: Map<string, QueueEvents> = new Map()

  constructor(private connection: IORedis) {
    this.flowProducer = new FlowProducer({ connection })
  }

  /**
   * @param options queue options
   */
  createJobQueue<P extends ProcessorType, T extends TaskType>(options: PriorityQueueOptions<P, T>) {
    if (this.jobQueuesByName.has(options.name)) {
      throw new Error(`Job queue with name ${options.name} already exists`)
    }

    const jobQueue = new PriorityJobQueue(this.connection, options)

    this.jobQueuesByName.set(options.name, jobQueue)
  }

  /**
   * @param name queue name
   * @returns Job queue instance
   */
  getJobQueue(name: string): PriorityJobQueue {
    const jobQueue = this.jobQueuesByName.get(name)

    if (!jobQueue) {
      throw new Error(`Job queue with name ${name} does not exist`)
    }

    return jobQueue
  }

  /**
   * @param name queue name
   * @returns Queue events listener
   */
  getQueueEvents(name: string): QueueEvents {
    const jobQueue = this.jobQueuesByName.get(name)

    if (!jobQueue) {
      throw new Error(`Can't get queue events listener for non-existent queue ${name}`)
    }

    return this.queueEventsByName.get(name) || new QueueEvents(name, { connection: this.connection })
  }

  getJobQueues(): PriorityJobQueue[] {
    return [...this.jobQueuesByName.values()]
  }

  async addFlowJob(flowJob: FlowJob) {
    return this.flowProducer.add(flowJob)
  }
}
