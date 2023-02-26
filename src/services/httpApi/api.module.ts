import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { DynamodbService } from '../../repository'
import { LoggingService } from '../logging'
import { ConfigParserService } from '../../utils/configParser'
import { QueryNodeApi } from '../query-node/api'
import { YoutubeApi } from '../youtube/api'
import { ChannelsController } from './controllers/channels'
import { UsersController } from './controllers/users'
import { VideosController } from './controllers/videos'
import { YoutubeController } from './controllers/youtube'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [() => new ConfigParserService('./config.yml').parse()],
    }),
  ],
  controllers: [VideosController, ChannelsController, UsersController, YoutubeController],
  providers: [
    {
      provide: 'dynamodbService',
      useFactory: () => {
        return DynamodbService.init()
      },
    },
    {
      provide: QueryNodeApi,
      useFactory: (configService: ConfigService) => {
        return new QueryNodeApi(
          configService.get('endpoints.queryNode')!,
          LoggingService.withAppConfig(configService.get('logs')!)
        )
      },
      inject: [ConfigService],
    },
    {
      provide: 'youtube',
      useFactory: (configService: ConfigService) => {
        return YoutubeApi.create(
          { ...configService.get('ypp')!, ...configService.get('youtubeConfig')! },
          LoggingService.withAppConfig(configService.get('logs')!)
        )
      },
      inject: [ConfigService],
    },
  ],
})
export class ApiModule {}
