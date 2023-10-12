import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { DynamicModule, INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import express from 'express'
import * as fs from 'fs'
import path from 'path'
import { DynamodbService } from '../../repository'
import { ReadonlyConfig, formattedJSON } from '../../types'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { RuntimeApi } from '../runtime/api'
import { ContentProcessingService } from '../syncProcessing'
import { YoutubePollingService } from '../syncProcessing/YoutubePollingService'
import { IYoutubeApi } from '../youtube/api'
import {
  ChannelsController,
  StatusController,
  UsersController,
  VideosController,
  YoutubeController,
} from './controllers'
import { MembershipController } from './controllers/membership'

class ApiModule {}

const SWAGGER_DOCS_URL = '/docs'
const QUEUE_UI_URL = '/ui/queues'

// Create Swagger API documentation
function setupSwagger(app: INestApplication) {
  const documentConfig = new DocumentBuilder()
    .setTitle('Joystream Youtube Sync API')
    .setDescription('Youtube Sync API')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, documentConfig)

  // Swagger API documentation will be available at http://localhost:3000/docs
  SwaggerModule.setup(SWAGGER_DOCS_URL, app, document)

  // Also write api spec to JSON file
  fs.writeFileSync(path.join(__dirname, './api-spec.json'), formattedJSON(document))
}

// Create UI dashboard for BullMQ queues
async function setupQueuesDashboard(app: INestApplication, contentProcessingService: ContentProcessingService) {
  // Setup UI dashboard for BullMQ queues
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath(QUEUE_UI_URL)
  const queues = (await contentProcessingService.getQueues()).map((q) => new BullMQAdapter(q, { readOnlyMode: true }))
  createBullBoard({ queues, serverAdapter })
  app.use(QUEUE_UI_URL, serverAdapter.getRouter())
}

export async function bootstrapHttpApi(
  config: ReadonlyConfig,
  logging: LoggingService,
  dynamodbService: DynamodbService,
  runtimeApi: RuntimeApi,
  queryNodeApi: QueryNodeApi,
  youtubeApi: IYoutubeApi,
  youtubePollingService: YoutubePollingService,
  contentProcessingService: ContentProcessingService
) {
  // make sure WASM crypto module is ready
  await cryptoWaitReady()

  const objectAppModule: DynamicModule = {
    module: ApiModule,
    imports: [],
    exports: [],
    controllers: [
      VideosController,
      ChannelsController,
      UsersController,
      YoutubeController,
      StatusController,
      MembershipController,
    ],
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
        provide: YoutubePollingService,
        useValue: youtubePollingService,
      },
      {
        provide: ContentProcessingService,
        useValue: contentProcessingService,
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

  // override the res.send and res.json methods to save the body data to res.locals
  app.use((_request: express.Request, response: express.Response, next: express.NextFunction) => {
    const originalSend = response.send
    const originalJson = response.json

    response.json = function (data) {
      // Only save the body data if the http request failed, as we only log the response body for failed requests
      if (response.statusCode >= 400) {
        response.locals.body = data
      }
      return originalJson.call(this, data)
    }

    response.send = function (data) {
      // Only save the body data if the http request failed, as we only log the response body for failed requests
      if (response.statusCode >= 400) {
        response.locals.body = data
      }
      return originalSend.call(this, data)
    }

    next()
  })

  // API request/response logging
  const logger = logging.createLogger('HttpApi')
  app.use((request: express.Request, response: express.Response, next: express.NextFunction) => {
    const { method, originalUrl } = request

    response.on('finish', () => {
      const { statusCode, statusMessage, req, locals } = response

      // don't log swagger API docs or Queues dashboard page requests
      if (originalUrl.includes(SWAGGER_DOCS_URL) || originalUrl.includes(QUEUE_UI_URL)) return

      logger.http(statusMessage, {
        method,
        url: originalUrl,
        req: response.statusCode >= 400 ? { query: req.query, params: req.params, body: req.body } : undefined,
        res: locals.body,
        statusCode,
      })
    })

    next()
  })

  // Setup UI dashboard for BullMQ queues
  await setupQueuesDashboard(app, contentProcessingService)

  // Setup Swagger API documentation
  setupSwagger(app)
  await app.init()

  return app.listen(config.httpApi.port, () => {
    logger.info(`HTTP API listening on port ${config.httpApi.port}`)
  })
}
