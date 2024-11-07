import { BadRequestException, Body, Controller, Inject, Post, ServiceUnavailableException } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DynamodbService } from '../../../repository'
import { ExitCodes, YoutubeApiError } from '../../../types/errors'
import { YtChannel } from '../../../types/youtube'
import { IYoutubeApi } from '../../youtube/api'
import { VerifyChannelRequest, VerifyChannelResponse } from '../dtos'
import { ReadonlyConfig } from '../../../types'

@Controller('users')
@ApiTags('channels')
export class UsersController {
  constructor(
    @Inject('config') private config: ReadonlyConfig,
    @Inject('youtube') private youtube: IYoutubeApi,
    private dynamodbService: DynamodbService
  ) {}

  @ApiOperation({
    description: `fetches user's channel from the supplied google authorization code, and verifies if it satisfies YPP induction criteria`,
  })
  @ApiBody({ type: VerifyChannelRequest })
  @ApiResponse({ type: VerifyChannelResponse })
  @Post()
  async verifyUserAndChannel(
    @Body() { authorizationCode, youtubeRedirectUri }: VerifyChannelRequest
  ): Promise<VerifyChannelResponse> {
    if (this.config.httpApi.disableNewSignUps === true) {
      throw new ServiceUnavailableException('Endpoint temporarily disabled: Not accepting new sign-ups')
    }
    try {
      // get user from authorization code
      const user = await this.youtube.getUserFromCode(authorizationCode, youtubeRedirectUri)

      const [registeredChannel] = await this.dynamodbService.channels.getAll(user.id)

      // Ensure 1. selected YT channel is not already registered for YPP program
      // OR 2. even if registered previously it has opted out.
      if (registeredChannel) {
        if (YtChannel.isVerified(registeredChannel) || registeredChannel.yppStatus === 'Unverified') {
          throw new YoutubeApiError(
            ExitCodes.YoutubeApi.CHANNEL_ALREADY_REGISTERED,
            `Selected Youtube channel is already registered for YPP program`,
            registeredChannel.joystreamChannelId
          )
        } else if (YtChannel.isSuspended(registeredChannel)) {
          throw new YoutubeApiError(
            ExitCodes.YoutubeApi.CHANNEL_STATUS_SUSPENDED,
            `A suspended channel cannot re opt-in for YPP program`,
            registeredChannel.joystreamChannelId
          )
        }
      }

      const { channel, errors } = await this.youtube.getVerifiedChannel(user)
      const whitelistedChannel = await this.dynamodbService.repo.whitelistChannels.get(channel.customUrl)

      // check if the channel is whitelisted
      if (errors.length && !whitelistedChannel) {
        throw errors
      }

      // Get existing user record from db (if any)
      const existingUser = await this.dynamodbService.repo.users.get(user.id)

      // save user & set joystreamMemberId if user already existed
      await this.dynamodbService.users.save({ ...user, joystreamMemberIds: existingUser?.joystreamMemberIds || [] })

      // return verified user
      return {
        email: user.email,
        userId: user.id,
        channelTitle: channel.title,
        channelDescription: channel.description,
        avatarUrl: channel.thumbnails.medium,
        bannerUrl: channel.bannerImageUrl,
        channelHandle: channel.customUrl,
        channelLanguage: channel.language,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new BadRequestException(message)
    }
  }
}
