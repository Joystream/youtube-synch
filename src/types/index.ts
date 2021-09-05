import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";

type Video = {
  title: string;
  description: string;
  thumbnail: youtube_v3.Schema$Thumbnail | null | undefined;
  publishedAt: string;
  videoId: string;
};

type User = {
  youtubeChannelId: string;
  youtubeUploadsPlaylistId: string;
  videos: Array<Video>;
};

export { Video, User };
