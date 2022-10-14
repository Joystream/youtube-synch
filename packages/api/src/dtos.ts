import { MemberId } from '@joystream/types/primitives'
import { ApiProperty } from '@nestjs/swagger'
import { User, Channel, Video, VideoState } from '@youtube-sync/domain'
import { IsEmail, IsNotEmpty } from 'class-validator'

// NestJS Data Transfer Objects (DTO)s

export class MembershipDto {
  @ApiProperty() memberId: MemberId
  @ApiProperty() address: string
}

export class ThumbnailsDto {
  @ApiProperty() default: string
  @ApiProperty() medium: string
  @ApiProperty() high: string
  @ApiProperty() maxRes: string
  @ApiProperty() standard: string
}

export class ChannelDto {
  @ApiProperty() title: string
  @ApiProperty() description: string
  @ApiProperty() aggregatedStats: number
  @ApiProperty() shouldBeIngested: boolean
  @ApiProperty() joystreamChannelId: number
  @ApiProperty() thumbnails: ThumbnailsDto
  @ApiProperty() tier: number

  constructor(channel: Channel) {
    this.title = channel.title
    this.description = channel.description
    this.tier = channel.tier
    this.joystreamChannelId = channel.joystreamChannelId
    this.shouldBeIngested = channel.shouldBeIngested.status
    this.aggregatedStats = channel.aggregatedStats
    this.thumbnails = channel.thumbnails
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
  @ApiProperty({ required: true }) authorizationCode: string
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
  @ApiProperty({ required: true }) authorizationCode: string

  // Authorization code send to the backend after user O-auth verification
  @ApiProperty({ required: true }) userId: string

  // Email of the user
  @IsEmail() @ApiProperty({ required: true }) email: string

  // Joystream Channel ID of the user verifying his Youtube Channel for YPP
  @ApiProperty({ required: true }) joystreamChannelId: number

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

export class IngestChannelDto {
  @IsNotEmpty() @ApiProperty({ required: true }) signature: string
  @IsNotEmpty() @ApiProperty({ required: true }) message: {
    shouldBeIngested: boolean
    timestamp: Date
  }
}
