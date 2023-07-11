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

let conf = {
  AWS_REGION: '',
  AWS_ACCESS_KEY_ID: '',
  AWS_SECRET_ACCESS_KEY: '',
  AWS_DYNAMO_STREAM_ARN: '',
  HUBSPOT_API_KEY: '',

  CHECK_NEW_SYNCED_VIDEOS_INTERVAL_IN_HOURS: 1,

  BASE_SIGNUP_REWARD_IN_USD: 20,
  BASE_REFERRAL_REWARD_IN_USD: 9,
  BASE_SYNC_REWARD_IN_USD: 3,
}

export function loadConfig<K extends keyof typeof conf>(key: K): typeof conf[K] {
  if (typeof conf[key] === 'number') {
    return readEnvInt(key, 1) as typeof conf[K]
  }
  return readEnvString(key) as typeof conf[K]
}
