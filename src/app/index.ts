import { Config } from '../types'
import { LoggingService } from '../services/logging'
import { Logger } from 'winston'
import fs from 'fs'
import nodeCleanup from 'node-cleanup'
import { AppIntervals } from '../types/app'
import _ from 'lodash'
import { DynamodbService, IDynamodbService } from '../repository'
import { YoutubePollingService } from '../services/syncProcessing/YoutubePollingService'
import { IYoutubeApi, YoutubeApi } from '../services/youtube/api'
import { ContentCreationService } from '../services/syncProcessing/ContentCreationService'
import { ContentUploadService } from '../services/syncProcessing/ContentUploadService'
import { QueryNodeApi } from '../services/query-node/api'
import { JoystreamClient } from '../services/runtime/client'
import { bootstrapHttpApi } from '../services/httpApi/main'

export class Service {
  private config: Config
  private logging: LoggingService
  private logger: Logger
  private youtubeApi: IYoutubeApi
  private queryNodeApi: QueryNodeApi
  private dynamodbService: IDynamodbService
  private joystreamClient: JoystreamClient
  private youtubePollingService: YoutubePollingService
  private contentCreationService: ContentCreationService
  private contentUploadService: ContentUploadService
  private isStopping = false

  constructor(config: Config) {
    this.config = config
    this.logging = LoggingService.withAppConfig(config.logs)
    this.logger = this.logging.createLogger('Server')
    this.queryNodeApi = new QueryNodeApi(config.endpoints.queryNode, this.logging)
    this.youtubeApi = YoutubeApi.create({ ...config.youtubeConfig, ...config.ypp }, this.logging)
    this.dynamodbService = DynamodbService.init()
    this.joystreamClient = new JoystreamClient(config, this.queryNodeApi, this.logging)
    this.contentUploadService = new ContentUploadService(config, this.logging, this.dynamodbService, this.queryNodeApi)
    this.youtubePollingService = new YoutubePollingService(
      config,
      this.logging,
      this.youtubeApi,
      this.dynamodbService,
      this.joystreamClient
    )
    this.contentCreationService = new ContentCreationService(
      config,
      this.logging,
      this.dynamodbService,
      this.joystreamClient
    )
  }

  private checkConfigDir(name: string, path: string): void {
    const dirInfo = `${name} directory (${path})`
    if (!fs.existsSync(path)) {
      try {
        fs.mkdirSync(path, { recursive: true })
      } catch (e) {
        throw new Error(`${dirInfo} doesn't exist and cannot be created!`)
      }
    }
    try {
      fs.accessSync(path, fs.constants.R_OK)
    } catch (e) {
      throw new Error(`${dirInfo} is not readable`)
    }
    try {
      fs.accessSync(path, fs.constants.W_OK)
    } catch (e) {
      throw new Error(`${dirInfo} is not writable`)
    }
  }

  private checkConfigDirectories(): void {
    Object.entries(this.config.directories).forEach(([name, path]) => this.checkConfigDir(name, path))
    if (this.config.logs?.file) {
      this.checkConfigDir('logs.file.path', this.config.logs.file.path)
    }
  }

  private hideSecrets(config: Config) {
    const displaySafeConfig = {
      ...config,
      // clientSecret: _.mapValues(config.youtubeConfig.clientSecret, () => '###SECRET###' as const),
      // m: _.mapValues(config.youtubeConfig.clientSecret, () => '###SECRET###' as const),
    }

    return displaySafeConfig
  }

  public async start(): Promise<void> {
    try {
      this.checkConfigDirectories()
      await bootstrapHttpApi(this.queryNodeApi, this.dynamodbService, this.youtubeApi)
      this.logger.verbose('Starting the YT-synch service', { config: this.hideSecrets(this.config) })
      await this.youtubePollingService.start()
      await this.contentCreationService.start()
      await this.contentUploadService.start()
    } catch (err) {
      this.logger.error('YT-synch service initialization failed!', { err })
      process.exit(-1)
    }
    nodeCleanup()
  }

  public stop(timeoutSec?: number): boolean {
    if (this.isStopping) {
      return false
    }
    this.logger.info(`Stopping the app${timeoutSec ? ` in ${timeoutSec} sec...` : ''}`)
    this.isStopping = true
    if (timeoutSec) {
      setTimeout(() => process.kill(process.pid, 'SIGINT'), timeoutSec * 1000)
    } else {
      process.kill(process.pid, 'SIGINT')
    }

    return true
  }

  // private async exitGracefully(): Promise<void> {
  //   // Async exit handler - ideally should not take more than 10 sec
  //   // We can try to wait until some pending downloads are finished here etc.
  //   this.logger.info('Graceful exit initialized')

  //   // Try to process remaining downloads
  //   const MAX_RETRY_ATTEMPTS = 3
  //   let retryCounter = 0
  //   while (retryCounter < MAX_RETRY_ATTEMPTS && this.stateCache.getPendingDownloadsCount()) {
  //     const pendingDownloadsCount = this.stateCache.getPendingDownloadsCount()
  //     this.logger.info(`${pendingDownloadsCount} pending downloads in progress... Retrying exit in 5 sec...`, {
  //       retryCounter,
  //       pendingDownloadsCount,
  //     })
  //     await new Promise((resolve) => setTimeout(resolve, 5000))
  //     this.stateCache.saveSync()
  //     ++retryCounter
  //   }

  //   if (this.stateCache.getPendingDownloadsCount()) {
  //     this.logger.warn('Limit reached: Could not finish all pending downloads.', {
  //       pendingDownloadsCount: this.stateCache.getPendingDownloadsCount(),
  //     })
  //   }

  //   this.logger.info('Graceful exit finished')
  //   await this.logging.end()
  // }

  // private exitCritically(): void {
  //   // Some additional synchronous work if required...
  //   this.logger.info('Critical exit finished')
  // }

  // private exitHandler(exitCode: number | null, signal: string | null): boolean | undefined {
  //   this.logger.info('Exiting...')
  //   // Clear intervals
  //   this.clearIntervals()

  //   // Save cache
  //   try {
  //     this.stateCache.saveSync()
  //   } catch (err) {
  //     this.logger.error('Failed to save the cache state on exit!', { err })
  //   }
  //   if (signal) {
  //     // Async exit can be executed
  //     this.exitGracefully()
  //       .then(() => {
  //         process.kill(process.pid, signal)
  //       })
  //       .catch((err) => {
  //         this.logger.error('Graceful exit error', { err })
  //         this.logging.end().finally(() => {
  //           process.kill(process.pid, signal)
  //         })
  //       })
  //     nodeCleanup.uninstall()
  //     return false
  //   } else {
  //     // Only synchronous work can be done here
  //     this.exitCritically()
  //   }
  // }
}
