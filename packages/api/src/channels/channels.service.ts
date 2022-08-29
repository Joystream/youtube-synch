import { ChannelsRepository } from '@joystream/ytube'
import { Injectable } from '@nestjs/common'
import { Channel } from '@youtube-sync/domain'

@Injectable()
export class ChannelsService {
  constructor(private channelsRepository: ChannelsRepository) {}

  /**
   *
   * @param id
   * @returns Returns channel by ID
   */
  async get(id: string): Promise<Channel> {
    // const result = await this.channelsRepository.query('userId', (q) => q.eq(userId).and().filter('id').eq(id))
    const result = await this.channelsRepository.get(id)
    return result
  }

  /**
   * @param userId
   * @returns List of Channels for given user
   */
  async getAll(userId: string): Promise<Channel[]> {
    return await this.channelsRepository.query({ userId }, (q) => q)
  }

  async getAllWithFrequency(frequency: number): Promise<Channel[]> {
    return await this.channelsRepository.scan('frequency', (s) => s.in([frequency]))
  }

  /**
   *
   * @param channel
   * @returns Updated channel
   */
  async update(channel: Channel): Promise<Channel> {
    return await this.channelsRepository.save(channel)
  }
}
