import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, videoStateRepository, SyncService, MessageBus } from '@joystream/ytube'
import { VideoEvent } from '@youtube-sync/domain'

export async function videoCreatedHandler(event: TopicEvent) {
  const videoCreated: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  if (videoCreated.subject !== 'new')
    // only handle video when it was created
    return
  console.log('New video', videoCreated)
  const youtube = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  await new SyncService(youtube, new MessageBus('eu-west-1')).uploadVideo(videoCreated.channelId, videoCreated.videoId)
}

export async function videoStateLogger(event: TopicEvent) {
  const videoEvent: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  await videoStateRepository().update(videoEvent)
}
