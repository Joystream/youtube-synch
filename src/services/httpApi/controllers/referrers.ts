import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import NodeCache from 'node-cache'
import { DynamodbService } from '../../../repository'
import { TopReferrer } from '../../../types/youtube'
import { TopReferrerDto } from '../dtos'

const REFERRERS_CACHE_KEY = 'topReferrers'
const REFERRERS_CACHE_TTL = 3600 // 1 hour in seconds
const cache = new NodeCache({ stdTTL: REFERRERS_CACHE_TTL })

@Controller('referrers')
@ApiTags('channels')
export class ReferrersController {
  constructor(private dynamodbService: DynamodbService) {}

  @Get('/top-referrers')
  @ApiResponse({ type: TopReferrerDto, isArray: true })
  @ApiOperation({ description: 'Get top YPP referrers by cumulative rewards.' })
  async getTopReferrers(): Promise<TopReferrerDto[]> {
    // Attempt to get data from cache
    let referrers = cache.get<TopReferrer[]>(REFERRERS_CACHE_KEY)

    // If no cache data, fetch from DynamoDB
    if (!referrers) {
      referrers = await this.dynamodbService.channels.getTopReferrers()
      cache.set(REFERRERS_CACHE_KEY, referrers)
    }

    return referrers
  }
}
