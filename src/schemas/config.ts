import { JSONSchema7 } from 'json-schema'
import * as winston from 'winston'
import { objectSchema } from './utils'

export const byteSizeUnits = ['B', 'K', 'M', 'G', 'T']
export const byteSizeRegex = new RegExp(`^[0-9]+(${byteSizeUnits.join('|')})$`)

const logLevelSchema: JSONSchema7 = {
  description: 'Minimum level of logs sent to this output',
  type: 'string',
  enum: [...Object.keys(winston.config.npm.levels)],
}

export const configSchema: JSONSchema7 = objectSchema({
  '$id': 'https://joystream.org/schemas/youtube-synch/config',
  title: 'Youtube Sync node configuration',
  description: 'Configuration schema for Youtube synch service node',
  required: ['joystream', 'endpoints', 'youtube', 'creatorOnboardingRequirements', 'httpApi', 'sync'],
  properties: {
    joystream: objectSchema({
      description: 'Joystream network related configuration',
      properties: {
        faucet: objectSchema({
          description: `Joystream's faucet configuration (needed for captcha-free membership creation)`,
          properties: {
            endpoint: { type: 'string', description: `Joystream's faucet URL` },
            captchaBypassKey: {
              type: 'string',
              description: `Bearer Authentication Key needed to bypass captcha verification on Faucet`,
            },
          },
          required: ['endpoint', 'captchaBypassKey'],
        }),
        app: objectSchema({
          description: 'Joystream Metaprotocol App specific configuration',
          properties: {
            name: { type: 'string', description: 'Name of the app' },
            accountSeed: {
              description: `Specifies the app auth key's string seed, for generating ed25519 keypair, to be used for signing App Actions`,
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
      required: ['faucet', 'app', 'channelCollaborator'],
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
        redis: objectSchema({
          description: 'Redis server host and port, required by BullMQ',
          properties: {
            host: { type: 'string' },
            port: { type: 'number' },
          },
          required: ['host', 'port'],
        }),
      },
      required: ['queryNode', 'joystreamNodeWs', 'redis'],
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
              description: 'Elasticsearch endpoint to push the logs to (for example: http://localhost:9200)',
              type: 'string',
            },
            auth: objectSchema({
              title: 'Elasticsearch authentication options',
              properties: {
                username: {
                  description: 'Elasticsearch username',
                  type: 'string',
                },
                password: {
                  description: 'Elasticsearch password',
                  type: 'string',
                },
              },
              required: ['username', 'password'],
            }),
          },
          required: ['level', 'endpoint', 'auth'],
        }),
      },
      required: [],
    }),
    youtube: objectSchema({
      title: 'Youtube related configuration',
      description: 'Youtube related configuration',
      properties: {
        apiMode: { type: 'string', enum: ['api-free', 'api', 'both'], default: 'both' },
        api: objectSchema({
          title: 'Youtube API configuration',
          description: 'Youtube API configuration',
          properties: {
            clientId: { type: 'string', description: 'Youtube Oauth2 Client Id' },
            clientSecret: { type: 'string', description: 'Youtube Oauth2 Client Secret' },
            maxAllowedQuotaUsageInPercentage: {
              description:
                `Maximum percentage of daily Youtube API quota that can be used by the Periodic polling service. ` +
                `Once this limit is reached the service will stop polling for new videos until the next day(when Quota resets). ` +
                `All the remaining quota (100 - maxAllowedQuotaUsageInPercentage) will be used for potential channel's signups.`,
              type: 'number',
              default: 95,
            },
            adcKeyFilePath: {
              type: 'string',
              description:
                `Path to the Google Cloud's Application Default Credentials (ADC) key file. ` +
                `It is required to periodically monitor the Youtube API quota usage.`,
            },
          },
          required: ['clientId', 'clientSecret'],
          dependencies: {
            maxAllowedQuotaUsageInPercentage: ['adcKeyFilePath'],
          },
        }),
        operationalApi: objectSchema({
          title: 'Youtube Operational API (https://github.com/Benjamin-Loison/YouTube-operational-API) configuration',
          description:
            'Youtube Operational API (https://github.com/Benjamin-Loison/YouTube-operational-API) configuration',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the Youtube Operational API server (for example: http://localhost:8080)',
            },
          },
          required: ['url'],
        }),
      },

      if: {
        properties: { apiMode: { enum: ['api', 'both'] } },
      },
      then: {
        required: ['api'],
      },
      required: ['apiMode', 'operationalApi'],
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
    proxy: objectSchema({
      title: 'Socks5 proxy client configuration used by yt-dlp to bypass IP blockage by Youtube',
      description: 'Socks5 proxy client configuration used by yt-dlp to bypass IP blockage by Youtube',
      properties: {
        url: {
          description: 'Proxy Client URL e.g. socks://localhost:1080, socks://user:password@localhost:1080',
          type: 'string',
        },
        chiselProxy: objectSchema({
          description:
            'Configuration option to manage Chisel Client & Server. Before enabling this option please refer to setup guide in `socks5-proxy/SETUP.md`',
          properties: {
            ec2AutoRotateIp: {
              description:
                'Boolean option to enable auto rotation of ec2 instance IP where chisel server is running by restating it',
              type: 'boolean',
            },
          },
          required: [],
        }),
      },
      dependencies: {
        chiselProxy: ['url'],
      },
      required: [],
    }),

    creatorOnboardingRequirements: objectSchema({
      description: 'Specifies creator onboarding (signup) requirements for Youtube Partner Program',
      properties: {
        minimumSubscribersCount: {
          description: 'Minimum number of subscribers required for signup',
          type: 'number',
        },
        minimumVideosCount: {
          description: 'Minimum total number of videos required for signup',
          type: 'number',
        },
        minimumVideoAgeHours: {
          description: 'Minimum age of videos in hours for signup',
          type: 'number',
        },
        minimumChannelAgeHours: {
          description: 'Minimum age of the channel in hours for signup',
          type: 'number',
        },
        minimumVideosPerMonth: {
          description: 'Minimum number of videos posted per month',
          type: 'number',
        },
        monthsToConsider: {
          description: 'Number of latest months to consider for the monthly video posting requirement',
          type: 'number',
        },
      },
      required: [
        'minimumSubscribersCount',
        'minimumVideosCount',
        'minimumVideoAgeHours',
        'minimumChannelAgeHours',
        'minimumVideosPerMonth',
        'monthsToConsider',
      ],
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
    sync: objectSchema({
      title: `YT-synch syncronization related settings`,
      description: `YT-synch's syncronization related settings`,
      properties: {
        enable: {
          description: 'Option to enable/disable syncing while starting the service',
          type: 'boolean',
          default: true,
        },
        downloadsDir: {
          description: 'Path to a directory where all the downloaded assets will be stored',
          type: 'string',
        },
        intervals: objectSchema({
          description: 'Specifies how often periodic tasks (for example youtube state polling) are executed.',
          properties: {
            youtubePolling: {
              description:
                'After how many minutes, the polling service should poll the Youtube api for channels state update',
              type: 'integer',
              minimum: 1,
            },
            contentProcessing: {
              description:
                'After how many minutes, the service should scan the database for new content to start downloading, on-chain creation & uploading to storage node',
              type: 'integer',
              minimum: 1,
            },
          },
          required: ['youtubePolling', 'contentProcessing'],
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
            maxConcurrentDownloads: {
              description:
                'Max no. of videos that should be concurrently downloaded from Youtube to be prepared for upload to Joystream',
              type: 'number',
              default: 50,
            },
            createVideoTxBatchSize: {
              description: `No. of videos that should be created in a batched 'create_video' tx`,
              type: 'number',
              default: 10,
            },
            maxConcurrentUploads: {
              description: `Max no. of videos that should be concurrently uploaded to Joystream's storage node`,
              type: 'number',
              default: 50,
            },
            pendingDownloadTimeoutSec: {
              description: 'Timeout for pending youtube video downloads in seconds',
              type: 'integer',
              minimum: 60,
            },
            storage: {
              description: 'Maximum total size of all downloaded assets stored in `downloadsDir`',
              type: 'string',
              pattern: byteSizeRegex.source,
            },
          },
          required: [
            'dailyApiQuota',
            'maxConcurrentDownloads',
            'createVideoTxBatchSize',
            'maxConcurrentUploads',
            'pendingDownloadTimeoutSec',
            'storage',
          ],
        }),
      },
      if: {
        properties: { enable: { const: true } },
      },
      then: {
        required: ['downloadsDir', 'intervals', 'limits'],
      },
      required: ['enable'],
    }),
  },
})

export default configSchema
