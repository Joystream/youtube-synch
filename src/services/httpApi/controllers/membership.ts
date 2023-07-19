import { BadRequestException, Body, Controller, Inject, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import axios from 'axios'
import { DynamodbService } from '../../../repository'
import { ReadonlyConfig } from '../../../types'
import { FaucetRegisterMembershipParams, FaucetRegisterMembershipResponse } from '../../../types/youtube'
import { CreateMembershipRequest, CreateMembershipResponse } from '../dtos'

@Controller('membership')
@ApiTags('membership')
export class MembershipController {
  constructor(@Inject('config') private config: ReadonlyConfig, private dynamodbService: DynamodbService) {}

  @ApiOperation({
    description: `Create Joystream's on-chain Membership for a verfifed YPP user. It will forward request
       to Joystream faucet with an Authorization header to circumvent captcha verfication by the faucet`,
  })
  @ApiBody({ type: CreateMembershipRequest })
  @ApiResponse({ type: CreateMembershipResponse })
  @Post()
  async createMembership(@Body() membershipParams: CreateMembershipRequest): Promise<CreateMembershipResponse> {
    try {
      const { userId, authorizationCode, account, handle, avatar, about, name } = membershipParams

      // get user from userId
      const user = await this.dynamodbService.users.get(userId)

      // ensure request's authorization code matches the user's authorization code
      if (user.authorizationCode !== authorizationCode) {
        throw new Error('Invalid request author. Permission denied.')
      }
      if (user.joystreamMemberId) {
        throw new Error(`Already created Joysteam member ${user.joystreamMemberId} for user ${user.id}`)
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
    const response = await axios.post<FaucetRegisterMembershipResponse>(endpoint, params, {
      headers: { Authorization: `Bearer ${captchaBypassKey}` },
    })
    return response.data
  }
}
