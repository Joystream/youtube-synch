import { Injectable } from '@nestjs/common';
import {
  channelRepository,
  Channel,
  User,
  YtClient,
  mapTo,
  IYoutubeClient,
} from '@joystream/ytube';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChannelsService {
  private youtube: IYoutubeClient;
  constructor(private configService: ConfigService) {
    this.youtube = YtClient.create(
      configService.get<string>('YOUTUBE_CLIENT_ID'),
      configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      configService.get<string>('YOUTUBE_REDIRECT_URI')
    );
  }
  async ingest(user: User): Promise<Channel[]> {
    const channels = await this.youtube.getChannels(user);
    await channelRepository().batchPut(channels);
    return channels;
  }

  async get(userId: string, id: string): Promise<Channel> {
    const channel = await channelRepository()
      .query('userId')
      .eq(userId)
      .and()
      .filter('id')
      .eq(id)
      .exec();
    return mapTo<Channel>(channel[0]);
  }
  async getAll(userId: string): Promise<Channel[]> {
    const channels = await channelRepository()
      .query('userId')
      .eq(userId)
      .exec();
    return channels.map((c) => mapTo<Channel>(c));
  }
  async getAllWithFrequency(frequency: number): Promise<Channel[]> {
    const doc = await channelRepository()
      .scan('frequency')
      .in([frequency])
      .exec();
    return doc.map((d) => mapTo<Channel>(d));
  }
  async update(channel: Channel): Promise<Channel> {
    const updated = await channelRepository().update(channel);
    return mapTo<Channel>(updated);
  }
}
