import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, videoStateRepository, SyncService, MessageBus } from '@joystream/ytube'
import { VideoEvent } from '@youtube-sync/domain'
import { config } from 'aws-sdk'

export async function videoCreatedHandler(event: TopicEvent) {
  const videoCreated: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  if (videoCreated.subject !== 'New')
    // only handle video when it was created
    return
  console.log('New video', videoCreated)
  config.update({
    region: process.env.AWS_REGION,
    dynamodb: { endpoint: process.env.AWS_ENDPOINT },
  })
  const youtubeClient = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  await new SyncService(youtubeClient, new MessageBus(process.env.AWS_REGION)).uploadVideo(
    videoCreated.channelId,
    videoCreated.videoId
  )
}

export async function videoStateLogger(event: TopicEvent) {
  const videoEvent: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  await videoStateRepository().update(videoEvent)
}
