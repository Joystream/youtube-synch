import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Channel,
  Video,
  YoutubeClient,
  videoRepository,
  mapTo,
} from '@joystream/ytube';

@Injectable()
export class VideosService {
  private youtube: YoutubeClient;
  constructor(private configService: ConfigService) {
    this.youtube = new YoutubeClient(
      configService.get<string>('YOUTUBE_CLIENT_ID'),
      configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      configService.get<string>('YOUTUBE_REDIRECT_URI')
    );
  }

  async ingest(channel: Channel): Promise<Video[]> {
    const videos = await this.youtube.getAllVideos(channel);
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
