import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, videoStateRepository, SyncService, SnsClient } from '@joystream/ytube'
import { getConfig, setAwsConfig, VideoEvent } from '@youtube-sync/domain'
import { JoystreamClient } from '@youtube-sync/joy-api'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Uploader } from 'packages/joy-api/storage/uploader'

export async function createVideoHandler(event: TopicEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  const createVideo: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  if (createVideo.subject !== 'New' && createVideo.subject !== 'VideoCreationFailed') {
    return
  }

  console.log('New video', createVideo)

  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL } = getConfig()
  const youtubeClient = YtClient.create(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)
  const joystreamClient = new JoystreamClient(JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL)
  const storageClient = new Uploader(JOYSTREAM_QUERY_NODE_URL)

  await new SyncService(youtubeClient, joystreamClient, storageClient, new SnsClient()).createVideo(
    createVideo.channelId,
    createVideo.videoId
  )
}

export async function videoStateLogger(event: TopicEvent) {
  const videoEvent: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  await videoStateRepository().update(videoEvent)
}
