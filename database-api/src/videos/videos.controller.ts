import { Controller, Get, Param, ParseUUIDPipe, Post, Body, Delete, Put, ParseIntPipe } from '@nestjs/common';

import { VideosService, PlaylistIdAndVideo } from './videos.service';
import { Video } from './video.entity';

@Controller("videos")
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  public async findAll(): Promise<Video[]> {
    return this.videosService.findAll();
  }

  @Get(":id")
  public async find(@Param("id", ParseUUIDPipe) id: string): Promise<Video> {
    return this.videosService.findOne(id);
  }

  @Post()
  public async create(@Body() playlistIdAndVideo: PlaylistIdAndVideo): Promise<Video> {
    return this.videosService.create(playlistIdAndVideo);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.videosService.delete(id);
  }

  @Put(':id')
  public async update(@Param('id', ParseUUIDPipe) id: string, @Body() video: Video): Promise<void> {
    this.videosService.update(id, video);
  }
}
