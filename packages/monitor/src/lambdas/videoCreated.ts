import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, videoStateRepository, SyncService, MessageBus } from '@joystream/ytube'
import { getConfig, setAwsConfig, VideoEvent } from '@youtube-sync/domain'

export async function videoCreatedHandler(event: TopicEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  const videoCreated: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  if (videoCreated.subject !== 'New')
    // only handle video when it was created
    return
  console.log('New video', videoCreated)

  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = getConfig()
  const youtubeClient = YtClient.create(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)

  await new SyncService(youtubeClient, new MessageBus()).uploadVideo(videoCreated.channelId, videoCreated.videoId)
}

export async function videoStateLogger(event: TopicEvent) {
  const videoEvent: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  await videoStateRepository().update(videoEvent)
}
