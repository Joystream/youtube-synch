import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { Config } from '../../types'
import { ExitCodes } from '../../types/errors'
import {
  ChannelSyncStatus,
  ChannelYppStatus,
  ChannelYppStatusSuspended,
  ChannelYppStatusVerified,
  JoystreamVideo,
  TopReferrer,
  VideoState,
  YtChannel,
  YtVideo,
  channelYppStatus,
} from '../../types/youtube'
import { pluralizeNoun } from '../../utils/misc'
import { YT_VIDEO_TITLE_REQUIRED_FOR_SIGNUP } from '../youtube'

// NestJS Data Transfer Objects (DTO)s

export class ThumbnailsDto {
  @ApiProperty() default: string
  @ApiProperty() medium: string
  @ApiProperty() high: string
}

export class StatusDto {
  @ApiProperty() version: string
  @ApiProperty() syncStatus: 'enabled' | 'disabled'
  @ApiProperty() syncBacklog: number
}

export class CollaboratorStatusDto {
  @ApiProperty() memberId: string
  @ApiProperty() controllerAccount: string
  @ApiProperty() balance: string
}

export class InductionRequirement {
  @ApiProperty({ description: 'Template for the signup requirement text' })
  template: string

  @ApiProperty({ description: 'Variables for requirement template' })
  variables: string[]

  @ApiProperty({
    description: 'Error code to be returned when channel signup fails due to unmet requirement',
    enum: ExitCodes.YoutubeApi,
  })
  errorCode: ExitCodes.YoutubeApi
}

export class ChannelInductionRequirementsDto {
  @ApiProperty({
    description: 'List of requirements user YT channel needs to fulfill',
    type: InductionRequirement,
    isArray: true,
  })
  requirements: InductionRequirement[]

  constructor(requirements: Config['creatorOnboardingRequirements']) {
    this.requirements = [
      {
        errorCode: ExitCodes.YoutubeApi.VIDEO_PRIVACY_STATUS_NOT_UNLISTED,
        template: 'YouTube video should be {}.',
        variables: ['Unlisted'],
      },
      {
        errorCode: ExitCodes.YoutubeApi.VIDEO_TITLE_MISMATCH,
        template: 'YouTube video title should be {}.',
        variables: [YT_VIDEO_TITLE_REQUIRED_FOR_SIGNUP],
      },
      {
        errorCode: ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_SUBSCRIBERS,
        template: 'YouTube channel has at least {}.',
        variables: [pluralizeNoun(requirements.minimumSubscribersCount, 'subscriber')],
      },
      {
        errorCode: ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_VIDEOS,
        template: 'YouTube channel has at least {}.',
        variables: [pluralizeNoun(requirements.minimumVideosCount, 'video')],
      },
      {
        errorCode: ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_CREATION_DATE,
        template: 'YouTube channel needs to be older than {}.',
        variables: [pluralizeNoun(Math.round(requirements.minimumChannelAgeHours * 0.001), 'month')],
      },
    ]
  }
}

class ChannelSyncStatusDto {
  @ApiProperty({ description: 'No. of videos in sync backlog for the channel' }) backlogCount: number
  @ApiProperty({ description: 'ETA (seconds) to fully sync all planned videos of the channel' }) fullSyncEta: number
  @ApiProperty({ description: 'Place in the sync queue of the earliest video for the channel,' })
  placeInSyncQueue: number

  constructor(syncStatus?: ChannelSyncStatus) {
    this.backlogCount = syncStatus?.backlogCount || 0
    this.fullSyncEta = syncStatus?.fullSyncEta || 0
    this.placeInSyncQueue = syncStatus?.placeInSyncQueue || 0
  }
}

export class ChannelDto {
  @ApiProperty() youtubeChannelId: string
  @ApiProperty() title: string
  @ApiProperty() description: string
  @ApiProperty() shouldBeIngested: boolean
  @ApiProperty({ enum: channelYppStatus }) yppStatus: ChannelYppStatus
  @ApiProperty() joystreamChannelId: number
  @ApiProperty() referrerChannelId?: number
  @ApiProperty() videoCategoryId: string
  @ApiProperty() language: string
  @ApiProperty() thumbnails: ThumbnailsDto
  @ApiProperty() subscribersCount: number
  @ApiProperty() createdAt: Date
  @ApiProperty() syncStatus?: ChannelSyncStatus

  constructor(channel: YtChannel, syncStatus?: ChannelSyncStatus) {
    this.youtubeChannelId = channel.id
    this.title = channel.title
    this.description = channel.description
    this.subscribersCount = channel.statistics.subscriberCount
    this.joystreamChannelId = channel.joystreamChannelId
    this.referrerChannelId = channel.referrerChannelId
    this.videoCategoryId = channel.videoCategoryId
    this.language = channel.language
    this.shouldBeIngested = channel.shouldBeIngested
    this.yppStatus = channel.yppStatus
    this.thumbnails = channel.thumbnails
    this.createdAt = new Date(channel.createdAt)
    this.syncStatus = new ChannelSyncStatusDto(syncStatus)
  }
}

export class ReferredChannelDto {
  @ApiProperty() joystreamChannelId: number
  @ApiProperty() title: string
  @ApiProperty() subscribersCount: number
  @ApiProperty() yppStatus: string
  @ApiProperty() createdAt: Date

  constructor(referrerChannel: YtChannel) {
    this.joystreamChannelId = referrerChannel.joystreamChannelId
    this.title = referrerChannel.title
    this.subscribersCount = referrerChannel.statistics.subscriberCount
    this.yppStatus = referrerChannel.yppStatus
    this.createdAt = new Date(referrerChannel.createdAt)
  }
}

export class TopReferrerDto {
  @ApiProperty() referrerChannelId: number
  @ApiProperty() referredByTier: { [K in ChannelYppStatusVerified]: number }
  @ApiProperty() totalEarnings: number
  @ApiProperty() totalReferredChannels: number

  constructor(topReferrer: TopReferrer) {
    this.referrerChannelId = topReferrer.referrerChannelId
    this.referredByTier = topReferrer.referredByTier
    this.totalEarnings = topReferrer.totalEarnings
    this.totalReferredChannels = topReferrer.totalReferredChannels
  }
}

// Dto for verifying Youtube channel given the Youtube video URL
export class VerifyChannelRequest {
  // Youtube video URL required for the verification
  @IsUrl({ require_tld: false })
  @ApiProperty({ required: true })
  youtubeVideoUrl: string
}

// Dto for verified Youtube channel response
export class VerifyChannelResponse {
  // ID of the verified Youtube channel
  @IsString() @ApiProperty({ required: true }) id: string

  // Youtube Channel/User handle
  @IsString() @ApiProperty() channelHandle: string

  // Youtube Channel title
  @IsString() @ApiProperty({ required: true }) channelTitle: string

  // Youtube Channel description
  @IsString() @ApiProperty({ required: true }) channelDescription: string

  // Youtube Channel default language
  @IsString() @ApiProperty() channelLanguage: string

  // Youtube Channel avatar URL
  @IsString() @ApiProperty({ required: true }) avatarUrl: string

  // Youtube Channel banner URL
  @IsString() @ApiProperty() bannerUrl: string
}

// Dto for saving the verified Youtube channel
export class SaveChannelRequest {
  // Youtube video URL required for the verification
  @IsUrl({ require_tld: false })
  @ApiProperty({ required: true })
  youtubeVideoUrl: string

  // ID of the verified Youtube channel
  @IsString() @ApiProperty({ required: true }) id: string

  // Email of the YT user/channel
  @IsEmail() @ApiProperty({ required: true }) email: string

  // Joystream Channel ID of the user verifying his Youtube Channel for YPP
  @IsNumber() @ApiProperty({ required: true }) joystreamChannelId: number

  @IsBoolean() @ApiProperty({ required: true }) shouldBeIngested: boolean

  // video category ID to be added to all synced videos
  @ValidateIf((c: SaveChannelRequest) => c.shouldBeIngested)
  @IsString()
  @ApiProperty({ required: true })
  videoCategoryId: string

  // referrer Channel ID
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() referrerChannelId: number
}

// Dto for save channel response
export class SaveChannelResponse {
  @ApiProperty({ type: ChannelDto }) channel: ChannelDto

  constructor(channel: ChannelDto) {
    this.channel = channel
  }
}

export class VideoDto extends YtVideo {
  @ApiProperty() url: string
  @ApiProperty() title: string
  @ApiProperty() description: string
  @ApiProperty() category: string
  @ApiProperty() id: string
  @ApiProperty() playlistId: string
  @ApiProperty() resourceId: string
  @ApiProperty() channelId: string
  @ApiProperty() thumbnails: ThumbnailsDto
  @ApiProperty() state: VideoState
  @ApiProperty() duration: number
  @ApiProperty() language: string
  @ApiProperty() joystreamVideo: JoystreamVideo
}

class IngestChannelMessage {
  // Whether to enable/disable ingestion (true/false)
  @IsBoolean() shouldBeIngested: boolean

  // VideoCategory ID (that should be added to auto synced videos)
  @ValidateIf((c: IngestChannelMessage) => c.shouldBeIngested)
  @IsString()
  @ApiProperty({ required: true })
  videoCategoryId: string

  // Action timestamp (being used to prevent message replay)
  @Type(() => Date)
  @IsDate()
  timestamp: Date
}

class OptoutChannelMessage {
  // true/false
  @IsBoolean() optout: boolean

  // Action timestamp (being used to prevent message replay)
  @Type(() => Date)
  @IsDate()
  timestamp: Date
}

class UpdateChannelCategoryMessage {
  // VideoCategory ID (that should be added to auto synced videos)
  @IsString() @ApiProperty({ required: true }) videoCategoryId: string

  // Action timestamp (being used to prevent message replay)
  @Type(() => Date)
  @IsDate()
  timestamp: Date
}

export class IngestChannelDto {
  // signature
  @IsString() @ApiProperty({ required: true }) signature: string

  // message object
  @ApiProperty({ required: true })
  @ValidateNested()
  @Type(() => IngestChannelMessage)
  message: IngestChannelMessage
}

export class OptoutChannelDto {
  // signature
  @IsString() @ApiProperty({ required: true }) signature: string

  // message object
  @ApiProperty({ required: true })
  @ValidateNested()
  @Type(() => OptoutChannelMessage)
  message: OptoutChannelMessage
}

export class UpdateChannelCategoryDto {
  // signature
  @IsString() @ApiProperty({ required: true }) signature: string

  // message object
  @ApiProperty({ required: true })
  @ValidateNested()
  @Type(() => UpdateChannelCategoryMessage)
  message: UpdateChannelCategoryMessage
}

export class SuspendChannelDto {
  // Channel Id
  @IsNumber() @ApiProperty({ required: true }) joystreamChannelId: number

  // yppStatus
  @IsEnum(ChannelYppStatusSuspended)
  @ApiProperty({ required: true, enum: ChannelYppStatusSuspended })
  reason: ChannelYppStatusSuspended
}

export class VerifyChannelDto {
  // Channel Id
  @IsNumber() @ApiProperty({ required: true }) joystreamChannelId: number

  // yppStatus
  @IsEnum(ChannelYppStatusVerified)
  @ApiProperty({ required: true, enum: ChannelYppStatusVerified })
  tier: ChannelYppStatusVerified
}

export class SetOperatorIngestionStatusDto {
  // Channel Id
  @IsNumber() @ApiProperty({ required: true }) joystreamChannelId: number

  // Whether to enable/disable ingestion (true/false)
  @IsBoolean() @ApiProperty({ required: true }) allowOperatorIngestion: boolean
}

export class SetChannelCategoryByOperatorDto {
  // Channel Id
  @IsNumber() @ApiProperty({ required: true }) joystreamChannelId: number

  // VideoCategory ID to set for given channel
  @IsBoolean() @ApiProperty({ required: true }) videoCategoryId: string
}

export class WhitelistChannelDto {
  @Matches(/^@/, { message: 'The channel handle should start with a "@"' })
  @ApiProperty({ required: true })
  channelHandle: string
}
