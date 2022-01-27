import { TopicEvent } from '@pulumi/aws/sns';
import {
  YtClient,
  UserCreated,
  MessageBus,
  UserIngestionTriggered,
  SyncService,
} from '../../ytube/src';

export async function userCreatedHandler(event: TopicEvent) {
  const client = YtClient.create(
    '79131856482-fo4akvhmeokn24dvfo83v61g03c6k7o0.apps.googleusercontent.com',
    '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',
    'http://localhost:3000'
  );
  const userEvent = <UserCreated | UserIngestionTriggered>(
    JSON.parse(event.Records[0].Sns.Message)
  );
  await new SyncService(client, new MessageBus('eu-west-1')).ingestChannels(
    userEvent.user
  );
}
