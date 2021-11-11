import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { getChannels, getPlaylists, getVideos, getAllYoutubeData, getVideoData } from '../../services/youTube';

const monitor: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const channels = await getAllYoutubeData(getChannels, event.body.username)
  const playlists = await getAllYoutubeData(getPlaylists, event.body.channelId);
  const videos = await getAllYoutubeData(getVideos, event.body.playlistId);
  const videoData = (await getVideoData(videos[0].contentDetails.videoId)).data;
  return formatJSONResponse({
    channels
  });
}

export const main = middyfy(monitor);
