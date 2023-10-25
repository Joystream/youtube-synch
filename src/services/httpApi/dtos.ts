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
import {
  ChannelSyncStatus,
  ChannelYppStatus,
  channelYppStatus,
  ChannelYppStatusSuspended,
  ChannelYppStatusVerified,
  JoystreamVideo,
  VideoState,
  YtChannel,
  YtUser,
  YtVideo,
} from '../../types/youtube'
import { ExitCodes } from '../../types/errors'
import { pluralizeNoun } from '../../utils/misc'

// NestJS Data Transfer Objects (DTO)s

export class ThumbnailsDto {
  @ApiProperty() default: string
  @ApiProperty() medium: string
  @ApiProperty() high: string
  @ApiProperty() standard: string
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
  @ApiProperty({ description: 'Signup requirement text' })
  text: string

  @ApiProperty({
    description: 'Error code to be returned when channel signup fails due to unmet requirement',
    enum: ExitCodes.YoutubeApi,
  })
  errorCode: ExitCodes.YoutubeApi
}

export class ChannelInductionRequirementsDto {
  @ApiProperty({ description: 'List of requirements user YT channel needs to fulfill' })
  requirements: InductionRequirement[]

  constructor(requirements: Config['creatorOnboardingRequirements']) {
    this.requirements = [
      {
        errorCode: ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_SUBSCRIBERS,
        text: `YouTube channel has at least ${pluralizeNoun(requirements.minimumSubscribersCount, 'subscriber')}.`,
      },
      {
        errorCode: ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_VIDEOS,
        text: `YouTube channel has at least ${pluralizeNoun(requirements.minimumVideosCount, 'video')}.`,
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

export class UserDto {
  @ApiProperty() id: string
  @ApiProperty() email: string

  constructor(user: YtUser) {
    this.id = user.id
    this.email = user.email
  }
}

// Dto for verifying Youtube channel given the authorization code
export class VerifyChannelRequest {
  // Authorization code send to the backend after user o-auth verification
  @IsString() @ApiProperty({ required: true }) authorizationCode: string

  @IsUrl({ require_tld: false }) @ApiProperty({ required: true }) youtubeRedirectUri: string
}

// Dto for verified Youtube channel response
export class VerifyChannelResponse {
  // Email of the verified user
  @IsEmail() @ApiProperty({ required: true }) email: string

  // ID of the verified user
  @IsString() @ApiProperty({ required: true }) userId: string

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
  // Authorization code send to the backend after user o-auth verification
  @IsString() @ApiProperty({ required: true }) authorizationCode: string

  // UserId of the Youtube creator return from Google Oauth API
  @IsString() @ApiProperty({ required: true }) userId: string

  // Email of the user
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
  @ApiProperty() user: UserDto
  @ApiProperty({ type: ChannelDto }) channel: ChannelDto

  constructor(user: UserDto, channel: ChannelDto) {
    this.user = user
    this.channel = channel
  }
}

// Dto for creating membership request
export class CreateMembershipRequest {
  // UserId of the Youtube creator return from Google Oauth API
  @IsString() @ApiProperty({ required: true }) userId: string

  // Authorization code send to the backend after user o-auth verification
  @IsString() @ApiProperty({ required: true }) authorizationCode: string

  // Membership Account address
  @IsString() @ApiProperty({ required: true }) account: string

  // Membership Handle
  @IsString() @ApiProperty({ required: true }) handle: string

  // Membership avatar URL
  @IsOptional() @IsUrl({ require_tld: false }) @ApiProperty({ required: true }) avatar: string

  // `about` information to associate with new Membership
  @ApiProperty() about: string

  // Membership name
  @ApiProperty() name: string
}

// Dto for create membership response
export class CreateMembershipResponse {
  // Membership Account address
  @IsNumber() @ApiProperty({ required: true }) memberId: number

  // Membership Handle
  @IsString() @ApiProperty({ required: true }) handle: string

  constructor(memberId: number, handle: string) {
    this.memberId = memberId
    this.handle = handle
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
