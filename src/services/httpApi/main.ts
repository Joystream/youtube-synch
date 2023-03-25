import { DynamicModule, INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import express from 'express'
import * as fs from 'fs'
import path from 'path'
import { DynamodbService } from '../../repository'
import { ReadonlyConfig, toPrettyJSON } from '../../types'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { RuntimeApi } from '../runtime/api'
import { IYoutubeApi } from '../youtube/api'
import {
  ChannelsController,
  UsersController,
  VideosController,
  StatusController,
  YoutubeController,
} from './controllers'

class ApiModule {}

// Create Swagger API documentation
function setupSwagger(app: INestApplication) {
  const documentConfig = new DocumentBuilder()
    .setTitle('Joystream Youtube Sync API')
    .setDescription('Youtube Sync API')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, documentConfig)

  // Swagger API documentation will be available at http://localhost:3000/docs
  SwaggerModule.setup('docs', app, document)

  // Also write api spec to JSON file
  fs.writeFileSync(path.join(__dirname, './api-spec.json'), toPrettyJSON(document))
}

export async function bootstrapHttpApi(
  config: ReadonlyConfig,
  logging: LoggingService,
  dynamodbService: DynamodbService,
  queryNodeApi: QueryNodeApi,
  youtubeApi: IYoutubeApi
) {
  // make sure WASM crypto module is ready
  await cryptoWaitReady()

  const runtimeApi = new RuntimeApi(config.endpoints.joystreamNodeWs, logging)
  const objectAppModule: DynamicModule = {
    module: ApiModule,
    imports: [],
    exports: [],
    controllers: [VideosController, ChannelsController, UsersController, YoutubeController, StatusController],
    providers: [
      {
        provide: DynamodbService,
        useValue: dynamodbService,
      },
      {
        provide: QueryNodeApi,
        useValue: queryNodeApi,
      },
      {
        provide: RuntimeApi,
        useValue: runtimeApi,
      },
      {
        provide: 'youtube',
        useValue: youtubeApi,
      },
      {
        provide: 'config',
        useValue: config,
      },
    ],
  }

  // create App
  const app = await NestFactory.create(objectAppModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true })) // enable ValidationPipe
  app.enableCors({ allowedHeaders: '*', methods: '*', origin: '*' })

  // API request/response logging
  const logger = logging.createLogger('HttpApi')
  app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
    const { method, originalUrl } = request

    response.on('finish', () => {
      const { statusCode } = response
      logger.http(`${method} ${originalUrl} ${statusCode}`)
    })

    next()
  })

  setupSwagger(app)
  await app.init()

  return app.listen(config.httpApi.port, () => {
    logger.info(`HTTP API listening on port ${config.httpApi.port}`)
  })
}
