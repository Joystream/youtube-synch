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
  async get(joystreamChannelId: number): Promise<Channel> {
    const [result] = await this.channelsRepository.scan('id', (q) =>
      q.filter('joystreamChannelId').eq(joystreamChannelId)
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

  /**
   * @param count Number of record to retrieve
   * @returns List of `n` recent verified channels
   */
  async getRecent(count: number): Promise<Channel[]> {
    // TODO: Use query using phantomKey-createdAt-index instead of
    // TODO: scan operation here, and figure out why it's not working now

    const allChannels = await this.channelsRepository.scan('id', (s) => s)
    return allChannels.sort((a, b) => b.createdAt - a.createdAt).slice(0, count)
  }

  async getAllWithFrequency(frequency: number): Promise<Channel[]> {
    return await this.channelsRepository.scan('frequency', (s) => s.in([frequency]))
  }

  /**
   *
   * @param channel
   * @returns Updated channel
   */
  async save(channel: Channel): Promise<Channel> {
    return await this.channelsRepository.save(channel)
  }
}
