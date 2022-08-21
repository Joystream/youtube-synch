import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'
import { config } from 'aws-sdk'
import * as fs from 'fs'

// TODO: Ensure that for local testing dynamodb service is available & all tables exist, maybe: yarn deploy & yarn serve?

config.update({
  region: 'us-east-1',
  dynamodb: { endpoint: process.env.AWS_ENDPOINT },
})

// Create Swagger API documentation
function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Joystream Youtube Sync API')
    .setDescription('Youtube Sync API')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  // Swagger API documentation will be available at http://localhost:3000/docs
  SwaggerModule.setup('docs', app, document)

  // Also write api spec to JSON file
  fs.writeFileSync('./packages/api/api-spec.json', JSON.stringify(document, null, 2))
}

async function bootstrap() {
  // Create App
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    allowedHeaders: '*',
    methods: '*',
    origin: '*',
  })

  setupSwagger(app)
  await app.init()
  return app.listen(3001)
}

bootstrap()
