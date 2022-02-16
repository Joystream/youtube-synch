import { youtube_v3 } from '@googleapis/youtube';
import { OAuth2Client } from 'google-auth-library';
import ytdl from 'ytdl-core';
import Schema$PlaylistItem = youtube_v3.Schema$PlaylistItem;
import { Channel, User, Video } from '@youtube-sync/domain';
import { Readable } from 'stream';
import { statsRepository } from '..';

export interface IYoutubeClient {
  getUserFromCode(code: string): Promise<User>;
  getChannels(user: User): Promise<Channel[]>;
  getVideos(channel: Channel, top: number): Promise<Video[]>;
  getAllVideos(channel: Channel, max: number): Promise<Video[]>;
  downloadVideo(videoUrl: string): Readable;
}
class YoutubeClient implements IYoutubeClient {
  private readonly _auth: OAuth2Client;
  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this._auth = new OAuth2Client({
      clientId,
      clientSecret,
      redirectUri,
    });
  }
  async getUserFromCode(code: string) {
    const tokenResponse = await this._auth.getToken(code);
    const tokenInfo = await this._auth.getTokenInfo(
      tokenResponse.tokens.access_token!
    );
    return new User(tokenInfo.sub!, tokenInfo.email!, tokenInfo.email!, tokenInfo.sub!,
      tokenResponse.tokens.access_token!, tokenResponse.tokens.refresh_token!, '', 0);
  }

  async getChannels(user: User): Promise<Channel[]> {
    this._auth.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });
    const youtube = new youtube_v3.Youtube({ auth: this._auth });
    const channels = await youtube.channels.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      mine: true,
    });

    return (
      channels.data.items?.map<Channel>(
        (item) =>
          <Channel>{
            id: item.id,
            description: item.snippet?.description,
            title: item.snippet?.title,
            userId: user.id,
            userAccessToken: user.accessToken,
            userRefreshToken: user.refreshToken,
            thumbnails: {
              default: item.snippet?.thumbnails?.default?.url,
              medium: item.snippet?.thumbnails?.medium?.url,
              high: item.snippet?.thumbnails?.high?.url,
              maxRes: item.snippet?.thumbnails?.maxres?.url,
              standard: item.snippet?.thumbnails?.standard?.url,
            },
            statistics: {
              viewCount: parseInt(item.statistics?.viewCount ?? '0'),
              subscriberCount: parseInt(
                item.statistics?.subscriberCount ?? '0'
              ),
              videoCount: parseInt(item.statistics?.videoCount ?? '0'),
              commentCount: parseInt(item.statistics?.commentCount ?? '0'),
            },
            uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads,
            frequency: 0,
            createdAt: Date.now(),
          }
      ) ?? []
    );
  }
  async getVideos(channel: Channel, top: number): Promise<Video[]> {
    this._auth.setCredentials({
      access_token: channel.userAccessToken,
      refresh_token: channel.userRefreshToken,
    });
    const youtube = new youtube_v3.Youtube({ auth: this._auth });
    const videos = await youtube.playlistItems.list({
      part: ['contentDetails', 'snippet', 'id', 'status'],
      playlistId: channel.uploadsPlaylistId,
      maxResults: top,
    });
    return this.mapVideos(videos.data.items ?? []);
  }
  async getAllVideos(channel: Channel, max = 500): Promise<Video[]> {
    this._auth.setCredentials({
      access_token: channel.userAccessToken,
      refresh_token: channel.userRefreshToken,
    });
    const youtube = new youtube_v3.Youtube({ auth: this._auth });
    let videos: Video[] = [];
    let continuation: string;
    do {
      const nextPage = await youtube.playlistItems.list({
        part: ['contentDetails', 'snippet', 'id', 'status'],
        playlistId: channel.uploadsPlaylistId,
        maxResults: 50,
      });
      continuation = nextPage.data.nextPageToken ?? '';
      const page = this.mapVideos(nextPage.data.items ?? []);
      videos = [...videos, ...page];
    } while (continuation && videos.length < max);
    return videos;
  }
  downloadVideo(videoUrl: string): Readable {
    return ytdl(videoUrl);
  }
  private mapVideos(items: Schema$PlaylistItem[]) {
    return items.map(
      (item) =>
        <Video>{
          id: item.id,
          description: item.snippet?.description,
          title: item.snippet?.title,
          channelId: item.snippet?.channelId,
          thumbnails: {
            high: item.snippet?.thumbnails?.high?.url,
            medium: item.snippet?.thumbnails?.medium?.url,
            maxRes: item.snippet?.thumbnails?.maxres?.url,
            standard: item.snippet?.thumbnails?.standard?.url,
            default: item.snippet?.thumbnails?.default?.url,
          },
          playlistId: item.snippet?.playlistId,
          url: `https://youtube.com/watch?v=${item.snippet?.resourceId?.videoId}`,
          resourceId: item.snippet?.resourceId?.videoId,
          createdAt: Date.now(),
          state: 'new',
        }
    );
  }
}

class QuotaTrackingClient implements IYoutubeClient {
  private _statsRepo;
  constructor(private decorated: IYoutubeClient) {
    this._statsRepo = statsRepository();
  }
  getUserFromCode(code: string): Promise<User> {
    return this.decorated.getUserFromCode(code);
  }
  getChannels(user: User): Promise<Channel[]> {
    return this.decorated
      .getChannels(user)
      .then((channels) => this.increaseUsedQuota(channels, 1));
  }
  getVideos(channel: Channel, top: number): Promise<Video[]> {
    return this.decorated
      .getVideos(channel, top)
      .then((videos) => this.increaseUsedQuota(videos, 1));
  }
  getAllVideos(channel: Channel, max: number): Promise<Video[]> {
    return this.decorated
      .getAllVideos(channel, max)
      .then((videos) => this.increaseUsedQuota(videos, videos.length % 50));
  }
  downloadVideo(videoUrl: string): Readable {
    return this.decorated.downloadVideo(videoUrl);
  }

  private async increaseUsedQuota<TValue>(result: TValue, increment: number) {
    const today = new Date();
    const timestamp = today.setUTCHours(0, 0, 0, 0);
    await this._statsRepo.update(
      { partition: 'stats', date: timestamp },
      { $ADD: { quotaUsed: increment } }
    );
    return result;
  }
}

export const YtClient = {
  create(
    clientId: string,
    clientSecret: string,
    redirectUri: string
  ): IYoutubeClient {
    return new QuotaTrackingClient(
      new YoutubeClient(clientId, clientSecret, redirectUri)
    );
  },
};
