import { config } from 'dotenv'

// Init .env config
config()

function readEnvInt<T>(key: string, defaultValue: T): number | T {
  const value = process.env[key]
  if (value) {
    return parseInt(value)
  } else {
    return defaultValue
  }
}

function readEnvString<T>(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (value) {
    return value
  } else if (defaultValue) {
    return defaultValue
  } else {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

let conf: {
  AWS_REGION: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  AWS_DYNAMO_STREAM_ARN: string
  HUBSPOT_API_KEY: string

  CHECK_NEW_SYNCED_VIDEOS_INTERVAL_IN_HOURS: number

  BASE_SIGNUP_REWARD_IN_USD: number
  BASE_REFERRAL_REWARD_IN_USD: number
  BASE_SYNC_REWARD_IN_USD: number
}

export function loadConfig() {
  if (conf) return conf

  conf = {
    AWS_REGION: readEnvString('AWS_REGION', 'eu-central-1'),
    AWS_ACCESS_KEY_ID: readEnvString('AWS_ACCESS_KEY_ID'),
    AWS_SECRET_ACCESS_KEY: readEnvString('AWS_SECRET_ACCESS_KEY'),
    AWS_DYNAMO_STREAM_ARN: readEnvString('AWS_DYNAMO_STREAM_ARN'),
    HUBSPOT_API_KEY: readEnvString('HUBSPOT_API_KEY'),
    CHECK_NEW_SYNCED_VIDEOS_INTERVAL_IN_HOURS: readEnvInt('CHECK_NEW_SYNCED_BLOCKS_INTERVAL_IN_HOURS', 1),
    BASE_SIGNUP_REWARD_IN_USD: readEnvInt('BASE_SIGNUP_REWARD_IN_USD', 20),
    BASE_REFERRAL_REWARD_IN_USD: readEnvInt('BASE_REFERRAL_REWARD_IN_USD', 9),
    BASE_SYNC_REWARD_IN_USD: readEnvInt('BASE_SYNC_REWARD_IN_USD', 3),
  }
  return conf
}
