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

function readEnvString(key: string, defaultValue?: string): string {
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

  BRONZE_TIER_SIGNUP_REWARD_IN_USD: 2,
  SILVER_TIER_SIGNUP_REWARD_IN_USD: 50,
  GOLD_TIER_SIGNUP_REWARD_IN_USD: 100,
  DIAMOND_TIER_SIGNUP_REWARD_IN_USD: 200,

  BRONZE_TIER_REFERRAL_REWARD_IN_USD: 1,
  SILVER_TIER_REFERRAL_REWARD_IN_USD: 25,
  GOLD_TIER_REFERRAL_REWARD_IN_USD: 50,
  DIAMOND_TIER_REFERRAL_REWARD_IN_USD: 100,

  BRONZE_TIER_SYNC_REWARD_IN_USD: 0,
  SILVER_TIER_SYNC_REWARD_IN_USD: 1,
  GOLD_TIER_SYNC_REWARD_IN_USD: 3,
  DIAMOND_TIER_SYNC_REWARD_IN_USD: 5,

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
