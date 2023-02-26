import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import * as fs from 'fs'
import { ApiModule } from './api.module'
import { toPrettyJSON } from '../../types'
import { QueryNodeApi } from '../query-node/api'
import { IDynamodbService } from '../../repository'
import { IYoutubeApi } from '../youtube/api'
import path from 'path'

// Set AWS config in case we are running locally
// setAwsConfig()

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
  queryNodeApi: QueryNodeApi,
  dynamodbService: IDynamodbService,
  youtubeApi: IYoutubeApi
) {
  // make sure WASM crypto module is ready
  await cryptoWaitReady()

  // create App
  const app = await NestFactory.create(ApiModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true })) // enable ValidationPipe
  app.enableCors({ allowedHeaders: '*', methods: '*', origin: '*' })
  setupSwagger(app)
  await app.init()
  return app.listen(3001)
}
