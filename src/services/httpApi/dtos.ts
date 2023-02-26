import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsDate, IsEmail, IsNumber, IsString, IsUrl, ValidateIf, ValidateNested } from 'class-validator'
import { JoystreamVideo, VideoState, YtChannel, YtUser, YtVideo } from '../../types/youtube'
import { Config } from '../../types'

// NestJS Data Transfer Objects (DTO)s

export class ThumbnailsDto {
  @ApiProperty() default: string
  @ApiProperty() medium: string
  @ApiProperty() high: string
  @ApiProperty() standard: string
}

export class ChannelInductionRequirementsDto {
  @ApiProperty() MINIMUM_SUBSCRIBERS_COUNT: number
  @ApiProperty() MINIMUM_VIDEO_COUNT: number
  @ApiProperty() MINIMUM_VIDEO_AGE_HOURS: number
  @ApiProperty() MINIMUM_CHANNEL_AGE_HOURS: number

  constructor(requirements: Config['ypp']['creatorOnboardingRequirements']) {
    this.MINIMUM_SUBSCRIBERS_COUNT = requirements.minimumSubscribersCount
    this.MINIMUM_VIDEO_COUNT = requirements.minimumVideoCount
    this.MINIMUM_VIDEO_AGE_HOURS = requirements.minimumVideoAgeHours
    this.MINIMUM_CHANNEL_AGE_HOURS = requirements.minimumChannelAgeHours
  }
}

export class ChannelDto {
  @ApiProperty() title: string
  @ApiProperty() description: string
  @ApiProperty() aggregatedStats: number
  @ApiProperty() shouldBeIngested: boolean
  @ApiProperty() yppStatus: string
  @ApiProperty() joystreamChannelId: number
  @ApiProperty() videoCategoryId: string
  @ApiProperty() language: string
  @ApiProperty() thumbnails: ThumbnailsDto
  @ApiProperty() subscribersCount: number
  @ApiProperty() createdAt: Date

  constructor(channel: YtChannel) {
    this.title = channel.title
    this.description = channel.description
    this.subscribersCount = channel.statistics.subscriberCount
    this.joystreamChannelId = channel.joystreamChannelId
    this.videoCategoryId = channel.videoCategoryId
    this.language = channel.language
    this.shouldBeIngested = channel.shouldBeIngested
    this.yppStatus = channel.yppStatus
    this.aggregatedStats = channel.aggregatedStats
    this.thumbnails = channel.thumbnails
    this.createdAt = new Date(channel.createdAt)
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
}

// Dto for saving the verified Youtube channel
export class SaveChannelRequest {
  // Authorization code send to the backend after user o-auth verification
  @IsString() @ApiProperty({ required: true }) authorizationCode: string

  // Authorization code send to the backend after user O-auth verification
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
  @ApiProperty({ required: false }) referrerChannelId: number
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
  @ApiProperty() destinationUrl: string
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
