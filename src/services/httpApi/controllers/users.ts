import { BadRequestException, Body, Controller, Inject, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DynamodbService } from '../../../repository'
import { ReadonlyConfig } from '../../../types'
import { ExitCodes, YoutubeApiError } from '../../../types/errors'
import { YtChannel } from '../../../types/youtube'
import { YoutubeApi } from '../../youtube'
import { VerifyChannelRequest, VerifyChannelResponse } from '../dtos'

@Controller('users')
@ApiTags('channels')
export class UsersController {
  constructor(
    private youtubeApi: YoutubeApi,
    private dynamodbService: DynamodbService,
    @Inject('config') private config: ReadonlyConfig
  ) {}

  @ApiOperation({
    description: `fetches user's channel from the supplied google authorization code, and verifies if it satisfies YPP induction criteria`,
  })
  @ApiBody({ type: VerifyChannelRequest })
  @ApiResponse({ type: VerifyChannelResponse })
  @Post()
  async verifyUserAndChannel(
    @Body() { authorizationCode, youtubeRedirectUri, youtubeVideoUrl }: VerifyChannelRequest
  ): Promise<VerifyChannelResponse> {
    try {
      const user = authorizationCode // && this.config.youtube.apiMode !== 'api-free'
        ? await this.youtubeApi.dataApiV3.getUserFromCode(authorizationCode, youtubeRedirectUri)
        : await this.youtubeApi.ytdlp.getUserFromVideoUrl(youtubeVideoUrl!)

      const registeredChannel = await this.dynamodbService.repo.channels.get(user.id)

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

      const { channel, errors } = authorizationCode
        ? await this.youtubeApi.dataApiV3.getVerifiedChannel(user)
        : await this.youtubeApi.operationalApi.getVerifiedChannel(user)
      const whitelistedChannel = await this.dynamodbService.repo.whitelistChannels.get(channel.customUrl)

      // check if the channel is whitelisted
      if (errors.length && !whitelistedChannel) {
        throw errors
      }

      // Get existing user record from db (if any)
      const existingUser = await this.dynamodbService.repo.users.get(user.id)

      // save user & set joystreamMemberId if user already existed
      await this.dynamodbService.users.save({ ...user, joystreamMemberId: existingUser?.joystreamMemberId })

      // return verified user
      return {
        id: user.id,
        email: user.email || '',
        channelTitle: channel.title,
        channelDescription: channel.description,
        avatarUrl: channel.thumbnails.high,
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
