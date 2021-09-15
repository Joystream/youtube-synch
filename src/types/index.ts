import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";

type Video = {
  youtubeChannelId: string;
  title: string;
  description: string;
  thumbnail: youtube_v3.Schema$Thumbnail | null | undefined;
  publishedAt: string;
  videoId: string;
  isSynched: boolean;
};

interface DBVideo extends Omit<Video, "videoId"> {
  SK: string;
}

type User = {
  joystreamChannelId: number;
  youtubeChannelId: string;
  youtubeUploadsPlaylistId: string;
  lastSynchedVideo: string;
};

interface DBUser extends User{
  SK: "profile";
}

export { Video, User, DBVideo, DBUser };
