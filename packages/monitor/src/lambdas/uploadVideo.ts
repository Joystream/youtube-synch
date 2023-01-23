import { SnsClient, SyncService, YtClient } from '@joystream/ytube'
import { TopicEvent } from '@pulumi/aws/sns'
import { VideoEvent, getConfig, setAwsConfig } from '@youtube-sync/domain'
import { JoystreamClient, Uploader } from '@youtube-sync/joy-api'

export async function uploadVideoHandler(event: TopicEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  const videoCreated: VideoEvent = JSON.parse(event.Records[0].Sns.Message)
  if (videoCreated.subject !== 'VideoCreated' && videoCreated.subject !== 'UploadFailed')
    // only handle upload after video has been created or upload failed previously
    return
  console.log('New video', videoCreated)

  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL } = getConfig()
  const youtubeClient = YtClient.create(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)
  const joystreamClient = new JoystreamClient(JOYSTREAM_WEBSOCKET_RPC, JOYSTREAM_QUERY_NODE_URL)
  const storageClient = new Uploader(JOYSTREAM_QUERY_NODE_URL)

  await new SyncService(youtubeClient, joystreamClient, storageClient, new SnsClient()).uploadVideo(
    videoCreated.channelId,
    videoCreated.videoId
  )
}
