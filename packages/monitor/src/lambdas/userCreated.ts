import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, MessageBus, SyncService } from '@joystream/ytube'
import { UserCreated, UserIngestionTriggered } from '@youtube-sync/domain'

export async function userCreatedHandler(event: TopicEvent) {
  const client = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  const userEvent = <UserCreated | UserIngestionTriggered>JSON.parse(event.Records[0].Sns.Message)
  await new SyncService(client, new MessageBus('eu-west-1')).ingestChannels(userEvent.user)
}
