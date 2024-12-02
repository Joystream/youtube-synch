import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  NotFoundException,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { signatureVerify } from '@polkadot/util-crypto'
import { randomBytes } from 'crypto'
import { DynamodbService } from '../../../repository'
import { ReadonlyConfig } from '../../../types'
import { YtChannel, YtUser } from '../../../types/youtube'
import { QueryNodeApi } from '../../query-node/api'
import { ContentProcessingClient } from '../../syncProcessing'
import { YoutubePollingService } from '../../syncProcessing/YoutubePollingService'
import { IYoutubeApi } from '../../youtube/api'
import {
  ChannelDto,
  ChannelInductionRequirementsDto,
  IngestChannelDto,
  OptoutChannelDto,
  ReferredChannelDto,
  SaveChannelRequest,
  SaveChannelResponse,
  SetChannelCategoryByOperatorDto,
  SetOperatorIngestionStatusDto,
  SuspendChannelDto,
  UpdateChannelCategoryDto,
  UserDto,
  VerifyChannelDto,
  WhitelistChannelDto,
} from '../dtos'

@Controller('channels')
@ApiTags('channels')
export class ChannelsController {
  constructor(
    @Inject('config') private config: ReadonlyConfig,
    @Inject('youtube') private youtubeApi: IYoutubeApi,
    private qnApi: QueryNodeApi,
    private dynamodbService: DynamodbService,
    private youtubePollingService: YoutubePollingService,
    private contentProcessingClient: ContentProcessingClient
  ) {}

  @Post()
  @ApiBody({ type: SaveChannelRequest })
  @ApiResponse({ type: SaveChannelResponse })
  @ApiOperation({ description: `Saves channel record of a YPP verified user` })
  async saveChannel(@Body() channelInfo: SaveChannelRequest): Promise<SaveChannelResponse> {
    if (this.config.httpApi.disableNewSignUps === true) {
      throw new ServiceUnavailableException("Endpoint temporarily disabled: Not accepting new sign-ups")
    }
    try {
      const {
        userId,
        authorizationCode,
        email,
        joystreamChannelId,
        shouldBeIngested,
        videoCategoryId,
        referrerChannelId,
      } = channelInfo

      /**
       *  Input Validation
       */

      if (referrerChannelId === joystreamChannelId) {
        throw new Error('Referrer channel cannot be the same as the channel being verified.')
      }

      // get user from userId
      const user = await this.dynamodbService.users.get(userId)

      // ensure request's authorization code matches the user's authorization code
      if (user.authorizationCode !== authorizationCode) {
        throw new Error('Invalid request author. Permission denied.')
      }

      // ensure that Joystream channel exists
      const jsChannel = await this.qnApi.getChannelById(joystreamChannelId.toString())
      if (!jsChannel) {
        throw new Error(`Joystream Channel ${joystreamChannelId} does not exist.`)
      }

      // ensure that Joystream channel isn't associated with any other participant channel
      const existingJsChannel = await this.dynamodbService.channels.findPartnerChannelByJoystreamId(joystreamChannelId)
      if (existingJsChannel) {
        throw new Error(
          `Joystream Channel ${joystreamChannelId} already connected with Youtube Channel ${existingJsChannel.id}.`
        )
      }

      // get channel from user
      let channel = await this.youtubeApi.getChannel(user)
      const existingChannel = await this.dynamodbService.repo.channels.get(channel.id)

      // reset authorization code to prevent repeated save channel requests by authorization code re-use
      const updatedUser: YtUser = { ...user, email, authorizationCode: randomBytes(10).toString('hex') }

      const joystreamChannelLanguageIso = jsChannel.language || undefined

      // If channel already exists in the DB (in `OptedOut` state), then we
      // associate most properties of existing channel record with the new
      // channel, i.e. createdAt, email. userId etc. and only override the
      // configuration properties provided in the request
      const updatedChannel: YtChannel = {
        ...(existingChannel
          ? {
              ...existingChannel,
              yppStatus: existingChannel.preOptOutStatus || 'Unverified',
              userAccessToken: channel.userAccessToken,
              userRefreshToken: channel.userRefreshToken,
            }
          : { ...channel, email }),
        joystreamChannelId,
        shouldBeIngested,
        videoCategoryId,
        referrerChannelId,
        joystreamChannelLanguageIso,
      }

      // save user and channel
      await this.saveUserAndChannel(updatedUser, updatedChannel)

      // return user and channel
      return new SaveChannelResponse(new UserDto(updatedUser), new ChannelDto(updatedChannel))
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new BadRequestException(message)
    }
  }

  @Get(':joystreamChannelId')
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({ description: 'Retrieves channel by joystreamChannelId' })
  async get(@Param('joystreamChannelId', ParseIntPipe) id: number) {
    try {
      const channel = await this.dynamodbService.channels.getByJoystreamId(id)
      const syncStatus = await this.contentProcessingClient.getJobsStatForChannel(channel.id)

      return new ChannelDto(channel, syncStatus)
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Get(':joystreamChannelId/referrals')
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({ description: 'Retrieves channel referrals by joystreamChannelId' })
  async getReferredChannels(@Param('joystreamChannelId', ParseIntPipe) id: number) {
    try {
      const referredChannels = await this.dynamodbService.channels.getReferredChannels(id)
      return referredChannels.map((c) => new ReferredChannelDto(c))
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Get()
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({ description: 'Retrieves the most recently verified 30 channels desc by date' })
  async getRecentVerifiedChannels() {
    try {
      const channels = await this.dynamodbService.channels.getRecent(30)
      return channels.map((channel) => new ChannelDto(channel))
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Put(':joystreamChannelId/ingest')
  @ApiBody({ type: IngestChannelDto })
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({ description: `Updates given channel syncing status. Note: only channel owner can update the status` })
  async ingestChannel(@Param('joystreamChannelId', ParseIntPipe) id: number, @Body() action: IngestChannelDto) {
    try {
      // ensure that action is valid and authorized by channel owner
      const { channel } = await this.ensureAuthorizedToPerformChannelAction(id, action)

      // update channel ingestion status
      await this.dynamodbService.channels.save({
        ...channel,
        shouldBeIngested: action.message.shouldBeIngested,
        lastActedAt: action.message.timestamp,
        ...(action.message.videoCategoryId ? { videoCategoryId: action.message.videoCategoryId } : {}),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Put(':joystreamChannelId/optout')
  @ApiBody({ type: OptoutChannelDto })
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({
    description: `Updates given channel's YPP participation status. Note: only channel owner can update the status`,
  })
  async optoutChannel(@Param('joystreamChannelId', ParseIntPipe) id: number, @Body() action: OptoutChannelDto) {
    try {
      // ensure that action is valid and authorized by channel owner
      const { channel } = await this.ensureAuthorizedToPerformChannelAction(id, action)

      // update channel's ypp participation status
      await this.dynamodbService.channels.save({
        ...channel,
        yppStatus: action.message.optout ? 'OptedOut' : 'Unverified',
        shouldBeIngested: false,
        lastActedAt: action.message.timestamp,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Put(':joystreamChannelId/category')
  @ApiBody({ type: UpdateChannelCategoryDto })
  @ApiResponse({ type: ChannelDto })
  @ApiOperation({
    description: `Updates given channel's videos category. Note: only channel owner can update the status`,
  })
  async updateCategoryChannel(
    @Param('joystreamChannelId', ParseIntPipe) id: number,
    @Body() action: UpdateChannelCategoryDto
  ) {
    try {
      // ensure that action is valid and authorized by channel owner
      const { channel } = await this.ensureAuthorizedToPerformChannelAction(id, action)

      // update channel's videos category ID
      await this.dynamodbService.channels.save({
        ...channel,
        videoCategoryId: action.message.videoCategoryId,
        lastActedAt: action.message.timestamp,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Put('/suspend')
  @ApiBody({ type: SuspendChannelDto, isArray: true })
  @ApiOperation({ description: `Authenticated endpoint to suspend given channel/s from YPP program` })
  async suspendChannels(
    @Headers('authorization') authorizationHeader: string,
    @Body(new ParseArrayPipe({ items: SuspendChannelDto, whitelist: true })) channels: SuspendChannelDto[]
  ) {
    // ensure operator authorization
    await this.ensureOperatorAuthorization(authorizationHeader)

    try {
      for (const { joystreamChannelId, reason } of channels) {
        const channel = await this.dynamodbService.channels.getByJoystreamId(joystreamChannelId)

        // if channel is being suspended then its YT ingestion/syncing should also be stopped
        await this.dynamodbService.channels.save({
          ...channel,
          yppStatus: `Suspended::${reason}`,
          processedAt: new Date(),
          allowOperatorIngestion: false,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Put('/verify')
  @ApiBody({ type: VerifyChannelDto, isArray: true })
  @ApiOperation({ description: `Authenticated endpoint to verify given channel/s in YPP program` })
  async verifyChannels(
    @Headers('authorization') authorizationHeader: string,
    @Body(new ParseArrayPipe({ items: VerifyChannelDto, whitelist: true })) channels: VerifyChannelDto[]
  ) {
    // ensure operator authorization
    await this.ensureOperatorAuthorization(authorizationHeader)

    try {
      for (const { joystreamChannelId, tier } of channels) {
        const channel = await this.dynamodbService.channels.getByJoystreamId(joystreamChannelId)

        // channel is being verified
        await this.dynamodbService.channels.save({
          ...channel,
          yppStatus: `Verified::${tier}`,
          processedAt: new Date(),
          allowOperatorIngestion: true,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Put('/operatorIngestion')
  @ApiBody({ type: SetOperatorIngestionStatusDto, isArray: true })
  @ApiOperation({
    description: `Authenticated endpoint to set operator ingestion status ("allowOperatorIngestion" field) of given channel/s in YPP program`,
  })
  async setOperatorIngestionStatusOfChannels(
    @Headers('authorization') authorizationHeader: string,
    @Body(new ParseArrayPipe({ items: SetOperatorIngestionStatusDto, whitelist: true }))
    channels: SetOperatorIngestionStatusDto[]
  ) {
    // ensure operator authorization
    await this.ensureOperatorAuthorization(authorizationHeader)

    try {
      for (const { joystreamChannelId, allowOperatorIngestion } of channels) {
        const channel = await this.dynamodbService.channels.getByJoystreamId(joystreamChannelId)

        // set operator ingestion status
        await this.dynamodbService.channels.save({
          ...channel,
          allowOperatorIngestion,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Put('/category')
  @ApiBody({ type: SetChannelCategoryByOperatorDto, isArray: true })
  @ApiOperation({
    description: `Authenticated endpoint to update video category of channel/s in YPP program by the Operator`,
  })
  async setChannelCategoryByOperator(
    @Headers('authorization') authorizationHeader: string,
    @Body(new ParseArrayPipe({ items: SetChannelCategoryByOperatorDto, whitelist: true }))
    channels: SetChannelCategoryByOperatorDto[]
  ) {
    // ensure operator authorization
    await this.ensureOperatorAuthorization(authorizationHeader)

    try {
      for (const { joystreamChannelId, videoCategoryId } of channels) {
        const channel = await this.dynamodbService.channels.getByJoystreamId(joystreamChannelId)

        // set operator ingestion status
        await this.dynamodbService.channels.save({
          ...channel,
          videoCategoryId,
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Post('/whitelist')
  @ApiResponse({ type: WhitelistChannelDto, isArray: true })
  @ApiOperation({ description: `Whitelist a given youtube channel/s by it's channel handle` })
  async addWhitelistChannels(
    @Headers('authorization') authorizationHeader: string,
    @Body(new ParseArrayPipe({ items: WhitelistChannelDto, whitelist: true })) channels: WhitelistChannelDto[]
  ) {
    const yppOwnerKey = authorizationHeader ? authorizationHeader.split(' ')[1] : ''
    // TODO: fix this YT_SYNCH__HTTP_API__OWNER_KEY config value
    if (yppOwnerKey !== process.env.YT_SYNCH__HTTP_API__OWNER_KEY) {
      throw new UnauthorizedException('Invalid YPP owner key')
    }

    try {
      for (const { channelHandle } of channels) {
        await this.dynamodbService.repo.whitelistChannels.save({
          channelHandle: channelHandle.toLowerCase(),
          createdAt: new Date(),
        })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Delete('/whitelist/:channelHandle')
  @ApiResponse({ type: WhitelistChannelDto })
  @ApiOperation({ description: `Remove a whitelisted channel by it's channel handle` })
  async deleteWhitelistedChannel(
    @Headers('authorization') authorizationHeader: string,
    @Param('channelHandle') channelHandle: string
  ) {
    // ensure operator authorization
    await this.ensureOperatorAuthorization(authorizationHeader)

    try {
      const whitelistChannel = await this.dynamodbService.repo.whitelistChannels.get(channelHandle.toLowerCase())

      if (!whitelistChannel) {
        throw new NotFoundException(`Channel with handle ${channelHandle} is not whitelisted`)
      }

      await this.dynamodbService.repo.whitelistChannels.delete(channelHandle)
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Get('/induction/requirements')
  @ApiResponse({ type: ChannelInductionRequirementsDto })
  @ApiOperation({ description: 'Retrieves Youtube Partner program induction requirements' })
  async inductionRequirements() {
    return new ChannelInductionRequirementsDto({
      ...this.youtubeApi.getCreatorOnboardingRequirements(),
    })
  }

  private async saveUserAndChannel(user: YtUser, channel: YtChannel) {
    // save user
    await this.dynamodbService.users.save(user)

    // save channel
    await this.dynamodbService.channels.save(channel)

    // fetch and save channel's videos
    if (this.config.sync.enable) {
      // The videos ingestion action is done as a background job rather than blocking
      // the request (as it may take a considerable time depending on the number of
      // videos). If the ingestion fails it will **NOT** be retried in next polling cycle.
      setImmediate(() => this.youtubePollingService.performVideosIngestion(channel, true))
    }
  }

  private async ensureOperatorAuthorization(authorizationHeader: string): Promise<void> {
    const yppOwnerKey = authorizationHeader ? authorizationHeader.split(' ')[1] : ''
    // TODO: fix this YT_SYNCH__HTTP_API__OWNER_KEY config value
    if (yppOwnerKey !== process.env.YT_SYNCH__HTTP_API__OWNER_KEY) {
      throw new UnauthorizedException('Invalid YPP owner key')
    }
  }

  private async ensureAuthorizedToPerformChannelAction(
    joystreamChannelId: number,
    action: IngestChannelDto | OptoutChannelDto | UpdateChannelCategoryDto
  ): Promise<{ channel: YtChannel }> {
    const { signature, message } = action
    const actionType: string = (action as any).constructor.name.replace('Dto', '')
    const channel = await this.dynamodbService.channels.getByJoystreamId(joystreamChannelId)

    // Ensure channel is not suspended or opted out
    if (YtChannel.isSuspended(channel) || channel.yppStatus === 'OptedOut') {
      throw new Error(`Can't perform "${actionType}" action on a "${channel.yppStatus}" channel. Permission denied.`)
    }

    const jsChannel = await this.qnApi.getChannelById(channel.joystreamChannelId.toString())
    if (!jsChannel || !jsChannel.ownerMember) {
      throw new Error(`Joystream Channel not found by ID ${joystreamChannelId}.`)
    }

    // verify the message signature using Channel owner's address
    const { isValid } = signatureVerify(JSON.stringify(message), signature, jsChannel.ownerMember.controllerAccount)

    // Ensure that the signature is valid and the message is not a playback message
    if (!isValid || channel.lastActedAt >= message.timestamp) {
      throw new Error('Invalid request signature or playback message. Permission denied.')
    }

    return { channel }
  }
}
