import "reflect-metadata";
import { createConnection } from "typeorm";
import { Channel } from "./entity/Channel";
import { User } from "./entity/User";
import { Playlist } from "./entity/Playlist";
import { Video } from "./entity/Video";

export { createConnection, Channel, User, Playlist, Video };
