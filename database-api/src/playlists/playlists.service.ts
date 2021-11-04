import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlist } from './playlist.entity';

export type ChannelIdAndPlaylist = { channelId: string, playlist: Playlist };

@Injectable()
export class PlaylistsService {
  constructor(@InjectRepository(Playlist) private playlistsRepository: Repository<Playlist>) {}
  private readonly logger = new Logger(PlaylistsService.name)

  async findAll(): Promise<Playlist[]> {
    return this.playlistsRepository.find();
  }

  async findOne(id: string): Promise<Playlist> {
    return this.playlistsRepository.findOne(id);
  }

  async create(channelIdAndPlaylist: ChannelIdAndPlaylist): Promise<Playlist> {
    const { channelId, playlist } = channelIdAndPlaylist;
    return this.playlistsRepository.save({
      channel: {
        id: channelId
      },
      ...playlist
    });
  }

  async delete(id: string): Promise<void> {
    await this.playlistsRepository.delete(id);
  }

  async update(id: string, playlist: Playlist): Promise<void> {
    await this.playlistsRepository.update({ id }, playlist);
  }
}
