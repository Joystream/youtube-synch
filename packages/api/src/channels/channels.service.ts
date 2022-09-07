import { ChannelsRepository } from '@joystream/ytube'
import { Injectable } from '@nestjs/common'
import { Channel } from '@youtube-sync/domain'

@Injectable()
export class ChannelsService {
  constructor(private channelsRepository: ChannelsRepository) {}

  /**
   * @param joystreamChannelId
   * @returns Returns channel by joystreamChannelId
   */
  async get(joystreamChannelId: string): Promise<Channel> {
    const [result] = await this.channelsRepository.scan('id', (q) =>
      q.filter('joystreamChannelId').eq(Number(joystreamChannelId))
    )
    if (!result) {
      throw new Error(`Could not find channel with id ${joystreamChannelId}`)
    }
    return result
  }

  /**
   * @param userId
   * @returns Returns channel by userId
   */
  async getByUserId(userId: string): Promise<Channel> {
    const [result] = await this.channelsRepository.query('userId', (q) => q.eq(userId))
    if (!result) {
      throw new Error(`Could not find user with id ${userId}`)
    }
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
