import { EventRuleEvent } from '@pulumi/aws/cloudwatch'
import { MessageBus, SyncService, YtClient } from '@joystream/ytube'
import { getConfig, setAwsConfig } from '@youtube-sync/domain'
import { JoystreamClient } from '@youtube-sync/joy-api'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Uploader } from 'packages/joy-api/storage/uploader'

export async function ingestionScheduler(event: EventRuleEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  console.log('event: ', event)

  // const date = new Date(event.time)
  // const frequencies = getMatchingFrequenciesForDate(date)
  // if (frequencies.length === 0) return

  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL } = getConfig()
  const youtubeClient = YtClient.create(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)
  const joystreamClient = new JoystreamClient(JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL)
  const storageClient = new Uploader(JOYSTREAM_QUERY_NODE_URL)

  await new SyncService(youtubeClient, joystreamClient, storageClient, new MessageBus()).startIngestionFor([0])
}
