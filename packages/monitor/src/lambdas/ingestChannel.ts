import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, MessageBus, SyncService } from '@joystream/ytube'
import { IngestChannel, setAwsConfig } from '@youtube-sync/domain'
import { getConfig } from '@youtube-sync/domain'

export async function ingestChannelHandler(event: TopicEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = getConfig()
  const youtubeClient = YtClient.create(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)

  const message: IngestChannel = JSON.parse(event.Records[0].Sns.Message)
  console.log('Got message: ', message)
  const events = await new SyncService(youtubeClient, new MessageBus()).ingestAllVideos(message.channel, 100)
  console.log('Video events', events)
}
