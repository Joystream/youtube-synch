import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import serverlessExpress from '@vendia/serverless-express'
import { Callback, Context, Handler, APIGatewayEvent } from 'aws-lambda'
import { ApiModule } from './api.module'
import { cryptoWaitReady } from '@polkadot/util-crypto'

let cachedHandler: Handler

async function bootstrapServerless() {
  // make sure WASM crypto module is ready
  await cryptoWaitReady()

  // create App
  const app = await NestFactory.create(ApiModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true })) // enable ValidationPipe
  app.enableCors({ allowedHeaders: '*', methods: '*', origin: '*' })
  await app.init()

  const expressApp = app.getHttpAdapter().getInstance()
  cachedHandler = serverlessExpress({ app: expressApp })
  return cachedHandler
}

export async function handler(event: APIGatewayEvent, context: Context, callback: Callback): Promise<Handler> {
  // Set AWS config in global scope case we are running locally
  // setAwsConfig()

  const server = cachedHandler ?? (await bootstrapServerless())
  return server(event, context, callback)
}
