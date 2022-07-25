import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, MessageBus, SyncService } from '@joystream/ytube'
import { IngestChannel } from '@youtube-sync/domain'

export async function ingestChannelHandler(event: TopicEvent) {
  console.log(event)
  const youtubeClient = YtClient.create(
    '79131856482-fo4akvhmeokn24dvfo83v61g03c6k7o0.apps.googleusercontent.com',
    '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',
    'http://localhost:3000'
  )
  const message: IngestChannel = JSON.parse(event.Records[0].Sns.Message)
  console.log(message)
  console.log('Got message: ', message)
  const events = await new SyncService(
    youtubeClient,
    new MessageBus('eu-west-1')
  ).ingestAllVideos(message.channel, 100)
  console.log('Video events', events)
}
