import { youtube_v3 } from '@googleapis/youtube'
import { OAuth2Client, TokenInfo } from 'google-auth-library'
import ytdl from 'ytdl-core'
import Schema$PlaylistItem = youtube_v3.Schema$PlaylistItem
import Schema$Channel = youtube_v3.Schema$Channel
import { Channel, DomainError, Result, User, Video, YoutubeAuthorizationFailed } from '@youtube-sync/domain'
import { Readable } from 'stream'
import { statsRepository } from '..'
import R from 'ramda'
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'

export interface IYoutubeClient {
  getUserFromCode(code: string): Promise<Result<User, DomainError>>
  getChannels(user: User): Promise<Result<Channel[], DomainError>>
  getVideos(channel: Channel, top: number): Promise<Result<Video[], DomainError>>
  getAllVideos(channel: Channel, max: number): Promise<Result<Video[], DomainError>>
  downloadVideo(videoUrl: string): Readable
}
class YoutubeClient implements IYoutubeClient {
  constructor(private clientId: string, private clientSecret: string, private redirectUri: string) {}
  async getUserFromCode(code: string) {
    const createUserFlow = R.pipe(
      (code: string) =>
        Result.tryAsync(
          () => this.getAuth().getToken(code),
          new YoutubeAuthorizationFailed('Failed to retrieve token using code')
        ),
      R.andThen((r) =>
        Result.tryBind(
          r,
          (tokenResponse) =>
            this.getAuth()
              .getTokenInfo(tokenResponse.tokens.access_token)
              .then((tokenInfo) => [tokenInfo, tokenResponse] as [TokenInfo, GetTokenResponse]),
          new YoutubeAuthorizationFailed('Failed to get token info')
        )
      ),
      R.andThen((tokensResult) =>
        tokensResult.map(
          ([tokenInfo, tokenResponse]) =>
            new User(
              tokenInfo.sub,
              tokenInfo.email,
              tokenInfo.email,
              tokenInfo.sub,
              tokenResponse.tokens.access_token,
              tokenResponse.tokens.refresh_token,
              '',
              0
            )
        )
      ),
      R.otherwise((err) => Result.Error<User, DomainError>(new YoutubeAuthorizationFailed(err.message)))
    )
    return createUserFlow(code)
  }

  getChannels = async (user: User) => {
    const result = await R.pipe(
      (u: User) => this.getYoutube(u.accessToken, u.refreshToken),
      (yt) =>
        Result.tryAsync(
          () =>
            yt.channels.list({
              part: ['snippet', 'contentDetails', 'statistics'],
              mine: true,
            }),
          new DomainError('Failed to retrieve channels list for')
        ),
      R.andThen((channelsResult) => channelsResult.map((c) => this.mapChannels(user, c.data.items ?? [])))
    )(user)
    return result
  }
  getVideos = (channel: Channel, top: number) => {
    return R.pipe(
      () => this.getYoutube(channel.userAccessToken, channel.userRefreshToken),
      (yt) =>
        Result.tryAsync(
          () => this.iterateVideos(yt, channel, top),
          new DomainError(`Failed to fetch videos for channel ${channel.title}`)
        )
    )()
  }
  getAllVideos = (channel: Channel, max = 500) => {
    return R.pipe(
      () => this.getYoutube(channel.userAccessToken, channel.userRefreshToken),
      (yt) =>
        Result.tryAsync(
          () => this.iterateVideos(yt, channel, max),
          new DomainError(`Failed to fetch videos for channel ${channel.title}`)
        )
    )()
  }
  downloadVideo = (videoUrl: string): Readable => {
    return ytdl(videoUrl)
  }
  private async iterateVideos(youtube: youtube_v3.Youtube, channel: Channel, max: number) {
    let videos: Video[] = []
    let continuation: string
    do {
      const nextPage = await youtube.playlistItems.list({
        part: ['contentDetails', 'snippet', 'id', 'status'],
        playlistId: channel.uploadsPlaylistId,
        maxResults: 50,
      })
      continuation = nextPage.data.nextPageToken ?? ''
      const page = this.mapVideos(nextPage.data.items ?? [])
      videos = [...videos, ...page]
    } while (continuation && videos.length < max)
    return videos
  }
  private getYoutube(accessToken: string, refreshToken: string) {
    const auth = this.getAuth()
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    return new youtube_v3.Youtube({ auth })
  }
  private getAuth() {
    return new OAuth2Client({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    })
  }
  private mapChannels(user: User, channels: Schema$Channel[]) {
    return channels.map<Channel>(
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
            subscriberCount: parseInt(item.statistics?.subscriberCount ?? '0'),
            videoCount: parseInt(item.statistics?.videoCount ?? '0'),
            commentCount: parseInt(item.statistics?.commentCount ?? '0'),
          },
          uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads,
          frequency: 0,
          createdAt: Date.now(),
          shouldBeIngested: false,
        }
    )
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
    )
  }
}

class QuotaTrackingClient implements IYoutubeClient {
  private _statsRepo
  constructor(private decorated: IYoutubeClient) {
    this._statsRepo = statsRepository()
  }
  getUserFromCode(code: string) {
    return this.decorated.getUserFromCode(code)
  }
  getChannels(user: User) {
    return R.pipe(
      this.decorated.getChannels,
      R.andThen((res) => res.tapAsync((channels) => this.increaseUsedQuota(channels, channels.length % 50)))
    )(user)
  }
  getVideos(channel: Channel, top: number) {
    return R.pipe(
      this.decorated.getVideos,
      R.andThen((res) => res.tapAsync((videos) => this.increaseUsedQuota(videos, videos.length % 50)))
    )(channel, top)
  }
  getAllVideos(channel: Channel, max: number) {
    return R.pipe(
      this.decorated.getAllVideos,
      R.andThen((res) => res.tapAsync((videos) => this.increaseUsedQuota(videos, videos.length % 50)))
    )(channel, max)
  }
  downloadVideo(videoUrl: string): Readable {
    return this.decorated.downloadVideo(videoUrl)
  }

  private async increaseUsedQuota<TValue>(result: TValue, increment: number) {
    const today = new Date()
    const timestamp = today.setUTCHours(0, 0, 0, 0)
    await this._statsRepo.update({ partition: 'stats', date: timestamp }, { $ADD: { quotaUsed: increment } })
    return result
  }
}

export const YtClient = {
  create(clientId: string, clientSecret: string, redirectUri: string): IYoutubeClient {
    return new QuotaTrackingClient(new YoutubeClient(clientId, clientSecret, redirectUri))
  },
}
