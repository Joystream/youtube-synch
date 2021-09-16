import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";

const YOUTUBE_THUMBNAIL_QUALITY_TYPES = [
  "maxres", "standard", "high",
  "medium", "default"
] as const;

const selectHighestQualityThumbnail = (thumbnailsObject?: youtube_v3.Schema$ThumbnailDetails) => {
  if (!thumbnailsObject) {
    return null;
  }

  const availableQualityTypes = Object.keys(thumbnailsObject);

  for(let qualityType of YOUTUBE_THUMBNAIL_QUALITY_TYPES) {
    if(availableQualityTypes.includes(qualityType)) {
      return thumbnailsObject[qualityType];
    }
  }
};

const formatVideoData = (videos: youtube_v3.Schema$PlaylistItem[], youtubeChannelId: string) => {
  const formattedVideos = videos.map(video => {
    return {
      youtubeChannelId,
      title: video?.snippet?.title ?? "",
      description: video?.snippet?.description ?? "",
      thumbnail: selectHighestQualityThumbnail(video?.snippet?.thumbnails),
      publishedAt: video?.snippet?.publishedAt ?? "",
      videoId: video?.contentDetails?.videoId ?? "",
      isSynched: false
    };
  });

  // TODO:
  // Possible error if publishedAt isn't a valid date.
  return formattedVideos.sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
  );
};

export { formatVideoData, selectHighestQualityThumbnail };
