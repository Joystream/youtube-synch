import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';

export type PlaylistIdAndVideo = { playlistId: string, video: Video };

@Injectable()
export class VideosService {
  constructor(@InjectRepository(Video) private videosRepository: Repository<Video>) {}
  private readonly logger = new Logger(VideosService.name)

  async findAll(): Promise<Video[]> {
    return this.videosRepository.find();
  }

  async findOne(id: string): Promise<Video> {
    return this.videosRepository.findOne(id);
  }

  async create(playlistIdAndVideo: PlaylistIdAndVideo): Promise<Video> {
    const { playlistId, video } = playlistIdAndVideo;
    return this.videosRepository.save({
      playlistId: {
        id: playlistId
      },
      ...video
    });
  }

  async delete(id: string): Promise<void> {
    await this.videosRepository.delete(id);
  }

  async update(id: string, video: Video): Promise<void> {
    await this.videosRepository.update({ id }, video);
  }
}
