import path from 'path'
import fs from 'fs'
import _ from 'lodash'
import nodeCleanup from 'node-cleanup'
import { Logger } from 'winston'
import { DynamodbService } from '../repository'
import { bootstrapHttpApi } from '../services/httpApi/main'
import { LoggingService } from '../services/logging'
import { QueryNodeApi } from '../services/query-node/api'
import { RuntimeApi } from '../services/runtime/api'
import { JoystreamClient } from '../services/runtime/client'
import { ContentProcessingClient, ContentProcessingService } from '../services/syncProcessing'
import { YoutubePollingService } from '../services/syncProcessing/YoutubePollingService'
import { IYoutubeApi, YoutubeApi } from '../services/youtube/api'
import { Config, DisplaySafeConfig } from '../types'
import { Socks5ProxyService } from '../services/proxy/Socks5ProxyService'
import { THUMBNAILS_SUBDIR } from '../services/syncProcessing/ContentDownloadService'

export class Service {
  private config: Config
  private logging: LoggingService
  private logger: Logger
  private youtubeApi: IYoutubeApi
  private queryNodeApi: QueryNodeApi
  private dynamodbService: DynamodbService
  private runtimeApi: RuntimeApi
  private joystreamClient: JoystreamClient
  private youtubePollingService: YoutubePollingService
  private contentProcessingService: ContentProcessingService
  private contentProcessingClient: ContentProcessingClient
  private socks5ProxyService?: Socks5ProxyService
  private isStopping = false

  constructor(config: Config) {
    this.config = config
    this.logging = LoggingService.withAppConfig(config.logs)
    this.logger = this.logging.createLogger('Server')
    this.socks5ProxyService = config.proxy ? new Socks5ProxyService(config.proxy, this.logging) : undefined
    this.queryNodeApi = new QueryNodeApi(config.endpoints.queryNode, this.logging)
    this.dynamodbService = new DynamodbService(this.config.aws)
    this.youtubeApi = YoutubeApi.create(this.config, this.dynamodbService.repo.stats, this.logging)
    this.runtimeApi = new RuntimeApi(config.endpoints.joystreamNodeWs, this.logging)
    this.joystreamClient = new JoystreamClient(config, this.runtimeApi, this.queryNodeApi, this.logging)
    this.contentProcessingClient = new ContentProcessingClient({ ...config.sync, ...config.endpoints })
    this.youtubePollingService = new YoutubePollingService(
      this.logging,
      this.youtubeApi,
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
    if (this.config.sync.enable) {
      this.checkConfigDir('sync.downloadsDir', this.config.sync.downloadsDir)
      const thumbsDir = path.join(this.config.sync.downloadsDir, THUMBNAILS_SUBDIR)
      if (!fs.existsSync(thumbsDir)) {
        fs.mkdirSync(thumbsDir)
      }
      this.checkConfigDir('thumbnails', thumbsDir)
    }
    if (this.config.logs?.file) {
      this.checkConfigDir('logs.file.path', this.config.logs.file.path)
    }
    if (this.config.proxy?.chain) {
      this.checkConfigDir('proxy.chain.configPath', this.config.proxy.chain.configPath)
    }
  }

  private async startSync(): Promise<void> {
    if (this.config.sync.enable) {
      this.contentProcessingService = new ContentProcessingService(
        { ...this.config.sync, ...this.config.endpoints, ...this.config.proxy },
        this.logging,
        this.dynamodbService,
        this.youtubeApi,
        this.runtimeApi,
        this.joystreamClient,
        this.queryNodeApi,
        this.socks5ProxyService
      )

      const {
        intervals: { youtubePolling, contentProcessing },
      } = this.config.sync
      await this.youtubePollingService.start(youtubePolling)
      await this.contentProcessingService.start(contentProcessing)
    }
  }

  private hideSecrets(config: Config): DisplaySafeConfig {
    const displaySafeConfig = {
      ...config,
      youtube: _.mapValues(config.youtube, () => '###SECRET###' as const),
      httpApi: _.mapValues(config.httpApi, () => '###SECRET###' as const),
      joystream: _.mapValues(config.joystream, () => '###SECRET###' as const),
      logs: {
        ...config.logs,
        elastic: _.mapValues(config.logs?.elastic, () => '###SECRET###' as const),
      },
      aws: {
        ...config.aws,
        credentials: _.mapValues(config.aws?.credentials, () => '###SECRET###' as const),
      },
    }

    return displaySafeConfig
  }

  public async start(service: 'httpApi' | 'sync' | 'both' = 'both'): Promise<void> {
    const serviceNames = service === 'both' ? 'both "httpApi" & "sync"' : service

    this.logger.info(`Starting ${serviceNames} service${service === 'both' ? 's' : ''}`, {
      config: this.hideSecrets(this.config),
    })

    try {
      if (service === 'httpApi' || service === 'both') {
        await bootstrapHttpApi(
          this.config,
          this.logging,
          this.runtimeApi,
          this.queryNodeApi,
          this.youtubeApi,
          this.youtubePollingService,
          this.contentProcessingClient
        )
      }

      this.checkConfigDirectories()

      if (service === 'sync' || service === 'both') {
        await this.startSync()
      }
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
