import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Channel,
  Video,
  YtClient,
  videoRepository,
  mapTo,
  IYoutubeClient,
} from '@joystream/ytube';

@Injectable()
export class VideosService {
  private youtube: IYoutubeClient;
  constructor(private configService: ConfigService) {
    this.youtube = YtClient.create(
      configService.get<string>('YOUTUBE_CLIENT_ID'),
      configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      configService.get<string>('YOUTUBE_REDIRECT_URI')
    );
  }

  async ingest(channel: Channel): Promise<Video[]> {
    const videos = await this.youtube.getAllVideos(channel, 100);
    await videoRepository().batchPut(videos);
    return videos;
  }
  async getVideos(channel: Channel): Promise<Video[]> {
    return await videoRepository()
      .query('channelId')
      .eq(channel.id)
      .exec()
      .then((docs) => docs.map((d) => mapTo<Video>(d)));
  }
}
