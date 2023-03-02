import { Controller, Get, Inject, NotFoundException } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Stats } from '../../../types/youtube'
import { IDynamodbService } from '../../../repository'

@Controller('youtube')
@ApiTags('youtube')
export class YoutubeController {
  constructor(@Inject('dynamodbService') private dynamodbService: IDynamodbService) {}

  @Get('quota-usage')
  @ApiResponse({ type: Stats, isArray: true })
  @ApiOperation({ description: `Get youtube quota usage information` })
  async getAll(): Promise<Stats[]> {
    try {
      // Get complete quota usage stats
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
  async get(): Promise<Stats> {
    try {
      const stats = this.dynamodbService.repo.stats.getOrSetTodaysStats()
      return stats
    } catch (error) {
      const message = error instanceof Error ? error.message : error
      throw new NotFoundException(message)
    }
  }
}
