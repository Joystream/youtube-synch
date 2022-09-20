import { TopicEvent } from '@pulumi/aws/sns'
import { YtClient, MessageBus, SyncService } from '@joystream/ytube'
import { UserCreated, UserIngestionTriggered } from '@youtube-sync/domain'
import { config } from 'aws-sdk'

export async function userCreatedHandler(event: TopicEvent) {
  config.update({
    region: process.env.AWS_REGION,
    dynamodb: { endpoint: process.env.AWS_ENDPOINT },
  })
  const client = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  const userEvent = <UserCreated | UserIngestionTriggered>JSON.parse(event.Records[0].Sns.Message)
  await new SyncService(client, new MessageBus(process.env.AWS_REGION)).ingestChannels(userEvent.user)
}
