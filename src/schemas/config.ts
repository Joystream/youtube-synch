import { JSONSchema4 } from 'json-schema'
import * as winston from 'winston'
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
    'joystream',
    'endpoints',
    'directories',
    'limits',
    'intervals',
    'youtube',
    'creatorOnboardingRequirements',
    'httpApi',
  ],
  properties: {
    joystream: objectSchema({
      description: 'Joystream network related configuration',
      properties: {
        app: objectSchema({
          description: 'Joystream metaprotocol application specific configuration',
          properties: {
            name: { type: 'string', description: 'Name of the application' },
            accountSeed: {
              description: `Specifies the application auth key's string seed for generating ed25519 keypair`,
              type: 'string',
            },
          },
          required: ['name', 'accountSeed'],
        }),
        channelCollaborator: objectSchema({
          title: 'Joystream channel collaborator used for syncing the content',
          description: 'Joystream channel collaborators used for syncing the content',
          properties: {
            memberId: { type: 'string' },
            account: {
              description: 'Specifies the available application auth keys.',
              type: 'array',
              items: {
                oneOf: [
                  objectSchema({
                    title: 'Substrate uri',
                    description: "Keypair's substrate uri (for example: //Alice)",
                    properties: {
                      type: { type: 'string', enum: ['ed25519'], default: 'ed25519' },
                      suri: { type: 'string' },
                    },
                    required: ['suri'],
                  }),
                  objectSchema({
                    title: 'Mnemonic phrase',
                    description: 'Mnemonic phrase',
                    properties: {
                      type: { type: 'string', enum: ['ed25519', 'sr25519', 'ecdsa'], default: 'sr25519' },
                      mnemonic: { type: 'string' },
                    },
                    required: ['mnemonic'],
                  }),
                ],
              },
              minItems: 1,
            },
          },
          required: ['memberId', 'account'],
        }),
      },
      required: ['app', 'channelCollaborator'],
    }),
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
      description: 'Specifies youtube-synch service limits.',
      properties: {
        dailyApiQuota: objectSchema({
          title: 'Specifies daily Youtube API quota rationing scheme for Youtube Partner Program',
          description: 'Specifies daily Youtube API quota rationing scheme for Youtube Partner Program',
          properties: {
            sync: { type: 'number', default: 9500 },
            signup: { type: 'number', default: 500 },
          },
          required: ['sync', 'signup'],
        }),
      },
      required: ['dailyApiQuota'],
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
            'How often, in seconds, will the youtube-sync service attempt to send requests to all current storage node endpoints ' +
            'in order to check how quickly they respond. ' +
            `The node will never make more than ${0} such requests concurrently.`,
          type: 'integer',
          minimum: 1,
        },
      },
      required: ['youtubePolling', 'checkStorageNodeResponseTimes'],
    }),
    youtube: objectSchema({
      title: 'Youtube Oauth2 Client configuration',
      description: 'Youtube Oauth2 Client configuration',
      properties: {
        clientId: { type: 'string' },
        clientSecret: { type: 'string' },
      },
      required: ['clientId', 'clientSecret'],
    }),
    aws: objectSchema({
      title: 'AWS configurations needed to connect with DynamoDB instance',
      description: 'AWS configurations needed to connect with DynamoDB instance',

      properties: {
        endpoint: {
          type: 'string',
          description:
            'DynamoDB endpoint to connect with the instance, only set if node is connecting to local DynamoDB instance',
        },
        region: {
          type: 'string',
          description:
            'DynamoDB endpoint to connect with the instance, only set if node is connecting to AWS DynamoDB instance',
        },
        credentials: objectSchema({
          title: 'AWS credentials',
          description: 'Youtube Oauth2 Client configuration',
          properties: {
            accessKeyId: { type: 'string' },
            secretAccessKey: { type: 'string' },
          },
          required: ['accessKeyId', 'secretAccessKey'],
        }),
      },
      required: [],
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
    httpApi: objectSchema({
      title: 'Public api configuration',
      description: 'Public api configuration',
      properties: {
        port: { type: 'number' },
        ownerKey: { type: 'string' },
      },
      required: ['port', 'ownerKey'],
    }),
  },
})

export default configSchema
