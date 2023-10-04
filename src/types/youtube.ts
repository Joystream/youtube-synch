import { VideoMetadataAndHash } from '../services/syncProcessing/ContentMetadataService'

type DeploymentEnv = 'dev' | 'local' | 'testing' | 'prod'
const deploymentEnv = process.env.DEPLOYMENT_ENV as DeploymentEnv | undefined

export type ResourcePrefix = `${Exclude<DeploymentEnv, 'prod'>}_` | ''
export const resourcePrefix = (deploymentEnv && deploymentEnv !== 'prod' ? `${deploymentEnv}_` : '') as ResourcePrefix

export class YtChannel {
  // Channel ID
  id: string

  // ID of the user that owns the channel
  userId: string

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

  // Channel owner's access token
  userAccessToken: string

  // Channel owner's refresh token
  userRefreshToken: string

  // Channel's playlist ID
  uploadsPlaylistId: string

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

  // Needs a dummy partition key on GSI to be able to query by createdAt fields
  phantomKey: 'phantomData'

  static isSuspended({ yppStatus }: YtChannel) {
    return (
      yppStatus === 'Suspended::DuplicateContent' ||
      yppStatus === 'Suspended::ProgramTermsExploit' ||
      yppStatus === 'Suspended::SubparQuality' ||
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
}

export class YtUser {
  // Youtube user ID
  id: string

  // Youtube User email
  email: string

  // User access token
  accessToken: string

  // User refresh token
  refreshToken: string

  // User authorization code
  authorizationCode: string

  // Corresponding Joystream member ID for Youtube user
  joystreamMemberId: number | undefined

  // Record created At timestamp
  createdAt: Date
}

export type Thumbnails = {
  default: string
  medium: string
  high: string
  standard: string
}

export enum VideoStates {
  New = 1,
  // `create_video` extrinsic errored
  VideoCreationFailed = 2,
  // Video is being creating on Joystream network (by calling extrinsics, but not yet uploaded)
  CreatingVideo = 3,
  // Video has been created on Joystream network (by calling extrinsics, but not yet uploaded)
  VideoCreated = 4,
  // Video upload to Joystream failed
  UploadFailed = 5,
  // Video is being uploaded to Joystream
  UploadStarted = 6,
  // Video upload to Joystream succeeded
  UploadSucceeded = 7,
  // Video was deleted from Youtube or set to private after being tracked by
  // YT-synch service or skipped from syncing by the YT-synch service itself.
  VideoUnavailable = 8,
}

export enum ChannelYppStatusVerified {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Diamond = 'Diamond',
}

export enum ChannelYppStatusSuspended {
  SubparQuality = 'SubparQuality',
  DuplicateContent = 'DuplicateContent',
  UnsupportedTopic = 'UnsupportedTopic',
  ProgramTermsExploit = 'ProgramTermsExploit',
}

export const verifiedVariants = Object.values(ChannelYppStatusVerified).map((status) => `Verified::${status}` as const)
const suspendedVariants = Object.values(ChannelYppStatusSuspended).map((status) => `Suspended::${status}` as const)
const readonlyChannelYppStatus = ['Unverified', ...verifiedVariants, ...suspendedVariants, 'OptedOut'] as const

export const videoStates = Object.keys(VideoStates).filter((v) => isNaN(Number(v)))

export const channelYppStatus = readonlyChannelYppStatus as unknown as string[]

export type VideoState = keyof typeof VideoStates

export type ChannelYppStatus = typeof readonlyChannelYppStatus[number]

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

  // Video's playlist ID
  playlistId: string

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

  // ID of the corresponding Joystream Channel (De-normalized from YtChannel table)
  joystreamChannelId: number

  // Youtube video creation date
  publishedAt: string

  // record creation time
  createdAt: Date
}

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
    ...urlAsArray(channel.thumbnails.standard),
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
}[]

export type FaucetRegisterMembershipParams = {
  account: string
  handle: string
  avatar: string
  about: string
  name: string
}

export type FaucetRegisterMembershipResponse = {
  memberId: number
}

export type ChannelSyncStatus = {
  backlogCount: number
  placeInSyncQueue: number
  fullSyncEta: number
}
