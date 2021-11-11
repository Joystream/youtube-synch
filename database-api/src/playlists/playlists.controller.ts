import { Controller, Get, Param, ParseUUIDPipe, Post, Body, Delete, Put, ParseIntPipe } from '@nestjs/common';

import { PlaylistsService, ChannelIdAndPlaylist } from './playlists.service';
import { Playlist } from './playlist.entity';

@Controller("playlists")
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  public async findAll(): Promise<Playlist[]> {
    return this.playlistsService.findAll();
  }

  @Get(":id")
  public async find(@Param("id", ParseUUIDPipe) id: string): Promise<Playlist> {
    return this.playlistsService.findOne(id);
  }

  @Post()
  public async create(@Body() channelIdAndPlaylist: ChannelIdAndPlaylist): Promise<Playlist> {
    return this.playlistsService.create(channelIdAndPlaylist);
  }

  @Delete(':id')
  public async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.playlistsService.delete(id);
  }

  @Put(':id')
  public async update(@Param('id', ParseUUIDPipe) id: string, @Body() playlist: Playlist): Promise<void> {
    this.playlistsService.update(id, playlist);
  }
}
