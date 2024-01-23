import { BadRequestException, Body, Controller, Inject, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import axios from 'axios'
import { DynamodbService } from '../../../repository'
import { ReadonlyConfig } from '../../../types'
import { FaucetApiError } from '../../../types/errors'
import { FaucetRegisterMembershipParams, FaucetRegisterMembershipResponse } from '../../../types/youtube'
import { CreateMembershipRequest, CreateMembershipResponse } from '../dtos'

@Controller('membership')
@ApiTags('membership')
export class MembershipController {
  constructor(@Inject('config') private config: ReadonlyConfig, private dynamodbService: DynamodbService) {}

  @ApiOperation({
    description: `Create Joystream's on-chain Membership for a verified YPP user. It will forward request
       to Joystream faucet with an Authorization header to circumvent captcha verification by the faucet`,
  })
  @ApiBody({ type: CreateMembershipRequest })
  @ApiResponse({ type: CreateMembershipResponse })
  @Post()
  async createMembership(@Body() createMembershipParams: CreateMembershipRequest): Promise<CreateMembershipResponse> {
    try {
      const { id, youtubeVideoUrl, account, handle, avatar, about, name } = createMembershipParams

      // TODO: check if needed. maybe add new flag `isSaved` to user record and check that instead
      // const registeredChannel = await this.dynamodbService.repo.channels.get(user.id)
      // if (registeredChannel) {
      //   if (YtChannel.isVerified(registeredChannel) || registeredChannel.yppStatus === 'Unverified') {
      //     throw new YoutubeApiError(
      //       ExitCodes.YoutubeApi.CHANNEL_ALREADY_REGISTERED,
      //       `Cannot create membership for a channel already registered in YPP`,
      //       registeredChannel.joystreamChannelId
      //     )
      //   }
      // }

      // get user from userId
      const user = await this.dynamodbService.users.get(id)

      // ensure request's authorization code matches the user's authorization code
      if (user.youtubeVideoUrl !== youtubeVideoUrl) {
        throw new Error('Authorization error. Youtube video url is invalid.')
      }

      // Ensure that user has not already created a Joystream membership
      if (user.joystreamMemberId) {
        throw new Error(`Already created Joystream member ${user.joystreamMemberId} for user ${user.id}`)
      }

      // send create membership request to faucet
      const { memberId } = await this.createMemberWithFaucet({ account, handle, avatar, about, name })

      // save updated user entity
      await this.dynamodbService.users.save({ ...user, joystreamMemberId: memberId })

      return new CreateMembershipResponse(memberId, handle)
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new BadRequestException(message)
    }
  }

  private async createMemberWithFaucet(params: FaucetRegisterMembershipParams): Promise<{ memberId: number }> {
    const { endpoint, captchaBypassKey } = this.config.joystream.faucet
    try {
      const response = await axios.post<FaucetRegisterMembershipResponse>(endpoint, params, {
        headers: { Authorization: `Bearer ${captchaBypassKey}` },
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new FaucetApiError(
          error.response?.data?.error || error.cause || error.code,
          `Failed to create membership through faucet for account address: ${params.account}`
        )
      }
      throw error
    }
  }
}
