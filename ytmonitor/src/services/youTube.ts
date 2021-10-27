import { executeHttp } from './apiClient';
const baseUrl = process.env.YOUTUBE_API_URL;
const apiKey = process.env.YOUTUBE_API_KEY;

type DataBatch = {
  nextData: any[];
  nextPageToken: string;
};

type RequestData = {
  status: number;
  data: {
    nextPageToken?: string | null;
    items?: any[];
  }
}

const getNextDataBatch = async (
  queryData: Promise<RequestData>
) => {
  let batch: DataBatch = {
    nextData: [],
    nextPageToken: ""
  };

  let request = await queryData;

  const { data } = request;

  if (request.status === 200) {
    batch.nextData = data?.items ?? [];
    batch.nextPageToken = data?.nextPageToken;
  }

  return batch;
};

export const getAllYoutubeData = async (dataFunction: (id: string, token?: string) => Promise<RequestData>, id: string) => {
  let nextToken: string | undefined;
  const data = [];

  while (true) {
    const { nextData, nextPageToken } = await getNextDataBatch(dataFunction(id, nextToken));

    data.push(...nextData);

    if (!nextPageToken) {
      break;
    }

    nextToken = nextPageToken;
  }

  return data;
}

const withPageToken = (url: string, token?: string) => token ? url + `&pageToken=${token}` : url;

export const getChannels = async (username:string, nextPageToken?: string) => {
  const url = `${baseUrl}/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=${username}&key=${apiKey}`;
  const requestParams = {
    url: withPageToken(url, nextPageToken)
  }
  return await executeHttp('get', requestParams);
}

export const getPlaylists = async (channelId:string, nextPageToken?: string) => {
  const url = `${baseUrl}/playlists?part=snippet%2CcontentDetails&channelId=${channelId}&maxResults=25&key=${apiKey}`;
  const requestParams = {
    url: withPageToken(url, nextPageToken)
  }
  return await executeHttp('get', requestParams);
}

export const getVideos = async (playlistId:string, nextPageToken?: string) => {
  const url = `${baseUrl}/playlistItems?part=snippet%2CcontentDetails&maxResults=25&playlistId=${playlistId}&key=${apiKey}`;
  const requestParams = {
    url: withPageToken(url, nextPageToken)
  }
  return await executeHttp('get', requestParams);
}

export const getVideoData = async (videoId: string) => {
  const url = `${baseUrl}/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${videoId}&key=${apiKey}`;
  const requestParams = {
    url
  }
  return await executeHttp('get', requestParams);
}