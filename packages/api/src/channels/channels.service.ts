import { Injectable } from '@nestjs/common';
import {  Channel, DomainError, Result } from '@youtube-sync/domain' 
import {
  YtClient,
  IYoutubeClient,
  ChannelsRepository,
} from '@joystream/ytube';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChannelsService {
  private youtube: IYoutubeClient;
  private channelsRespo: ChannelsRepository = new ChannelsRepository()
  constructor(private configService: ConfigService) {
    this.youtube = YtClient.create(
      configService.get<string>('YOUTUBE_CLIENT_ID'),
      configService.get<string>('YOUTUBE_CLIENT_SECRET'),
      configService.get<string>('YOUTUBE_REDIRECT_URI')
    );
  }

  async get(userId: string, id: string): Promise<Result<Channel, DomainError>> {
    const result = await this.channelsRespo.query('userId', q => q.eq(userId)
      .and()
      .filter('id')
      .eq(id))
    return result.map(c => c[0])
  }
  async getAll(userId: string): Promise<Result<Channel[], DomainError>> {
    return await this.channelsRespo.query('userId', q => q.eq(userId))
  }
  async getAllWithFrequency(frequency: number): Promise<Result<Channel[], DomainError>> {
    return  await this.channelsRespo.scan('frequency', s => s.in([frequency]))
  }
  async update(channel: Channel): Promise<Result<Channel, DomainError>> {
    return await this.channelsRespo.save(channel, channel.userId)
  }
}
