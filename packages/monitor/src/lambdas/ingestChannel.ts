import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, MessageBus, SyncService } from '@joystream/ytube'
import { IngestChannel } from '@youtube-sync/domain'

export async function ingestChannelHandler(event: TopicEvent) {
  console.log(event)
  const youtubeClient = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  const message: IngestChannel = JSON.parse(event.Records[0].Sns.Message)
  console.log(message)
  console.log('Got message: ', message)
  const events = await new SyncService(youtubeClient, new MessageBus('eu-west-1')).ingestAllVideos(message.channel, 100)
  console.log('Video events', events)
}
