import { MemberId } from '@joystream/types/primitives'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { User, Channel, Video, VideoState } from '@youtube-sync/domain'
import { IsEmail, IsNotEmpty } from 'class-validator'
import { getConfig as config } from '@youtube-sync/domain'

// NestJS Data Transfer Objects (DTO)s

export class MembershipDto {
  @ApiProperty() memberId: MemberId
  @ApiProperty() address: string
}

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

  constructor(requirements: ReturnType<typeof config>) {
    this.MINIMUM_SUBSCRIBERS_COUNT = Number(requirements.MINIMUM_SUBSCRIBERS_COUNT)
    this.MINIMUM_VIDEO_COUNT = Number(requirements.MINIMUM_VIDEO_COUNT)
    this.MINIMUM_VIDEO_AGE_HOURS = Number(requirements.MINIMUM_VIDEO_AGE_HOURS)
    this.MINIMUM_CHANNEL_AGE_HOURS = Number(requirements.MINIMUM_CHANNEL_AGE_HOURS)
  }
}

export class ChannelDto {
  @ApiProperty() title: string
  @ApiProperty() description: string
  @ApiProperty() aggregatedStats: number
  @ApiProperty() shouldBeIngested: boolean
  @ApiProperty() isSuspended: boolean
  @ApiProperty() joystreamChannelId: number
  @ApiProperty() thumbnails: ThumbnailsDto
  @ApiProperty() subscribersCount: number
  @ApiProperty() createdAt: Date

  constructor(channel: Channel) {
    this.title = channel.title
    this.description = channel.description
    this.subscribersCount = channel.statistics.subscriberCount
    this.joystreamChannelId = channel.joystreamChannelId
    this.shouldBeIngested = channel.shouldBeIngested
    this.isSuspended = channel.isSuspended
    this.aggregatedStats = channel.aggregatedStats
    this.thumbnails = channel.thumbnails
    this.createdAt = new Date(channel.createdAt)
  }
}

export class UserDto {
  @ApiProperty() id: string
  @ApiProperty() email: string

  constructor(user: User) {
    this.id = user.id
    this.email = user.email
  }
}

// Dto for verifying Youtube channel given the authorization code
export class VerifyChannelRequest {
  // Authorization code send to the backend after user o-auth verification
  @IsNotEmpty() @ApiProperty({ required: true }) authorizationCode: string

  @IsNotEmpty() @ApiProperty({ required: true }) youtubeRedirectUri: string
}

// Dto for verified Youtube channel response
export class VerifyChannelResponse {
  // Email of the verified user
  @IsEmail() @ApiProperty({ required: true }) email: string

  // ID of the verified user
  @IsEmail() @ApiProperty({ required: true }) userId: string
}

// Dto for saving the verified Youtube channel
export class SaveChannelRequest {
  // Authorization code send to the backend after user o-auth verification
  @IsNotEmpty() @ApiProperty({ required: true }) authorizationCode: string

  // Authorization code send to the backend after user O-auth verification
  @IsNotEmpty() @ApiProperty({ required: true }) userId: string

  // Email of the user
  @IsEmail() @ApiProperty({ required: true }) email: string

  // Joystream Channel ID of the user verifying his Youtube Channel for YPP
  @IsNotEmpty() @ApiProperty({ required: true }) joystreamChannelId: number

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

export class VideoDto extends Video {
  @ApiProperty() url: string
  @ApiProperty() title: string
  @ApiProperty() description: string
  @ApiProperty() id: string
  @ApiProperty() playlistId: string
  @ApiProperty() resourceId: string
  @ApiProperty() channelId: string
  @ApiProperty() thumbnails: ThumbnailsDto
  @ApiProperty() state: VideoState
  @ApiProperty() destinationUrl: string
}

export class UpdateChannelDto extends PickType(Channel, ['shouldBeIngested']) {
  @ApiProperty() shouldBeIngested: boolean
}

export class SuspendChannelDto {
  @IsNotEmpty() @ApiProperty({ required: true }) @IsNotEmpty() joystreamChannelId: number
  @IsNotEmpty() @ApiProperty({ required: true }) @IsNotEmpty() isSuspended: boolean
}
