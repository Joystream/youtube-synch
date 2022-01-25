import { EventRuleEvent } from '@pulumi/aws/cloudwatch';
import {
  Channel,
  IngestChannel,
  channelRepository,
  MessageBus,
} from '../../ytube/src';

export async function channelIngestionScheduler(event: EventRuleEvent) {
  const repo = channelRepository();
  const matchingFrequencies = getMatchingFrequencies(getEventMinutes(event));
  console.log(matchingFrequencies);
  // fetch all channels with frequency matching
  const rawChannels = await repo.scan('frequency').in([0]).exec();
  const channels = rawChannels.map((ch) => ch.toJSON() as Channel);
  console.log('Found channels', channels);
  await new MessageBus('eu-west-1').publishAll(
    channels.map((ch) => new IngestChannel(ch, Date.now())),
    'channelEvents'
  );
}

function getEventMinutes(event: EventRuleEvent) {
  const fireDateTime = new Date(event.time);
  const hours = fireDateTime.getUTCHours();
  const minutes = fireDateTime.getUTCMinutes();
  return 60 * hours + minutes;
}

function getMatchingFrequencies(minutes: number): number[] {
  const allFrequencies = [1, 10, 30, 60, 120, 180, 360, 720, 1440];
  return allFrequencies.filter((f) => f % minutes === 0);
}
