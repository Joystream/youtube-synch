import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, MessageBus, SyncService } from '@joystream/ytube'
import { getConfig, setAwsConfig, UserCreated, UserIngestionTriggered } from '@youtube-sync/domain'

export async function userCreatedHandler(event: TopicEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = getConfig()
  const client = YtClient.create(YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)

  const userEvent = <UserCreated | UserIngestionTriggered>JSON.parse(event.Records[0].Sns.Message)
  await new SyncService(client, new MessageBus()).ingestChannels(userEvent.user)
}
