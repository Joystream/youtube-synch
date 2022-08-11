import { MemberId } from '@joystream/types/primitives'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { User, Channel, Video, VideoState } from '@youtube-sync/domain'

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
  /**
   *
   */
  constructor(channel: Channel) {
    this.title = channel.title
    this.description = channel.description
    this.joystreamId = channel.chainMetadata?.id.toNumber()
    this.shouldBeInjested = channel.shouldBeIngested
    this.uploadsPlaylistId = channel.uploadsPlaylistId
    this.aggregatedStats = channel.aggregatedStats
    this.thumbnails = channel.thumbnails
  }

  @ApiProperty() title: string
  @ApiProperty() description: string
  @ApiProperty() aggregatedStats: number
  @ApiProperty() uploadsPlaylistId: string
  @ApiProperty() shouldBeInjested: boolean
  @ApiProperty() joystreamId: number
  @ApiProperty() thumbnails: ThumbnailsDto
}
export class UserDto {
  /**
   *
   */
  constructor(user: User) {
    this.id = user.id
    this.email = user.email
    this.avatarUrl = user.avatarUrl
    this.channelsCount = user.channelsCount
    this.membership = user.membership
  }

  @ApiProperty() id: string
  @ApiProperty() email: string
  @ApiProperty() avatarUrl: string
  @ApiProperty() channelsCount: number
  @ApiProperty() membership: MembershipDto
}

export class UserCreateRequest {
  @ApiProperty({ required: true })
  authorizationCode: string
}

export class UserCreateResponse {
  /**
   *
   */
  constructor(user: UserDto, channels: ChannelDto[]) {
    this.user = user
    this.channels = channels
  }

  @ApiProperty() user: UserDto
  @ApiProperty({ type: ChannelDto, isArray: true })
  channels: ChannelDto[]
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
