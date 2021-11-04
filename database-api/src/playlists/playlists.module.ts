import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist } from './playlist.entity';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Playlist])],
  providers: [PlaylistsService],
  controllers: [PlaylistsController],
})
export class PlaylistsModule {}