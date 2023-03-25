import { Controller, Get, NotFoundException } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DynamodbService } from '../../../repository'
import { Stats } from '../../../types/youtube'

@Controller('youtube')
@ApiTags('youtube')
export class YoutubeController {
  constructor(private dynamodbService: DynamodbService) {}

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
