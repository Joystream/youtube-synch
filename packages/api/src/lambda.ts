import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import serverlessExpress from '@vendia/serverless-express'
import { setAwsConfig } from '@youtube-sync/domain'
import { Callback, Context, Handler, APIGatewayEvent } from 'aws-lambda'
import { AppModule } from './app.module'

let cachedHandler: Handler

async function bootstrapServerless() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe()) // enable ValidationPipe
  app.enableCors({ allowedHeaders: '*', methods: '*', origin: '*' })
  await app.init()

  const expressApp = app.getHttpAdapter().getInstance()
  cachedHandler = serverlessExpress({ app: expressApp })
  return cachedHandler
}

export async function handler(event: APIGatewayEvent, context: Context, callback: Callback): Promise<Handler> {
  // Set AWS config in global scope case we are running locally
  setAwsConfig()

  const server = cachedHandler ?? (await bootstrapServerless())
  return server(event, context, callback)
}
