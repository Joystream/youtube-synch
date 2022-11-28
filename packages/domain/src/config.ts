/* eslint-disable @typescript-eslint/naming-convention */
import { cleanEnv, str } from 'envalid'

let conf: {
  YOUTUBE_CLIENT_ID: string
  JOYSTREAM_QUERY_NODE_URL: string
  JOYSTREAM_WEBSOCKET_RPC: string
  AWS_ENDPOINT: string
  JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID: string
  YOUTUBE_CLIENT_SECRET: string
  JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT_SEED: string
  DEPLOYMENT_ENV: string
  YPP_OWNER_KEY: string

  // YPP induction criteria, each channel should meet following criteria
  MINIMUM_SUBSCRIBERS_COUNT: string
  MINIMUM_VIDEO_COUNT: string
  MINIMUM_VIDEO_AGE_MONTHS: string
  MINIMUM_CHANNEL_AGE_MONTHS: string
}

export function configure(): void {
  const envConf: Readonly<typeof conf> = {
    YOUTUBE_CLIENT_ID: readEnv('YOUTUBE_CLIENT_ID'),
    YOUTUBE_CLIENT_SECRET: readEnv('YOUTUBE_CLIENT_SECRET'),
    JOYSTREAM_QUERY_NODE_URL: readEnv('JOYSTREAM_QUERY_NODE_URL'),
    JOYSTREAM_WEBSOCKET_RPC: readEnv('JOYSTREAM_WEBSOCKET_RPC'),
    AWS_ENDPOINT: readEnv('AWS_ENDPOINT'),
    JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID: readEnv('JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID'),
    YPP_OWNER_KEY: readEnv('YPP_OWNER_KEY'),
    JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT_SEED: readEnv('JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT_SEED', false),
    DEPLOYMENT_ENV: readEnv('DEPLOYMENT_ENV'),

    MINIMUM_SUBSCRIBERS_COUNT: readEnv('MINIMUM_SUBSCRIBERS_COUNT'),
    MINIMUM_VIDEO_COUNT: readEnv('MINIMUM_VIDEO_COUNT'),
    MINIMUM_VIDEO_AGE_MONTHS: readEnv('MINIMUM_VIDEO_AGE_MONTHS'),
    MINIMUM_CHANNEL_AGE_MONTHS: readEnv('MINIMUM_CHANNEL_AGE_MONTHS'),
  }

  conf = {
    ...envConf,
  }
}

export function getConfig(): typeof conf {
  if (conf !== undefined) return conf
  configure()
  return conf
}

type DeploymentEnv = 'local' | 'development' | 'testing' | 'production'

function getEnv(name: string) {
  return process.env[name]
}

export function readEnv<K extends keyof typeof conf>(name: K, required = true): typeof conf[K] {
  const deploymentEnv = cleanEnv(process.env, { DEPLOYMENT_ENV: str({ default: 'local' }) })
    .DEPLOYMENT_ENV as DeploymentEnv

  // First check variable value using the name, if not found, check using the deployment env prefix
  const nameWithPrefix = `${deploymentEnv.toUpperCase()}_${name}`
  const value = getEnv(name) || (getEnv(nameWithPrefix) as typeof conf[K])

  if ((!value && required && /\${.*?\}/g.test(value)) || /\$.*?/g.test(value)) {
    throw new Error(`Missing required environment variable "${name}", tried access as "${nameWithPrefix}"`)
  }

  return value
}
