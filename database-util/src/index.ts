import "reflect-metadata";
import { createConnection } from "typeorm";
import { Channel } from "./entity/Channel";
import { User } from "./entity/User";
import { Playlist } from "./entity/Playlist";
import { Video } from "./entity/Video";
import { ChannelRepository } from "./repository/Channel";
import { PlaylistRepository } from "./repository/Playlist";
import { UserRepository } from "./repository/User";
import { VideoRepository } from "./repository/Video";

export {
  createConnection,
  Channel,
  User,
  Playlist,
  Video,
  ChannelRepository,
  PlaylistRepository,
  UserRepository,
  VideoRepository
};
