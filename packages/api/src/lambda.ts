import { INestApplication } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Handler, Context, Callback } from 'aws-lambda'
import { AppModule } from './app.module'
import serverlessExpress from '@vendia/serverless-express'
import { setAwsConfig } from '@youtube-sync/domain'

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Joystream Youtube Partner Program (YPP) API')
    .setDescription('Joystream Youtube Partner Program (YPP) API')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}

async function bootstrapServerless() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    allowedHeaders: '*',
    methods: '*',
    origin: '*',
  })
  setupSwagger(app)
  await app.init()
  const expressApp = app.getHttpAdapter().getInstance()

  cachedHandler = serverlessExpress({ app: expressApp })
  return cachedHandler
}

let cachedHandler: Handler

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  // Set AWS config in global scope case we are running locally
  setAwsConfig()

  if (event.path === '/api') {
    event.path = '/api/'
  }
  event.path = event.path.includes('swagger-ui') ? `/api${event.path}` : event.path
  const server = cachedHandler ?? (await bootstrapServerless())
  console.log(server)
  return server(event, context, callback)
}
