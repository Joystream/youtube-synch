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

  // record creation time (ISO string)
  createdAt: string

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

  aggregatedStats: number

  // Channel owner's access token
  userAccessToken: string

  // Channel owner's refresh token
  userRefreshToken: string
  uploadsPlaylistId: string

  // Should this channel be ingested for automated Youtube/Joystream syncing?
  shouldBeIngested: boolean

  // Should this channel be ingested for automated Youtube/Joystream syncing without explicit authorization granted to app?
  performUnauthorizedSync: boolean

  // Channel's YPP program participation status
  yppStatus: ChannelYppStatus

  // Timestamp of the last time this channel changed its syncing/ypp status.
  // This field serves the purpose of nonce to avoid playback attacks
  lastActedAt: Date

  // Needs a dummy partition key on GSI to be able to query by createdAt fields
  phantomKey: 'phantomData'
}

const readonlyChannelYppStatus = ['Unverified', 'Verified', 'Suspended', 'OptedOut'] as const
export type ChannelYppStatus = typeof readonlyChannelYppStatus[number]

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

  // Media container format
  container: string

  // Indicates if the video is an upcoming/active live broadcast. else it's "none"
  liveBroadcastContent: 'upcoming' | 'live' | 'none'

  // ID of the corresponding Joystream Channel (De-normalized from YtChannel table)
  joystreamChannelId: number

  // Youtube video creation date
  publishedAt: string

  // record creation time
  createdAt: Date
}

export type VideoState =
  | 'New'
  | 'VideoCreationFailed'
  | 'CreatingVideo'
  | 'VideoCreated'
  | 'UploadFailed'
  | 'UploadStarted'
  | 'UploadSucceeded'
  | 'VideoUnavailable'

export type HubspotYPPContact = {
  vid: string
  contactId: string
  channel_title: string
  channel_url: string
  email: string
  total_subscribers: string
  gleev_channel_id: string
  lifecyclestage: 'customer'
  new_synced_vids: string // New Synced Vids
  hs_lead_status: 'CONNECTED' // Lead Status
  latest_ypp_period_wc: string // Latest Date Check
  date_signed_up_to_ypp: string // Date Signed up to YPP

  sign_up_reward_in_usd: string // Sign Up Reward in USD
  latest_referral_reward_in_usd: string // Latest Referral Reward in USD
  videos_sync_reward: string // Videos Sync Reward in USD

  sign_up_reward: string // Sign Up Reward (in JOY)
  referral_reward: string // Latest Referral Reward (in JOY)
  videos_sync_reward_in_joy: string // Videos Sync Reward (in JOY)

  latest_ypp_reward: string // Latest Overall YPP Reward
  total_ypp_rewards: string // Total YPP Rewards in JOY
  latest_ypp_reward_status: 'Not calculated' | 'Paid' | 'To Pay' // Latest YPP Reward Status
}

export const payableContactProps = [
  'contactId',
  'email',
  'channel_url',
  'gleev_channel_id',
  'sign_up_reward_in_usd',
  'latest_referral_reward_in_usd',
  'videos_sync_reward',
  'total_ypp_rewards',
] as const

export type PayableContact = Pick<HubspotYPPContact, typeof payableContactProps[number]>
