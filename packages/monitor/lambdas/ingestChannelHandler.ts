import { TopicEvent } from '@pulumi/aws/sns';
import {
  IngestChannel,
  VideoEvent,
  YoutubeClient,
  videoRepository,
  Video,
  MessageBus,
} from '../../ytube/src';

export async function ingestChannelHandler(event: TopicEvent) {
  const videoRepo = videoRepository();
  const youtubeClient = new YoutubeClient(
    '79131856482-fo4akvhmeokn24dvfo83v61g03c6k7o0.apps.googleusercontent.com',
    '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',
    'http://localhost:3000'
  );
  const message: IngestChannel = JSON.parse(event.Records[0].Sns.Message);
  console.log('Got message: ', message);
  const videos: Video[] = await youtubeClient.getVideos(message.channel, 50);
  console.log('Got videos', videos);
  await videoRepo.batchPut(videos);
  const events = videos.map(
    (v) => new VideoEvent('new', v.id, v.channelId, Date.now())
  );
  await new MessageBus('eu-west-1').publishAll(events, 'videoEvents');
}
