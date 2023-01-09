import { INestApplication, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { setAwsConfig, toPrettyJSON } from '@youtube-sync/domain'
import * as fs from 'fs'
import { AppModule } from './app.module'

// Set AWS config in case we are running locally
setAwsConfig()

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
  fs.writeFileSync('./packages/api/api-spec.json', toPrettyJSON(document))
}

async function bootstrap() {
  // make sure WASM crypto module is ready
  await cryptoWaitReady()

  // create App
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true })) // enable ValidationPipe
  app.enableCors({ allowedHeaders: '*', methods: '*', origin: '*' })
  setupSwagger(app)
  await app.init()
  return app.listen(3001)
}

bootstrap()
