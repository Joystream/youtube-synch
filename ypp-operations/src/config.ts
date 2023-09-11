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

  TIER_1_SIGNUP_REWARD_IN_USD: 5,
  TIER_2_SIGNUP_REWARD_IN_USD: 10,
  TIER_3_SIGNUP_REWARD_IN_USD: 20,
  TIER_4_SIGNUP_REWARD_IN_USD: 30,
  TIER_5_SIGNUP_REWARD_IN_USD: 40,
  TIER_6_SIGNUP_REWARD_IN_USD: 50,

  TIER_1_REFERRAL_REWARD_IN_USD: 2.5,
  TIER_2_REFERRAL_REWARD_IN_USD: 5,
  TIER_3_REFERRAL_REWARD_IN_USD: 10,
  TIER_4_REFERRAL_REWARD_IN_USD: 15,
  TIER_5_REFERRAL_REWARD_IN_USD: 20,
  TIER_6_REFERRAL_REWARD_IN_USD: 25,

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
