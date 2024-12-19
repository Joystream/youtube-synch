import escFormat from '@elastic/ecs-winston-format'
import { blake2AsHex } from '@polkadot/util-crypto'
import stringify from 'fast-safe-stringify'
import { Format } from 'logform'
import NodeCache from 'node-cache'
import path from 'path'
import winston, { Logger, LoggerOptions } from 'winston'
import 'winston-daily-rotate-file'
import { ElasticsearchTransport } from 'winston-elasticsearch'
import { ReadonlyConfig } from '../../types'
import { FetchError } from 'node-fetch'
import { GaxiosError } from 'googleapis-common'

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'grey',
}

winston.addColors(colors)

const pausedLogs = new NodeCache({
  deleteOnExpire: true,
})

// Pause log for a specified time period
type PauseFormatOpts = { id: string }
const pauseFormat: (opts: PauseFormatOpts) => Format = winston.format((info, opts: PauseFormatOpts) => {
  if (info['@pauseFor']) {
    const messageHash = blake2AsHex(`${opts.id}:${info.level}:${info.message}`)
    if (!pausedLogs.has(messageHash)) {
      pausedLogs.set(messageHash, null, info['@pauseFor'])
      info.message += ` (this log message will be skipped for the next ${info['@pauseFor']}s)`
      delete info['@pauseFor']
      return info
    }
    return false
  }

  return info
})

// Error format applied to specific log meta field
type CLIErrorFormatOpts = { fieldName: string }
const cliErrorFormat: (opts: CLIErrorFormatOpts) => Format = winston.format((info, { fieldName }: CLIErrorFormatOpts) => {
  if (!info[fieldName]) {
    return info
  }
  const err = info[fieldName]
  info[fieldName] = err instanceof Error ? `${err.name}: ${err.message}` : err
  return info
})

// Elastic error format
class NormalizedError extends Error {
  message: string
  name: string
  code?: string
  type?: string
  response?: {
    status: number
    statusText: string
  }

  constructor(err: unknown) {
    // Collect error data depending on type
    if (err instanceof GaxiosError) {
      super(err.message)
      this.code = err.code
      if (err.response) {
        this.response = {
          status: err.response.status,
          statusText: err.response.statusText
          // TODO: Maybe we can add .data later, but need to adjust es mappings
        }
      }
      this.name = err.name
    }
    else if (err instanceof FetchError) {
      super(err.message)
      this.code = err.code,
      this.type = err.type,
      this.name = err.name
    }
    else if (err instanceof Error) {
      super(err.message)
      this.name = 'Error'
    }
    else {
      super(String(err))
      this.name = 'UnknownError'
    }
  }
}

type ElasticErrorFormatOpts = { fieldName: string }
const elasticErrorFormat: (opts: ElasticErrorFormatOpts) => Format = winston.format((info, { fieldName }: ElasticErrorFormatOpts) => {
  const err = info[fieldName]
  if (!err) {
    return info
  }
  info[fieldName] = new NormalizedError(err)
  return info
})

const cliFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  cliErrorFormat({ fieldName: 'err' }),
  winston.format.metadata({ fillExcept: ['label', 'level', 'timestamp', 'message'] }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} ${info.label} ${info.level}: ${info.message}` +
      (Object.keys(info.metadata).length ? `\n${stringify(info.metadata, undefined, 4)}` : '')
  )
)

export class LoggingService {
  private rootLogger: Logger
  private esTransport: ElasticsearchTransport | undefined

  private constructor(options: LoggerOptions, esTransport?: ElasticsearchTransport) {
    this.esTransport = esTransport
    this.rootLogger = winston.createLogger(options)

    // Compulsory error handling
    this.rootLogger.on('error', (error) => {
      console.error('Error in logger caught:', error)
    })
    this.esTransport?.on('error', (error) => {
      console.error('Error in logger caught:', error)
    })
  }

  public static withAppConfig(logs: ReadonlyConfig['logs']): LoggingService {
    const transports: winston.LoggerOptions['transports'] = []

    let esTransport: ElasticsearchTransport | undefined
    if (logs?.elastic) {
      esTransport = new ElasticsearchTransport({
        index: 'youtube-synch',
        level: logs.elastic.level,
        format: winston.format.combine(
          pauseFormat({ id: 'es' }),
          elasticErrorFormat({ fieldName: 'err' }),
          escFormat()
        ),
        retryLimit: 10,
        flushInterval: 1000,
        clientOpts: {
          node: {
            url: new URL(logs.elastic.endpoint),
          },
          auth: logs.elastic.auth,
        },
      })
      transports.push(esTransport)
    }

    if (logs?.file) {
      const datePatternByFrequency = {
        yearly: 'YYYY',
        monthly: 'YYYY-MM',
        daily: 'YYYY-MM-DD',
        hourly: 'YYYY-MM-DD-HH',
      }
      const fileTransport = new winston.transports.DailyRotateFile({
        filename: path.join(logs.file.path, 'youtube-sync-%DATE%.log'),
        datePattern: datePatternByFrequency[logs.file.frequency || 'daily'],
        zippedArchive: logs.file.archive,
        maxSize: logs.file.maxSize,
        maxFiles: logs.file.maxFiles,
        level: logs.file.level,
        format: winston.format.combine(pauseFormat({ id: 'file' }), escFormat()),
      })
      transports.push(fileTransport)
    }

    if (logs?.console) {
      const consoleTransport = new winston.transports.Console({
        level: logs.console.level,
        format: winston.format.combine(pauseFormat({ id: 'cli' }), cliFormat),
      })
      transports.push(consoleTransport)
    }

    return new LoggingService(
      {
        transports,
      },
      esTransport
    )
  }

  public static withCLIConfig(): LoggingService {
    return new LoggingService({
      transports: new winston.transports.Console({
        // Log everything to stderr, only the command output value will be written to stdout
        stderrLevels: Object.keys(winston.config.npm.levels),
        format: winston.format.combine(pauseFormat({ id: 'cli' }), cliFormat),
      }),
    })
  }

  public createLogger(label: string, ...meta: unknown[]): Logger {
    return this.rootLogger.child({ label, ...meta })
  }

  public async end(): Promise<void> {
    if (this.esTransport) {
      await this.esTransport.flush()
    }
    this.rootLogger.end()
    await Promise.all(this.rootLogger.transports.map((t) => new Promise((resolve) => t.on('finish', resolve))))
  }
}
