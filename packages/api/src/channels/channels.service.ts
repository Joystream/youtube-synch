import { Injectable } from '@nestjs/common'
import { Channel, DomainError, Result } from '@youtube-sync/domain'
import { ChannelsRepository } from '@joystream/ytube'

@Injectable()
export class ChannelsService {
  constructor(private channelsRepo: ChannelsRepository) {}

  async get(userId: string, id: string): Promise<Result<Channel, DomainError>> {
    const result = await this.channelsRepo.query('userId', (q) =>
      q.eq(userId).and().filter('id').eq(id)
    )
    return result.map((c) => c[0])
  }

  async getAll(userId: string): Promise<Result<Channel[], DomainError>> {
    return await this.channelsRepo.query({ userId }, (q) => q)
  }

  async getAllWithFrequency(
    frequency: number
  ): Promise<Result<Channel[], DomainError>> {
    return await this.channelsRepo.scan('frequency', (s) => s.in([frequency]))
  }

  async update(channel: Channel): Promise<Result<Channel, DomainError>> {
    return await this.channelsRepo.save(channel, channel.userId)
  }
}
