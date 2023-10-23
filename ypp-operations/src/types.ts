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
  //Hubspot system properties
  vid: string

  /**
   * unique Contact ID (assigned by hubspot)
   */
  contactId: string

  channel_title: string
  channel_url: string
  email: string
  total_subscribers: string
  gleev_channel_id: string

  /**
   * Lifecycle stage of customer (Hubspot property)
   */
  lifecyclestage: 'customer'

  /**
   * New Synced Vids
   */
  new_synced_vids: string

  /**
   * Lead Status (CONNECTED | REFERRER)
   */
  hs_lead_status: 'CONNECTED' | 'REFERRER'

  /**
   * Latest Date Check
   */
  latest_ypp_period_wc: string

  /**
   * Date Signed up to YPP
   */
  date_signed_up_to_ypp: string

  /**
   * Sign Up Reward in USD
   */
  sign_up_reward_in_usd: string

  /**
   * Latest Referral Reward in USD
   */
  latest_referral_reward_in_usd: string

  /**
   * Videos Sync Reward in USD
   */
  videos_sync_reward: string

  /**
   * Sign Up Reward (in JOY)
   */
  sign_up_reward: string

  /**
   * Latest Referral Reward (in JOY)
   */
  referral_reward: string

  /**
   * Videos Sync Reward (in JOY)
   */
  videos_sync_reward_in_joy: string

  /**
   * Latest Overall YPP Reward (in JOY)
   */
  latest_ypp_reward: string
  /**
   * Total YPP Rewards in JOY
   */
  total_ypp_rewards: string

  /**
   * Latest YPP Reward Status
   */
  latest_ypp_reward_status: 'Not calculated' | 'Paid' | 'To Pay'

  /**
   * YPP Status
   */
  yppstatus: ChannelYppStatus
  /**
   * Referred By
   */
  referredby: string

  /**
   * Synced video category code
   */
  videocategoryid: string

  /**
   * Synced video category name
   */
  synccategoryname: string
}

export const payableContactProps = [
  'contactId',
  'email',
  'channel_url',
  'gleev_channel_id',
  'yppstatus',
  'date_signed_up_to_ypp',
  'latest_ypp_period_wc',
  'sign_up_reward_in_usd',
  'latest_referral_reward_in_usd',
  'videos_sync_reward',
  'latest_ypp_reward',
  'total_ypp_rewards',
  'latest_ypp_reward_status',
] as const
export type PayableContact = Pick<HubspotYPPContact, typeof payableContactProps[number]>

export const payContactsInputProps = ['latest_ypp_reward_status', 'latest_ypp_reward', 'total_ypp_rewards'] as const
export type PayContactsInput = {
  id: string
  properties: Pick<HubspotYPPContact, typeof payContactsInputProps[number]>
}[]

export const revertPayingContactsInputProps = [
  'latest_ypp_reward_status',
  'sign_up_reward_in_usd',
  'latest_referral_reward_in_usd',
  'videos_sync_reward',
  'latest_ypp_reward',
  'total_ypp_rewards',
] as const
export type RevertPayingContactsInput = {
  id: string
  properties: Pick<HubspotYPPContact, typeof revertPayingContactsInputProps[number]>
}[]
