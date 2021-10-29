import "reflect-metadata";
import { createConnection, EntityManager } from "typeorm";
import { User } from "./entity/User";
import { Channel } from "./entity/Channel";
import { Playlist } from "./entity/Playlist";
import { Video } from "./entity/Video";
import { UserRepository } from "./repository/User";
import { ChannelRepository } from "./repository/Channel";
import { PlaylistRepository } from "./repository/Playlist";
import { VideoRepository } from "./repository/Video";

const thumbnails = {
  thumDefault: "{}",
  thumMedium: "{}",
  thumHigh: "{}",
  thumStandard: "{}",
  thumMaxRes: "{}"
};

const createUser = (userRepository: UserRepository) => {
  return userRepository.create({
    email: "user123@email.com",
    status: "New",
    ytUserName: "ilovecookies56"
  });
};

const createChannel = (channelRepository: ChannelRepository, user: User) => {
  return channelRepository.create({
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

const createPlaylist = (playlistRepository: PlaylistRepository, channel: Channel) => {
  return playlistRepository.create({
    channel,
    ytPlaylistId: "1",
    title: "My cool playlist",
    description: "Favorite songs and videos",
    ...thumbnails
  });
};

const createVideo = (videoRepository: VideoRepository, playlist: Playlist) => {
  return videoRepository.create({
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
  const userRepository = connection.getCustomRepository(UserRepository);
  const channelRepository = connection.getCustomRepository(ChannelRepository);
  const playlistRepository = connection.getCustomRepository(PlaylistRepository);
  const videoRepository = connection.getCustomRepository(VideoRepository);

  // Creating each entity and searching for them based on their id.

  let user = createUser(userRepository);
  await userRepository.save(user);

  let channel = createChannel(channelRepository, user);
  await channelRepository.save(channel);

  let playlist = createPlaylist(playlistRepository, channel);
  await playlistRepository.save(playlist);

  let video = createVideo(videoRepository, playlist);
  await videoRepository.save(video);

  console.log("Created user:\n", await userRepository.findOne(user.id), "\n");
  console.log("Created channel:\n", await channelRepository.findOne(channel.id), "\n");
  console.log("Created playlist:\n", await playlistRepository.findOne(playlist.id), "\n");
  console.log("Created video:\n", await videoRepository.findOne(video.id), "\n");

  // Update entities and search for all entities of given type.
  
  await userRepository.update({ id: user.id }, { ytUserName: "idontlovecookiesanymore:(" });
  console.log("Loaded users after update:\n", await userRepository.find(), "\n");

  await channelRepository.update({ id: channel.id }, { description: "Joystream is better than Youtube. I'm moving there now ;)" });
  console.log("Loaded channels after update:\n", await channelRepository.find(), "\n");

  await playlistRepository.update({ id: playlist.id }, { description: "Only my favorite songs." });
  console.log("Loaded playlists after update:\n", await playlistRepository.find(), "\n");

  await videoRepository.update({ id: video.id }, { description: "I don't like cookies anymore, watch my new videos for update!" });
  console.log("Loaded videos after update:\n", await videoRepository.find(), "\n");

  // Remove all the created entities.

  await videoRepository.remove(video);
  await playlistRepository.remove(playlist);
  await channelRepository.remove(channel);
  await userRepository.remove(user);

  connection.close();
};

test();
