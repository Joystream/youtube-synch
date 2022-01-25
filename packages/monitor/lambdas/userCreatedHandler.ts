import { TopicEvent } from '@pulumi/aws/sns';
import {
  Channel,
  IngestChannel,
  channelRepository,
  YoutubeClient,
  UserCreated,
  MessageBus,
} from '../../ytube/src';

export async function userCreatedHandler(event: TopicEvent) {
  const channelRepo = channelRepository();
  const client = new YoutubeClient(
    '79131856482-fo4akvhmeokn24dvfo83v61g03c6k7o0.apps.googleusercontent.com',
    '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',
    'http://localhost:3000'
  );
  const userCreated = <UserCreated>JSON.parse(event.Records[0].Sns.Message);
  const channels: Channel[] = await client.getChannels(userCreated.user);
  await channelRepo.batchPut(channels);
  // TODO: calculate frequencies
  new MessageBus('eu-west-1').publishAll(
    channels.map((ch) => new IngestChannel(ch, Date.now())),
    'ingestChannel'
  );
}
