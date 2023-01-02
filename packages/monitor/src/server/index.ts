// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Logger } from 'packages/joy-api/src/logger'
import { createNewVideoSubscriptionApp } from './videoProcessingService'
import { getConfig, setAwsConfig } from '@youtube-sync/domain'
import { SnsClient } from '@joystream/ytube'

// Set AWS config in case we are running locally
setAwsConfig()

async function bootstrap() {
  const sns = new SnsClient()
  const port = parseInt(getConfig().VIDEO_PROCESSING_SERVER_PORT) || 4000
  const url = getConfig().VIDEO_PROCESSING_SERVER_URL || 'http://44.192.15.141'
  const processorStateApp = await createNewVideoSubscriptionApp(sns)
  processorStateApp.listen(port, async () => {
    Logger.info(`Started listening on port ${port}`)

    // Create processing server subscription to SNS new video events
    await sns.subscribe('createVideoEvents', new URL(`${url}:${port}/queue-new-video`))
  })
}

bootstrap().catch((error: Error) => {
  Logger.error(error)
  if (error.stack) {
    Logger.error(error.stack.split('\n'))
  }
  process.exit(1)
})
