import winston, { Logger, LoggerOptions } from 'winston'
import escFormat from '@elastic/ecs-winston-format'
import { ElasticsearchTransport } from 'winston-elasticsearch'
import { ReadonlyConfig } from '../../types'
import { blake2AsHex } from '@polkadot/util-crypto'
import { Format } from 'logform'
import stringify from 'fast-safe-stringify'
import NodeCache from 'node-cache'
import path from 'path'
import 'winston-daily-rotate-file'

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
type ErrorFormatOpts = { filedName: string }
const errorFormat: (opts: ErrorFormatOpts) => Format = winston.format((info, opts: ErrorFormatOpts) => {
  if (!info[opts.filedName]) {
    return info
  }
  const formatter = winston.format.errors({ stack: true })
  info[opts.filedName] = formatter.transform(info[opts.filedName], formatter.options)
  return info
})

const cliFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  errorFormat({ filedName: 'err' }),
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
  }

  public static withAppConfig(logs: ReadonlyConfig['logs']): LoggingService {
    const transports: winston.LoggerOptions['transports'] = []

    let esTransport: ElasticsearchTransport | undefined
    if (logs?.elastic) {
      esTransport = new ElasticsearchTransport({
        index: 'distributor-node',
        level: logs.elastic.level,
        format: winston.format.combine(pauseFormat({ id: 'es' }), escFormat()),
        retryLimit: 10,
        flushInterval: 5000,
        clientOpts: {
          node: {
            url: new URL(logs.elastic.endpoint),
          },
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
        filename: path.join(logs.file.path, 'yt-sync-%DATE%.log'),
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
