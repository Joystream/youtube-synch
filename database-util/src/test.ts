import "reflect-metadata";
import { createConnection, EntityManager } from "typeorm";
import { User } from "./entity/User";
import { Channel } from "./entity/Channel";
import { Playlist } from "./entity/Playlist";
import { Video } from "./entity/Video";

const thumbnails = {
  thumDefault: "{}",
  thumMedium: "{}",
  thumHigh: "{}",
  thumStandard: "{}",
  thumMaxRes: "{}"
};

const createUser = (manager: EntityManager) => {
  return manager.create(User, {
    email: "user123@email.com",
    status: "New",
    ytUserName: "ilovecookies56"
  });
};

const createChannel = (manager: EntityManager, user: User) => {
  return manager.create(Channel, {
    user,
    ytChannelId: "1",
    title: "youtuber1",
    description: "I make youtube videos.",
    ...thumbnails,
    views: 1000,
    subscribers: 13,
    videoCount: 12
  });
};

const createPlaylist = (manager: EntityManager, channel: Channel) => {
  return manager.create(Playlist, {
    channel,
    ytPlaylistId: "1",
    title: "My cool playlist",
    description: "Favorite songs and videos",
    ...thumbnails
  });
};

const createVideo = (manager: EntityManager, playlist: Playlist) => {
  return manager.create(Video, {
    playlist,
    ytPlaylistId: "1",
    ytVideoId: "3000",
    ytResourceId: "120",
    ...thumbnails,
    ytUrl: "www.youtube.com/video?id=3000",
    title: "My cool video",
    description: "Me eating cookies :)",
    status: "New",
    bucket: "bucket",
    viewCount: 332,
    likeCount: 30,
    dislikeCount: 1,
    favoriteCount: 1,
    commentCount: 13,
    discoveryDate: "2021-10-12"
  });
};

const test = async () => {
  const connection = await createConnection();
  const { manager } = connection;

  // Creating each entity and searching for them based on their id.

  let user = createUser(manager);
  await manager.save(user);

  let channel = createChannel(manager, user);
  await manager.save(channel);

  let playlist = createPlaylist(manager, channel);
  await manager.save(playlist);

  let video = createVideo(manager, playlist);
  await manager.save(video);

  console.log("Created user:\n", await manager.findOne(User, user.id), "\n");
  console.log("Created channel:\n", await manager.findOne(Channel, channel.id), "\n");
  console.log("Created playlist:\n", await manager.findOne(Playlist, playlist.id), "\n");
  console.log("Created video:\n", await manager.findOne(Video, video.id), "\n");

  // Update entities and search for all entities of given type.
  
  await manager.update(User, { id: user.id }, { ytUserName: "idontlovecookiesanymore:(" });
  console.log("Loaded users after update:\n", await manager.find(User), "\n");

  await manager.update(Channel, { id: channel.id }, { description: "Joystream is better than Youtube. I'm moving there now ;)" });
  console.log("Loaded channels after update:\n", await manager.find(Channel), "\n");

  await manager.update(Playlist, { id: playlist.id }, { description: "Only my favorite songs." });
  console.log("Loaded playlists after update:\n", await manager.find(Playlist), "\n");

  await manager.update(Video, { id: video.id }, { description: "I don't like cookies anymore, watch my new videos for update!" });
  console.log("Loaded videos after update:\n", await manager.find(Video), "\n");

  // Remove all the created entities.

  await manager.remove([user, channel, playlist, video]);

  connection.close();
};

test();
