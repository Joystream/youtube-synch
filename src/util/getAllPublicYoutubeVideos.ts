import { youtube_v3 } from 'googleapis/build/src/apis/youtube/v3';

const MAX_VIDEO_AMOUNT = 50;

type videoBatchData = {
  videos: youtube_v3.Schema$PlaylistItem[];
  nextPageToken?: string | null;
}

const getNextVideoBatch = async (youtubeApi: youtube_v3.Youtube, playlistId: string, nextPageToken?: string) => {
  let batchData: videoBatchData = {
    videos: [],
    nextPageToken: "",
  };

  let request = await youtubeApi.playlistItems.list({
    part: ["snippet", "contentDetails", "status"],
    playlistId,
    maxResults: MAX_VIDEO_AMOUNT,
    pageToken: nextPageToken,
  });

  const { data } = request;

  if (request.status === 200) {
    batchData.videos = data?.items ?? [];
    batchData.nextPageToken = data?.nextPageToken;
  }

  return batchData;
};

const getAllPublicYoutubeVideos = async (youtubeApi: youtube_v3.Youtube, playlistId: string) => {
  let nextToken: string | undefined;
  const allPublicYoutubeVideos: youtube_v3.Schema$PlaylistItem[] = [];

  while (true) {
    const { videos, nextPageToken } = await getNextVideoBatch(
      youtubeApi,
      playlistId,
      nextToken
    );

    allPublicYoutubeVideos.push(...videos);

    if (!nextPageToken) {
      break;
    }

    nextToken = nextPageToken;
  }

  return allPublicYoutubeVideos;
};

export default getAllPublicYoutubeVideos;