import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, MessageBus, SyncService } from '@joystream/ytube'
import { IngestChannel } from '@youtube-sync/domain'
import { config } from 'aws-sdk'

export async function ingestChannelHandler(event: TopicEvent) {
  config.update({
    region: process.env.AWS_REGION,
    dynamodb: { endpoint: process.env.AWS_ENDPOINT },
  })
  const youtubeClient = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  const message: IngestChannel = JSON.parse(event.Records[0].Sns.Message)
  console.log('Got message: ', message)
  const events = await new SyncService(youtubeClient, new MessageBus(process.env.AWS_REGION)).ingestAllVideos(
    message.channel,
    100
  )
  console.log('Video events', events)
}
