import { Controller, Get, Inject, NotFoundException } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import BN from 'bn.js'
import { DynamodbService } from '../../../repository'
import { ReadonlyConfig } from '../../../types'
import { Stats } from '../../../types/youtube'
import { RuntimeApi } from '../../runtime/api'
import { ContentProcessingService } from '../../syncProcessing'
import { CollaboratorStatusDto, StatusDto } from '../dtos'

@Controller('status')
@ApiTags('status')
export class StatusController {
  constructor(
    private dynamodbService: DynamodbService,
    private runtimeApi: RuntimeApi,
    private contentProcessingService: ContentProcessingService,
    @Inject('config') private config: ReadonlyConfig
  ) {}

  @Get()
  @ApiResponse({ type: StatusDto })
  @ApiOperation({ description: `Get status info of YT-Synch service` })
  async getStatus(): Promise<StatusDto> {
    try {
      // Get complete quota usage statss
      const {
        version,
        sync: { enable },
      } = this.config

      const { totalJobs: syncBacklog } = await this.contentProcessingService.getJobsStat()
      return { version, syncStatus: enable ? 'enabled' : 'disabled', syncBacklog }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Get('quota-usage')
  @ApiResponse({ type: Stats, isArray: true })
  @ApiOperation({ description: `Get youtube quota usage information` })
  async getQuotaStats(): Promise<Stats[]> {
    try {
      // Get complete quota usage statss
      const stats = await this.dynamodbService.repo.stats.scan('partition', (s) => s)
      return stats
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Get('quota-usage/today')
  @ApiResponse({ type: Stats })
  @ApiOperation({ description: `Get youtube quota usage information for today` })
  async getQuotaStatsForToday(): Promise<Stats> {
    try {
      const stats = this.dynamodbService.repo.stats.getOrSetTodaysStats()
      return stats
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }

  @Get('collaborator')
  @ApiResponse({ type: Stats })
  @ApiOperation({ description: `Get Joystream collaborator account info` })
  async getCollaboratorStatus(): Promise<CollaboratorStatusDto> {
    const ONE_JOY = new BN(10_000_000_000)
    try {
      const collaboratorMemberId = this.config.joystream.channelCollaborator.memberId
      const member = await this.runtimeApi.query.members.membershipById(collaboratorMemberId)
      if (!member.isSome) {
        throw new Error(`Collaborator member ${collaboratorMemberId} not found`)
      }

      const {
        data: { free },
      } = await this.runtimeApi.query.system.account(member.unwrap().controllerAccount)

      return {
        memberId: collaboratorMemberId,
        controllerAccount: member.unwrap().controllerAccount.toString(),
        balance: free.divRound(ONE_JOY).toString(),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }
}
