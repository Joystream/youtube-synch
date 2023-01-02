import express from 'express'
import { VideoStateKeeper } from './videoStateKeeper'
import cors from 'cors'
import { SnsClient, SubscriptionConfirmationRequest, SyncService, YtClient } from '@joystream/ytube'
import { VideoEvent, getConfig } from '@youtube-sync/domain'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Logger } from 'packages/joy-api/src/logger'
import { JoystreamClient } from '@youtube-sync/joy-api'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Uploader } from 'packages/joy-api/storage/uploader'

export async function createNewVideoSubscriptionApp(sns: SnsClient): Promise<express.Application> {
  const {
    YOUTUBE_CLIENT_ID: ytClientId,
    YOUTUBE_CLIENT_SECRET: ytClientSecret,
    JOYSTREAM_WEBSOCKET_RPC: rpc,
    JOYSTREAM_QUERY_NODE_URL: qnUrl,
  } = getConfig()
  const youtubeClient = YtClient.create(ytClientId, ytClientSecret)
  const joystreamClient = new JoystreamClient(rpc, qnUrl)
  const storageClient = new Uploader(qnUrl)

  const syncService = new SyncService(youtubeClient, joystreamClient, storageClient, sns)
  const queue = new VideoStateKeeper(syncService)

  const app = express()
  app.use(cors())
  app.use(express.text())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    Logger.info('Health check')
    res.status(200).send('OK')
  })

  app.post('/queue-new-video', async (req, res) => {
    // confirm subscription if it hasn't been confirmed yet
    if (req.get('x-amz-sns-message-type') == 'SubscriptionConfirmation') {
      const { Token } = JSON.parse(req.body) as SubscriptionConfirmationRequest
      sns.confirmSubscription('createVideoEvents', Token)
      return
    }

    try {
      const processVideo: VideoEvent = JSON.parse(JSON.parse(req.body).Message)
      await queue.processNewVideo(processVideo)
    } catch (e) {
      const message = e instanceof Error ? e.message : e
      Logger.error(message)
      res.status(400).send(message)
    }
  })

  return app
}
