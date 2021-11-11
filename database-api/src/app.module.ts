import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
 
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [ TypeOrmModule.forRoot(), UsersModule, ChannelsModule, PlaylistsModule, VideosModule ],
})
export class AppModule { constructor(private connection: Connection) {} }
