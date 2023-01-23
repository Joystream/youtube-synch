import { SnsClient, SyncService, YtClient } from '@joystream/ytube'
import { TopicEvent } from '@pulumi/aws/sns'
import { IngestChannel, getConfig, setAwsConfig } from '@youtube-sync/domain'
import { JoystreamClient, Uploader } from '@youtube-sync/joy-api'

export async function ingestChannelHandler(event: TopicEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  const message: IngestChannel = JSON.parse(event.Records[0].Sns.Message)
  console.log('Got message: ', message)

  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL } = getConfig()
  const youtubeClient = YtClient.create(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)
  const joystreamClient = new JoystreamClient(JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL)
  const storageClient = new Uploader(JOYSTREAM_QUERY_NODE_URL)

  const events = await new SyncService(youtubeClient, joystreamClient, storageClient, new SnsClient()).ingestAllVideos(
    message.channel,
    100
  )
  console.log('Video events', events)
}
