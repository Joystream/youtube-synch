import { MemberId } from '@joystream/types/primitives'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { User, Channel, Video, VideoState } from '@youtube-sync/domain'
import { IsEmail } from 'class-validator'

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
  @ApiProperty() uploadsPlaylistId: string
  @ApiProperty() shouldBeInjested: boolean
  @ApiProperty() joystreamId: number
  @ApiProperty() thumbnails: ThumbnailsDto

  constructor(channel: Channel) {
    this.title = channel.title
    this.description = channel.description
    this.joystreamId = channel.chainMetadata?.id.toNumber()
    this.shouldBeInjested = channel.shouldBeIngested
    this.uploadsPlaylistId = channel.uploadsPlaylistId
    this.aggregatedStats = channel.aggregatedStats
    this.thumbnails = channel.thumbnails
  }
}
export class UserDto {
  @ApiProperty() id: string
  @ApiProperty() email: string
  @ApiProperty() avatarUrl: string
  @ApiProperty() channelsCount: number
  @ApiProperty() membership: MembershipDto

  constructor(user: User) {
    this.id = user.id
    this.email = user.email
    this.avatarUrl = user.avatarUrl
    this.channelsCount = user.channelsCount
    this.membership = user.membership
  }
}

// Dto for verifying Youtube channel given the authorization code
export class VerifyChannelRequest {
  // Authorization code send to the backend after user O-auth verification
  @ApiProperty({ required: true }) authorizationCode: string

  // Email of the user
  @IsEmail() @ApiProperty({ required: true }) email: string

  // Joystream Channel ID of the user verifying his Youtube Channel for YPP
  @ApiProperty({ required: true }) joystreamChannelId: string

  // Member ID of the referrer
  @ApiProperty({ required: true }) referrerId: string
}

export class VerifyChannelResponse {
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
