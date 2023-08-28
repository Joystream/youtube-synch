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

  BASE_SIGNUP_REWARD_IN_USD: 20,
  BASE_REFERRAL_REWARD_IN_USD: 10,

  // Sync rewards per tier
  TIER_1_SYNC_REWARD_IN_USD: 1,
  TIER_2_SYNC_REWARD_IN_USD: 2,
  TIER_3_SYNC_REWARD_IN_USD: 5,

  // Sync rewards capped to max of 3 videos per week.
  MAX_REWARDED_VIDEOS_PER_WEEK: 3,

  // Minimum video duration in minutes for a video to be eligible for sync rewards.
  MIN_VIDEO_DURATION_IN_MINS: 5,
}

export function loadConfig<K extends keyof typeof conf>(key: K): typeof conf[K] {
  if (conf[key]) return conf[key]

  if (typeof conf[key] === 'number') {
    conf[key] = readEnvInt(key, conf[key]) as typeof conf[K]
    return conf[key]
  }

  conf[key] = readEnvString(key, conf[key] as string) as typeof conf[K]
  return conf[key]
}
