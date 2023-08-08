import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  ValidateIf,
  ValidateNested,
} from 'class-validator'
import { Config } from '../../types'
import { JoystreamVideo, VideoState, YtChannel, YtUser, YtVideo } from '../../types/youtube'

// NestJS Data Transfer Objects (DTO)s

export class ThumbnailsDto {
  @ApiProperty() default: string
  @ApiProperty() medium: string
  @ApiProperty() high: string
  @ApiProperty() standard: string
}

export class CollaboratorStatusDto {
  @ApiProperty() memberId: string
  @ApiProperty() controllerAccount: string
  @ApiProperty() balance: string
}

export class ChannelInductionRequirementsDto {
  @ApiProperty() MINIMUM_SUBSCRIBERS_COUNT: number
  @ApiProperty() MINIMUM_VIDEO_COUNT: number
  @ApiProperty() MINIMUM_VIDEO_AGE_HOURS: number
  @ApiProperty() MINIMUM_CHANNEL_AGE_HOURS: number

  constructor(requirements: Config['creatorOnboardingRequirements']) {
    this.MINIMUM_SUBSCRIBERS_COUNT = requirements.minimumSubscribersCount
    this.MINIMUM_VIDEO_COUNT = requirements.minimumVideoCount
    this.MINIMUM_VIDEO_AGE_HOURS = requirements.minimumVideoAgeHours
    this.MINIMUM_CHANNEL_AGE_HOURS = requirements.minimumChannelAgeHours
  }
}

export class ChannelDto {
  @ApiProperty() youtubeChannelId: string
  @ApiProperty() title: string
  @ApiProperty() description: string
  @ApiProperty() shouldBeIngested: boolean
  @ApiProperty() yppStatus: string
  @ApiProperty() joystreamChannelId: number
  @ApiProperty() referrerChannelId?: number
  @ApiProperty() referredChannels: ReferredChannelDto[]
  @ApiProperty() videoCategoryId: string
  @ApiProperty() language: string
  @ApiProperty() thumbnails: ThumbnailsDto
  @ApiProperty() subscribersCount: number
  @ApiProperty() createdAt: Date

  constructor(channel: YtChannel, referredChannels?: YtChannel[]) {
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
    this.referredChannels = referredChannels?.map((c) => new ReferredChannelDto(c)) || []
  }
}

class ReferredChannelDto {
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
  @IsBoolean() shouldBeIngested: boolean
  @ValidateIf((c: IngestChannelMessage) => c.shouldBeIngested)
  @IsString()
  @ApiProperty({ required: true })
  videoCategoryId: string

  @Type(() => Date)
  @IsDate()
  timestamp: Date
}

class OptoutChannelMessage {
  @IsBoolean() optout: boolean
  @Type(() => Date)
  @IsDate()
  timestamp: Date
}

export class IngestChannelDto {
  @IsString() @ApiProperty({ required: true }) signature: string
  @ApiProperty({ required: true })
  @ValidateNested()
  @Type(() => IngestChannelMessage)
  message: IngestChannelMessage
}

export class OptoutChannelDto {
  @IsString() @ApiProperty({ required: true }) signature: string
  @ApiProperty({ required: true })
  @ValidateNested()
  @Type(() => OptoutChannelMessage)
  message: OptoutChannelMessage
}

export class SuspendChannelDto {
  @IsNumber() @ApiProperty({ required: true }) joystreamChannelId: number
  @IsBoolean() @ApiProperty({ required: true }) isSuspended: boolean
}

export class VerifyChannelDto {
  @IsNumber() @ApiProperty({ required: true }) joystreamChannelId: number
  @IsBoolean() @ApiProperty({ required: true }) isVerified: boolean
}

export class WhitelistChannelDto {
  @Matches(/^@/, { message: 'The channel handle should start with a "@"' })
  @ApiProperty({ required: true })
  channelHandle: string
}
