import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';

export type UserIdAndChannel = { userId: string, channel: Channel };

@Injectable()
export class ChannelsService {
  constructor(@InjectRepository(Channel) private channelsRepository: Repository<Channel>) {}
  private readonly logger = new Logger(ChannelsService.name)

  async findAll(): Promise<Channel[]> {
    return this.channelsRepository.find();
  }

  async findOne(id: string): Promise<Channel> {
    return this.channelsRepository.findOne(id);
  }

  async create(userIdAndChannel: UserIdAndChannel): Promise<Channel> {
    const { userId, channel } = userIdAndChannel;
    return this.channelsRepository.save({
      user: {
        id: userId
      },
      ...channel
    });
  }

  async delete(id: string): Promise<void> {
    await this.channelsRepository.delete(id);
  }

  async update(id: string, channel: Channel): Promise<void> {
    await this.channelsRepository.update({ id }, channel);
  }
}
