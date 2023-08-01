import fs from 'fs'
import _ from 'lodash'
import nodeCleanup from 'node-cleanup'
import { Logger } from 'winston'
import { DynamodbService } from '../repository'
import { bootstrapHttpApi } from '../services/httpApi/main'
import { LoggingService } from '../services/logging'
import { QueryNodeApi } from '../services/query-node/api'
import { JoystreamClient } from '../services/runtime/client'
import { ContentCreationService } from '../services/syncProcessing/ContentCreationService'
import { ContentDownloadService } from '../services/syncProcessing/ContentDownloadService'
import { ContentUploadService } from '../services/syncProcessing/ContentUploadService'
import { YoutubePollingService } from '../services/syncProcessing/YoutubePollingService'
import { IYoutubeApi, YoutubeApi } from '../services/youtube/api'
import { Config, DisplaySafeConfig } from '../types'

export class Service {
  private config: Config
  private logging: LoggingService
  private logger: Logger
  private youtubeApi: IYoutubeApi
  private queryNodeApi: QueryNodeApi
  private dynamodbService: DynamodbService
  private joystreamClient: JoystreamClient
  private youtubePollingService: YoutubePollingService
  private contentDownloadService: ContentDownloadService
  private contentCreationService: ContentCreationService
  private contentUploadService: ContentUploadService
  private isStopping = false

  constructor(config: Config) {
    this.config = config
    this.logging = LoggingService.withAppConfig(config.logs)
    this.logger = this.logging.createLogger('Server')
    this.queryNodeApi = new QueryNodeApi(config.endpoints.queryNode, this.logging)
    this.dynamodbService = new DynamodbService(this.config.aws)
    this.youtubeApi = YoutubeApi.create(this.config)
    this.joystreamClient = new JoystreamClient(config, this.youtubeApi, this.queryNodeApi, this.logging)

    if (config.sync.enable) {
      this.youtubePollingService = new YoutubePollingService(
        this.logging,
        this.youtubeApi,
        this.dynamodbService,
        this.joystreamClient
      )
      this.contentDownloadService = new ContentDownloadService(
        config.sync,
        this.logging,
        this.dynamodbService,
        this.youtubeApi
      )
      this.contentCreationService = new ContentCreationService(
        this.logging,
        this.dynamodbService,
        this.contentDownloadService,
        this.joystreamClient
      )
      this.contentUploadService = new ContentUploadService(
        config.sync,
        this.logging,
        this.dynamodbService,
        this.contentDownloadService,
        this.queryNodeApi
      )
    }
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
    if (this.config.sync.enable) {
      this.checkConfigDir('sync.downloadsDir', this.config.sync.downloadsDir)
    }
    if (this.config.logs?.file) {
      this.checkConfigDir('logs.file.path', this.config.logs.file.path)
    }
  }

  private async startSync(): Promise<void> {
    if (this.config.sync.enable) {
      const {
        intervals: { youtubePolling, contentProcessing },
      } = this.config.sync
      this.logger.verbose('Starting the Youtube-Synch service', { config: this.hideSecrets(this.config) })
      // Null-assertion is safe here since intervals won't be not null due to Ajv schema validation
      await this.youtubePollingService.start(youtubePolling)
      await this.contentDownloadService.start(contentProcessing)
      await this.contentCreationService.start(contentProcessing)
      await this.contentUploadService.start(contentProcessing)
    }
  }

  private hideSecrets(config: Config): DisplaySafeConfig {
    const displaySafeConfig = {
      ...config,
      youtube: _.mapValues(config.youtube, () => '###SECRET###' as const),
      httpApi: _.mapValues(config.httpApi, () => '###SECRET###' as const),
      joystream: _.mapValues(config.joystream, () => '###SECRET###' as const),
      aws: {
        ...config.aws,
        credentials: _.mapValues(config.aws?.credentials, () => '###SECRET###' as const),
      },
    }

    return displaySafeConfig
  }

  public async start(): Promise<void> {
    try {
      await bootstrapHttpApi(this.config, this.logging, this.dynamodbService, this.queryNodeApi, this.youtubeApi)
      this.checkConfigDirectories()
      await this.startSync()
    } catch (err) {
      this.logger.error('Youtube-Synch service initialization failed!', { err })
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
}
