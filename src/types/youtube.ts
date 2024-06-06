import { VideoMetadataAndHash } from '../services/syncProcessing/ContentMetadataService'

type DeploymentEnv = 'dev' | 'local' | 'testing' | 'prod'
const deploymentEnv = process.env.DEPLOYMENT_ENV as DeploymentEnv | undefined

// TODO: only allow sharing unlisted videos (because if we allow sharing public videos, then anyone can share video before the creator)
export type ResourcePrefix = `${Exclude<DeploymentEnv, 'prod'>}_` | ''
export const resourcePrefix = (deploymentEnv && deploymentEnv !== 'prod' ? `${deploymentEnv}_` : '') as ResourcePrefix

export class YtChannel {
  // Channel ID
  id: string

  // Youtube channel custom URL. Also known as youtube channel handle
  customUrl: string

  // user provided email
  email: string

  // ID of the corresponding Joystream Channel
  joystreamChannelId: number

  // video category ID to be added to all synced videos
  videoCategoryId: string

  // Referrer Joystream Channel ID
  referrerChannelId: number

  // Channel title
  title: string

  // Channel description
  description: string

  // default language of youtube channel
  language: string

  // language ISO of corresponding Joystream channel
  joystreamChannelLanguageIso?: string

  // Youtube channel creation date
  publishedAt: string

  // record creation time
  createdAt: Date

  // channel Avatar thumbnails
  thumbnails: Thumbnails

  // channel Cover Image URL
  bannerImageUrl: string

  // Channel statistics
  statistics: {
    // Total views
    viewCount: number

    // Total comments
    commentCount: number

    // Total subscribers
    subscriberCount: number

    // Total videos
    videoCount: number
  }

  // total size of historical videos synced (videos that were published on Youtube before YPP signup)
  historicalVideoSyncedSize: number

  // Should this channel be ingested for automated Youtube/Joystream syncing?
  shouldBeIngested: boolean

  // Should this channel be ingested for automated Youtube/Joystream syncing? (operator managed flag)
  // Both `shouldBeIngested` and `allowOperatorIngestion` should be set for sync to work.
  allowOperatorIngestion: boolean

  // Should this channel be ingested for automated Youtube/Joystream syncing without explicit authorization granted to app?
  performUnauthorizedSync: boolean

  // Channel's YPP program participation status
  yppStatus: ChannelYppStatus

  // Timestamp of the last time this channel changed its syncing/ypp status.
  // This field serves the purpose of nonce to avoid playback attacks
  lastActedAt: Date

  // Timestamp when the channel verification was processed, either to Verified or Suspended
  processedAt: Date

  // Needs a dummy partition key on GSI to be able to query by createdAt fields
  phantomKey: 'phantomData'

  static isSuspended({ yppStatus }: YtChannel) {
    return (
      yppStatus === 'Suspended::CopyrightBreach' ||
      yppStatus === 'Suspended::ProgramTermsExploit' ||
      yppStatus === 'Suspended::MisleadingContent' ||
      yppStatus === 'Suspended::UnsupportedTopic'
    )
  }

  static isVerified({ yppStatus }: YtChannel) {
    return (
      yppStatus === 'Verified::Bronze' ||
      yppStatus === 'Verified::Silver' ||
      yppStatus === 'Verified::Gold' ||
      yppStatus === 'Verified::Diamond'
    )
  }

  static getTier({ yppStatus }: YtChannel): ChannelYppStatusVerified | undefined {
    if (verifiedVariants.includes(yppStatus as any)) {
      // Extract the tier from the yppStatus. It will be the part after "Verified::"
      const tier = yppStatus.split('::')[1] as ChannelYppStatusVerified
      return tier
    }
    return undefined
  }

  static isSyncEnabled(channel: YtChannel) {
    return channel.shouldBeIngested && channel.allowOperatorIngestion
  }

  static totalVideos(channel: YtChannel) {
    return Math.min(channel.statistics.videoCount, YtChannel.videoCap(channel))
  }

  /**
   * Utility methods to check sync limits for channels. There are 2 limits:
   * video count and total size based on the subscribers count.
   * */

  static videoCap(channel: YtChannel): number {
    if (channel.yppStatus === 'Verified::Silver') {
      return 100
    } else if (channel.yppStatus === 'Verified::Gold') {
      return 250
    } else if (channel.yppStatus === 'Verified::Diamond') {
      return 1000
    }

    // yppStatus === 'Unverified' OR 'Verified::Bronze'
    return 5
  }

  static sizeCap(channel: YtChannel): number {
    if (channel.yppStatus === 'Verified::Silver') {
      return 10_000_000_000 // 10 GB
    } else if (channel.yppStatus === 'Verified::Gold') {
      return 100_000_000_000 // 100 GB
    } else if (channel.yppStatus === 'Verified::Diamond') {
      return 1_000_000_000_000 // 1 TB
    }

    // yppStatus === 'Unverified' OR 'Verified::Bronze'
    return 1_000_000_000 // 1 GB
  }

  static hasSizeLimitReached(channel: YtChannel) {
    return channel.historicalVideoSyncedSize >= this.sizeCap(channel)
  }
}

export class YtUser {
  // Youtube channel ID
  id: string

  // The URL for a specific video of Youtube channel with which the user verified for YPP
  youtubeVideoUrl: string

  // Record created At timestamp
  createdAt: Date
}

export type Thumbnails = {
  default: string
  medium: string
  high: string
}

export enum VideoUnavailableReasons {
  Deleted = 'Deleted',
  Private = 'Private',
  Skipped = 'Skipped',
  Other = 'Other',
  Unavailable = 'Unavailable',
  PostprocessingError = 'PostprocessingError',
  EmptyDownload = 'EmptyDownload',
}

// Modify the VideoStates enum to include a template literal type for the VideoUnavailable variant
enum VideoStates {
  New = 'New',
  VideoCreationFailed = 'VideoCreationFailed',
  CreatingVideo = 'CreatingVideo',
  VideoCreated = 'VideoCreated',
  UploadFailed = 'UploadFailed',
  UploadStarted = 'UploadStarted',
  UploadSucceeded = 'UploadSucceeded',
}

export enum ChannelYppStatusVerified {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Diamond = 'Diamond',
}

export enum ChannelYppStatusSuspended {
  CopyrightBreach = 'CopyrightBreach',
  MisleadingContent = 'MisleadingContent',
  ProgramTermsExploit = 'ProgramTermsExploit',
  UnsupportedTopic = 'UnsupportedTopic',
}

export const verifiedVariants = Object.values(ChannelYppStatusVerified).map((status) => `Verified::${status}` as const)
const suspendedVariants = Object.values(ChannelYppStatusSuspended).map((status) => `Suspended::${status}` as const)
const readonlyChannelYppStatus = ['Unverified', ...verifiedVariants, ...suspendedVariants, 'OptedOut'] as const

export const videoUnavailableVariants = Object.values(VideoUnavailableReasons).map(
  (reason) => `VideoUnavailable::${reason}` as const
)

export const videoStates = [...(Object.keys(VideoStates) as (keyof typeof VideoStates)[]), ...videoUnavailableVariants]

export const channelYppStatus = readonlyChannelYppStatus as unknown as string[]

export type VideoState = (typeof videoStates)[number]

export type ChannelYppStatus = (typeof readonlyChannelYppStatus)[number]

export type JoystreamVideo = {
  // Joystream runtime Video ID for successfully synced video
  id: string

  // Data Object IDs (first element is the video, the second is the thumbnail)
  assetIds: string[]
}

export class YtVideo {
  // Video ID on Youtube
  id: string

  // Video's channel ID
  channelId: string

  // Video URL
  url: string

  // Video title
  title: string

  // Video description
  description: string

  // video views count
  viewCount: number

  // Video thumbnails
  thumbnails: Thumbnails

  // current state of the video
  state: VideoState

  // Joystream video category to be assigned to synced videos
  category: string

  // language of the synced video (derived from corresponding Joystream channel)
  languageIso?: string

  // Video duration in seconds
  duration: number

  // The status of the uploaded video on Youtube.
  uploadStatus: string

  // The video's privacy status. `private`, `public`, or `unlisted`.
  privacyStatus: 'public' | 'private' | 'unlisted'

  // A rating that YouTube uses to identify age-restricted content.
  ytRating: 'ytAgeRestricted' | undefined

  // youtube video license
  license: 'creativeCommon' | 'youtube'

  // Media container format
  container: string

  // Indicates if the video is an upcoming/active live broadcast. else it's "none"
  liveBroadcastContent: 'upcoming' | 'live' | 'none'

  // joystream video ID in `VideoCreated` event response, returned from joystream runtime after creating a video
  joystreamVideo: JoystreamVideo

  // Whether video is a short format, vertical video (e.g. Youtube Shorts, TikTok, Instagram Reels)
  isShort: boolean

  // Youtube video creation date
  publishedAt: string

  // record creation time
  createdAt: Date
}

export type YtVideoWithJsChannelId = YtVideo & { joystreamChannelId: number }

export class Stats {
  syncQuotaUsed: number
  signupQuotaUsed: number
  date: string
  partition = 'stats'
}

export class WhitelistChannel {
  channelHandle: string
  createdAt: Date
}

export const getImages = (channel: YtChannel) => {
  return [
    ...urlAsArray(channel.thumbnails.default),
    ...urlAsArray(channel.thumbnails.high),
    ...urlAsArray(channel.thumbnails.medium),
  ]
}

const urlAsArray = (url: string) => (url ? [url] : [])

export type DownloadJobData = YtVideo & {
  priority: number
}

export type DownloadJobOutput = {
  filePath: string
}

export type CreateVideoJobData = YtVideo & {
  priority: number
}

export type MetadataJobData = YtVideo & {
  priority: number
}

export type MetadataJobOutput = VideoMetadataAndHash

export type UploadJobData = YtVideo & {
  priority: number
}

export type YtDlpFlatPlaylistOutput = {
  id: string
  publishedAt: Date
  isShort: boolean
}[]

export type YtDlpVideoOutput = {
  id: string
  channel_id: string
  title: string
  language: string
  upload_date: string
  filesize_approx: number
  description: string
  duration: number
  view_count: number
  like_count: number
  comment_count: number
  live_status: 'not_live' | 'is_live' | 'is_upcoming' | 'was_live' | 'post_live'
  original_url: string
  availability: 'public' | 'private' | 'unlisted'
  license: 'Creative Commons Attribution license (reuse allowed)' | undefined
  ext: string
  thumbnails: {
    url: string
  }[]

  // This property isn't really part of the YtDlpVideoOutput, but is separately
  // set based on wether video was downloaded from channels 'shorts' tab or not
  isShort: boolean
}

export type ChannelSyncStatus = {
  backlogCount: number
  placeInSyncQueue: number
  fullSyncEta: number
}

export type TopReferrer = {
  referrerChannelId: number
  referredByTier: { [K in ChannelYppStatusVerified]: number }
  totalEarnings: number
  totalReferredChannels: number
}

export const REFERRAL_REWARD_BY_TIER: { [K in ChannelYppStatusVerified]: number } = {
  'Bronze': 2,
  'Silver': 25,
  'Gold': 50,
  'Diamond': 100,
}
