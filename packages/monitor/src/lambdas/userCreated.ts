import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, MessageBus, SyncService } from '@joystream/ytube'
import { setAwsConfig, UserCreated, UserIngestionTriggered } from '@youtube-sync/domain'

export async function userCreatedHandler(event: TopicEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  const client = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  const userEvent = <UserCreated | UserIngestionTriggered>JSON.parse(event.Records[0].Sns.Message)
  await new SyncService(client, new MessageBus()).ingestChannels(userEvent.user)
}
