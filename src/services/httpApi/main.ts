import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import express from 'express'
import * as fs from 'fs'
import path from 'path'
import { toPrettyJSON } from '../../types'
import { LoggingService } from '../logging'
import { ApiModule } from './api.module'

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

export async function bootstrapHttpApi(port: number, logging: LoggingService) {
  // make sure WASM crypto module is ready
  await cryptoWaitReady()

  const logger = logging.createLogger('HttpApi')
  // create App
  const app = await NestFactory.create(ApiModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true })) // enable ValidationPipe
  app.enableCors({ allowedHeaders: '*', methods: '*', origin: '*' })
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
  return app.listen(port, () => {
    logger.info(`HTTP API listening on port ${port}`)
  })
}
