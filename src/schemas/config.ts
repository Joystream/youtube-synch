import { JSONSchema4 } from 'json-schema'
import winston from 'winston'
// import { MAX_CONCURRENT_RESPONSE_TIME_CHECKS } from '../services/networking/NetworkingService'
import { objectSchema } from './utils'

export const byteSizeUnits = ['B', 'K', 'M', 'G', 'T']
export const byteSizeRegex = new RegExp(`^[0-9]+(${byteSizeUnits.join('|')})$`)

const logLevelSchema: JSONSchema4 = {
  description: 'Minimum level of logs sent to this output',
  type: 'string',
  enum: [...Object.keys(winston.config.npm.levels)],
}

export const configSchema: JSONSchema4 = objectSchema({
  '$id': 'https://joystream.org/schemas/youtube-synch/config',
  title: 'Youtube Sync node configuration',
  description: 'Configuration schema for Youtube synch service node',
  required: [
    'appId',
    'endpoints',
    'directories',
    'limits',
    'intervals',
    'youtubeConfig',
    'ypp',
    'joystreamChannelCollaborator',
    'env',
  ],
  properties: {
    appId: {
      type: 'string',
      description: 'Joystream Metaprotocol App ID that will be used for content attribution',
      minLength: 1,
    },
    env: {
      type: 'string',
      description: 'Development environment of the node',
      minLength: 1,
      default: 'local',
      enum: ['local', 'dev', 'prod', 'test'],
    },
    endpoints: objectSchema({
      description: 'Specifies external endpoints that the distributor node will connect to',
      properties: {
        queryNode: {
          description: 'Query node graphql server uri (for example: http://localhost:8081/graphql)',
          type: 'string',
        },
        joystreamNodeWs: {
          description: 'Joystream node websocket api uri (for example: ws://localhost:9944)',
          type: 'string',
        },
      },
      required: ['queryNode', 'joystreamNodeWs'],
    }),
    directories: objectSchema({
      description: "Specifies paths where node's data will be stored",
      properties: {
        assets: {
          description: 'Path to a directory where all the cached assets will be stored',
          type: 'string',
        },
      },
      required: ['assets'],
    }),
    logs: objectSchema({
      description: 'Specifies the logging configuration',
      properties: {
        file: objectSchema({
          title: 'File logging options',
          properties: {
            level: logLevelSchema,
            path: {
              description: 'Path where the logs will be stored (absolute or relative to config file)',
              type: 'string',
            },
            maxFiles: {
              description:
                'Maximum number of log files to store. Recommended to be at least 7 when frequency is set to `daily` and at least 24 * 7 when frequency is set to `hourly`',
              type: 'integer',
              minimum: 1,
            },
            maxSize: {
              description: 'Maximum size of a single log file in bytes',
              type: 'integer',
              minimum: 1024,
            },
            frequency: {
              description: 'The frequency of creating new log files (regardless of maxSize)',
              default: 'daily',
              type: 'string',
              enum: ['yearly', 'monthly', 'daily', 'hourly'],
            },
            archive: {
              description: 'Whether to archive old logs',
              default: false,
              type: 'boolean',
            },
          },
          required: ['level', 'path'],
        }),
        console: objectSchema({
          title: 'Console logging options',
          properties: { level: logLevelSchema },
          required: ['level'],
        }),
        elastic: objectSchema({
          title: 'Elasticsearch logging options',
          properties: {
            level: logLevelSchema,
            endpoint: {
              description: 'Elastichsearch endpoint to push the logs to (for example: http://localhost:9200)',
              type: 'string',
            },
          },
          required: ['level', 'endpoint'],
        }),
      },
      required: [],
    }),
    limits: objectSchema({
      description: 'Specifies node limits w.r.t. storage, outbound connections etc.',
      properties: {
        storage: {
          description: 'Maximum total size of all (cached) assets stored in `directories.assets`',
          type: 'string',
          pattern: byteSizeRegex.source,
        },
        maxConcurrentStorageNodeUploads: {
          description: 'Maximum number of concurrent downloads from the storage node(s)',
          type: 'integer',
          minimum: 1,
        },
        maxConcurrentOutboundConnections: {
          description:
            'Maximum number of total simultaneous outbound connections to storage node(s) (excluding proxy connections)',
          type: 'integer',
          minimum: 1,
        },
        outboundRequestsTimeoutMs: {
          description: 'Timeout for all outbound storage node http requests in milliseconds',
          type: 'integer',
          minimum: 1000,
        },
        youtubePendingDownloadTimeoutSec: {
          description: 'Timeout for pending storage node downloads in seconds',
          type: 'integer',
          minimum: 60,
        },
        maxCachedItemSize: {
          description: 'Maximum size of a data object allowed to be cached by the node',
          type: 'string',
          pattern: byteSizeRegex.source,
        },
      },
      required: [
        'storage',
        'maxConcurrentStorageNodeUploads',
        'maxConcurrentOutboundConnections',
        'outboundRequestsTimeoutMs',
        'youtubePendingDownloadTimeoutSec',
      ],
    }),
    intervals: objectSchema({
      description: 'Specifies how often periodic tasks (for example youtube state polling) are executed.',
      properties: {
        youtubePolling: {
          description: 'After how many minutes, the service should poll the Youtube api for channels state update',
          type: 'integer',
          minimum: 1,
        },
        checkStorageNodeResponseTimes: {
          description:
            'How often, in seconds, will the YT-sync service attempt to send requests to all current storage node endpoints ' +
            'in order to check how quickly they respond. ' +
            `The node will never make more than ${0} such requests concurrently.`,
          type: 'integer',
          minimum: 1,
        },
      },
      required: ['youtubePolling', 'checkStorageNodeResponseTimes'],
    }),
    joystreamChannelCollaborator: objectSchema({
      title: 'Joystream channel collaborators',
      description: 'Joystream channel collaborators used for syncing the content',
      properties: { memberId: { type: 'number' }, accountMnemonic: { type: 'string' } },
      required: ['memberId', 'accountMnemonic'],
    }),
    youtubeConfig: objectSchema({
      title: 'Youtube Oauth2 Client configuration',
      description: 'Youtube Oauth2 Client configuration',
      properties: {
        clientId: { type: 'string' },
        clientSecret: { type: 'string' },
      },
      required: ['clientId', 'clientSecret'],
    }),
    ypp: objectSchema({
      title: 'Youtube Partner Program app',
      description: 'Youtube Partner Program app configuration',
      properties: {
        appPort: { type: 'number' },
        ownerKey: { type: 'string' },
        dailyApiQuota: objectSchema({
          title: 'Specifies daily Youtube API quota rationing scheme for Youtube Partner Program',
          description: 'Specifies daily Youtube API quota rationing scheme for Youtube Partner Program',
          properties: {
            sync: { type: 'number' },
            signup: { type: 'number' },
          },
          required: ['sync', 'signup'],
        }),
        creatorOnboardingRequirements: objectSchema({
          description: 'Specifies creator onboarding requirements for Youtube Partner Program',
          properties: {
            minimumSubscribersCount: {
              description: 'Minimum number of subscribers required to onboard a creator',
              type: 'number',
            },
            minimumVideoCount: {
              description: 'Minimum number of videos required to onboard a creator',
              type: 'number',
            },
            minimumVideoAgeHours: {
              description: 'All videos must be at least this old to onboard a creator',
              type: 'number',
            },
            minimumChannelAgeHours: {
              description: 'The channel must be at least this old to onboard a creator',
              type: 'number',
            },
          },
          required: ['minimumSubscribersCount', 'minimumVideoCount', 'minimumVideoAgeHours', 'minimumChannelAgeHours'],
        }),
      },
      required: ['appPort', 'ownerKey', 'creatorOnboardingRequirements', 'dailyApiQuota'],
    }),
  },
})

export default configSchema
