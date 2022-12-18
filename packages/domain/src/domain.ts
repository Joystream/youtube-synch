import { DataObjectId, VideoId } from '@joystream/types/primitives'

export class Channel {
  // Channel ID
  id: string

  // ID of the user that owns the channel
  userId: string

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

  frequency: number

  // Channel description
  description: string

  // default language of youtube channel
  language: string

  // Youtube channel creation date
  publishedAt: string

  // record creation time
  createdAt: number

  // channel thumbnails
  thumbnails: Thumbnails

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

  //
  shouldBeIngested: boolean

  // Channel suspension status
  isSuspended: boolean

  // Needs a dummy partition key on GSI to be able to query by createdAt fields
  phantomKey: string
}

export interface IEvent {
  timestamp: number
  subject: string
}

export class ChannelSpotted implements IEvent {
  /**
   *
   */
  constructor(public channel: Channel, public timestamp: number) {}
  subject = 'channelSpotted'
}

export class IngestChannel implements IEvent {
  constructor(public channel: Channel, public timestamp: number) {
    this.channel = channel
    this.timestamp = timestamp
  }

  subject = 'ingestChannel'
}

export class UserCreated implements IEvent {
  constructor(public user: User, public timestamp: number) {
    this.user = user
    this.timestamp = timestamp
  }

  subject = 'userCreated'
}

export class UserIngestionTriggered implements IEvent {
  constructor(public user: User, public timestamp: number) {
    this.user = user
    this.timestamp = timestamp
  }

  subject = 'userIngestionTriggered'
}

export class VideoEvent implements IEvent {
  subject: VideoState
  constructor(public state: VideoState, public videoId: string, public channelId: string, public timestamp: number) {
    this.subject = state
  }
}

export type Membership = {
  memberId: number
  address?: string
  secret: string
  suri?: string
}

export class User {
  constructor(
    // Youtube user ID
    public id: string,

    // Youtube User email
    public email: string,

    // User access token
    public accessToken: string,

    // User refresh token
    public refreshToken: string,

    // User authorization code
    public authorizationCode: string,

    // Record created At timestamp
    public createdAt: number
  ) {}

  membership: Membership
}

export type Thumbnails = {
  default: string
  medium: string
  high: string
  standard: string
}

const readOnlyVideoStates = [
  // Newly tracked youtube video (in the backend syncing system)
  'New',
  // Video is being creating on Joystream network (by calling extrinsics, but not yet uploaded)
  'CreatingVideo',
  // Video has been created on Joystream network (by calling extrinsics, but not yet uploaded)
  'VideoCreated',
  // `create_video` extrinsic errored
  'VideoCreationFailed',
  // Video is being uploaded to Joystream
  'UploadStarted',
  // Video upload to Joystream failed
  'UploadFailed',
  // Video upload to Joystream succeeded
  'UploadSucceeded',
  // Video was deleted from joystream, so it should not be synced again
  'NotToBeSyncedAgain',
] as const

export const videoStates = readOnlyVideoStates as unknown as string[]

export type VideoState = typeof readOnlyVideoStates[number]

export type JoystreamVideo = {
  // Joystream runtime Video ID for successfully synced video
  id: string

  // Data Object IDs (first element is the video, the second is the thumbnail)
  assetIds: string[]
}

export class Video {
  // Video ID
  id: string

  // Video URL
  url: string

  // Video title
  title: string

  // Video description
  description: string

  // Video's playlist ID
  playlistId: string

  resourceId: string

  // Video's channel ID
  channelId: string

  // Video thumbnails
  thumbnails: Thumbnails

  // current state of the video
  state: VideoState

  destinationUrl: string

  // Video duration in seconds
  duration: number

  // Media container format
  container: string

  // Youtube video creation date
  publishedAt: string

  // The status of the uploaded video on Youtube.
  uploadStatus: string

  // record creation time
  createdAt: number

  // youtube video license
  license: string

  // Joystream video category to be assigned to synced videos
  category: string

  // language of the synced video (derived from corresponding Youtube channel)
  language: string

  // joystream video ID in `VideoCreated` event response, returned from joystream runtime after creating a video
  joystreamVideo: JoystreamVideo
}

export class Stats {
  syncQuotaUsed: number
  signupQuotaUsed: number
  date: string
  partition = 'stats'
}

export const getImages = (channel: Channel) => {
  return [
    ...urlAsArray(channel.thumbnails.default),
    ...urlAsArray(channel.thumbnails.high),
    ...urlAsArray(channel.thumbnails.medium),
    ...urlAsArray(channel.thumbnails.standard),
  ]
}

const urlAsArray = (url: string) => (url ? [url] : [])
