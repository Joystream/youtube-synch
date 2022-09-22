import { youtube_v3 } from '@googleapis/youtube'
import { OAuth2Client } from 'google-auth-library'
import ytdl from 'ytdl-core'
import Schema$PlaylistItem = youtube_v3.Schema$PlaylistItem
import Schema$Channel = youtube_v3.Schema$Channel
import { Channel, ChannelVerificationFailed, ExitCodes, User, Video } from '@youtube-sync/domain'
import { Readable } from 'stream'
import { statsRepository } from '..'

// YPP induction criteria, each channel should meet following criteria
const MINIMUM_SUBSCRIBERS_COUNT = 50
const MINIMUM_VIDEO_COUNT = 10
const MINIMUM_VIDEO_AGE_MONTHS = 1
const MINIMUM_CHANNEL_AGE_MONTHS = 3

export interface IYoutubeClient {
  getUserFromCode(code: string): Promise<User>
  getChannels(user: User): Promise<Channel[]>
  verifyChannel(channel: Channel): Promise<Channel>
  getVideos(channel: Channel, top: number): Promise<Video[]>
  getAllVideos(channel: Channel, max: number): Promise<Video[]>
  downloadVideo(videoUrl: string): Readable
}

class YoutubeClient implements IYoutubeClient {
  constructor(private clientId: string, private clientSecret: string, private redirectUri: string) {}

  private getYoutube(accessToken: string, refreshToken: string) {
    const auth = this.getAuth()
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    return new youtube_v3.Youtube({ auth })
  }

  private async getAccessToken(code: string) {
    try {
      return await this.getAuth().getToken(code)
    } catch (error) {
      throw new Error(`Could not get User's access token using authorization code ${error}`)
    }
  }

  private getAuth() {
    return new OAuth2Client({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    })
  }

  async getUserFromCode(code: string) {
    const tokenResponse = await this.getAccessToken(code)
    const tokenInfo = await this.getAuth().getTokenInfo(tokenResponse.tokens.access_token)

    const user = new User(
      tokenInfo.sub,
      tokenInfo.email,
      tokenResponse.tokens.access_token,
      tokenResponse.tokens.refresh_token,
      code
    )
    return user
  }

  async getChannels(user: User) {
    const yt = this.getYoutube(user.accessToken, user.refreshToken)

    const channelResponse = await yt.channels.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      mine: true,
    })
    const channels = this.mapChannels(user, channelResponse.data.items ?? [])

    return channels
  }

  async verifyChannel(channel: Channel): Promise<Channel> {
    const errors: ChannelVerificationFailed[] = []
    if (channel.statistics.subscriberCount < MINIMUM_SUBSCRIBERS_COUNT) {
      errors.push({
        errorCode: ExitCodes.CHANNEL_CRITERIA_UNMET_SUBSCRIBERS,
        message:
          `Channel ${channel.id} with ${channel.statistics.subscriberCount} subscribers does not ` +
          `meet Youtube Partner Program requirement of ${MINIMUM_SUBSCRIBERS_COUNT} subscribers`,
        result: channel.statistics.subscriberCount,
        expected: MINIMUM_SUBSCRIBERS_COUNT,
      })
    }

    // at least MINiMUM_VIDEO_COUNT videos should be one month old
    const oneMonthsAgo = new Date()
    oneMonthsAgo.setMonth(oneMonthsAgo.getMonth() - MINIMUM_VIDEO_AGE_MONTHS)

    // filter all videos that are older than one month
    const videos = (await this.getVideos(channel, MINIMUM_VIDEO_COUNT)).filter(
      (v) => new Date(v.publishedAt) < oneMonthsAgo
    )
    if (videos.length < MINIMUM_VIDEO_COUNT) {
      errors.push({
        errorCode: ExitCodes.CHANNEL_CRITERIA_UNMET_VIDEOS,
        message:
          `Channel ${channel.id} with ${videos.length} videos does not meet Youtube ` +
          `Partner Program requirement of at least ${MINIMUM_VIDEO_COUNT} videos, each ${MINIMUM_VIDEO_AGE_MONTHS} month old`,
        result: channel.statistics.videoCount,
        expected: MINIMUM_VIDEO_COUNT,
      })
    }

    // Channel should be at least 3 months old
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - MINIMUM_CHANNEL_AGE_MONTHS)
    if (new Date(channel.publishedAt) > threeMonthsAgo) {
      errors.push({
        errorCode: ExitCodes.CHANNEL_CRITERIA_UNMET_CREATION_DATE,
        message:
          `Channel ${channel.id} with creation time of ${channel.publishedAt} does not ` +
          `meet Youtube Partner Program requirement of channel being at least ${MINIMUM_CHANNEL_AGE_MONTHS} months old`,
        result: channel.publishedAt,
        expected: threeMonthsAgo,
      })
    }

    if (errors.length > 0) {
      throw errors
    }
    return channel
  }

  async getVideos(channel: Channel, top: number) {
    const yt = this.getYoutube(channel.userAccessToken, channel.userRefreshToken)
    try {
      return await this.iterateVideos(yt, channel, top)
    } catch (error) {
      throw new Error(`Failed to fetch videos for channel ${channel.title}. Error: ${error}`)
    }
  }

  async getAllVideos(channel: Channel, max = 500) {
    const yt = this.getYoutube(channel.userAccessToken, channel.userRefreshToken)
    try {
      return await this.iterateVideos(yt, channel, max)
    } catch (error) {
      throw new Error(`Failed to fetch videos for channel ${channel.title}. Error: ${error}`)
    }
  }

  downloadVideo(videoUrl: string): Readable {
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

  private mapChannels(user: User, channels: Schema$Channel[]) {
    return channels.map<Channel>(
      (channel) =>
        <Channel>{
          id: channel.id,
          description: channel.snippet?.description,
          title: channel.snippet?.title,
          userId: user.id,
          userAccessToken: user.accessToken,
          userRefreshToken: user.refreshToken,
          thumbnails: {
            default: channel.snippet?.thumbnails?.default?.url,
            medium: channel.snippet?.thumbnails?.medium?.url,
            high: channel.snippet?.thumbnails?.high?.url,
            maxRes: channel.snippet?.thumbnails?.maxres?.url,
            standard: channel.snippet?.thumbnails?.standard?.url,
          },

          statistics: {
            viewCount: parseInt(channel.statistics?.viewCount ?? '0'),
            subscriberCount: parseInt(channel.statistics?.subscriberCount ?? '0'),
            videoCount: parseInt(channel.statistics?.videoCount ?? '0'),
            commentCount: parseInt(channel.statistics?.commentCount ?? '0'),
          },
          tier:
            parseInt(channel.statistics?.subscriberCount || '0') <= 10_000
              ? 1
              : parseInt(channel.statistics?.subscriberCount || '0') <= 100_000
              ? 2
              : 3,
          uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
          frequency: 0,
          createdAt: Date.now(),
          publishedAt: channel.snippet?.publishedAt,
          shouldBeIngested: false,
        }
    )
  }

  private mapVideos(videos: Schema$PlaylistItem[]) {
    return videos.map(
      (video) =>
        <Video>{
          id: video.id,
          description: video.snippet?.description,
          title: video.snippet?.title,
          channelId: video.snippet?.channelId,
          thumbnails: {
            high: video.snippet?.thumbnails?.high?.url,
            medium: video.snippet?.thumbnails?.medium?.url,
            maxRes: video.snippet?.thumbnails?.maxres?.url,
            standard: video.snippet?.thumbnails?.standard?.url,
            default: video.snippet?.thumbnails?.default?.url,
          },
          url: `https://youtube.com/watch?v=${video.id}`,
          resourceId: video.id,
          publishedAt: video.snippet?.publishedAt,
          createdAt: Date.now(),
          state: 'new',
        }
    )
  }
}

// TODO: check if have remaining quota, set time to next poll
class QuotaTrackingClient implements IYoutubeClient {
  private _statsRepo

  constructor(private decorated: IYoutubeClient) {
    this._statsRepo = statsRepository()
  }

  getUserFromCode(code: string) {
    return this.decorated.getUserFromCode(code)
  }

  async verifyChannel(channel: Channel) {
    const verifiedChannel = await this.decorated.verifyChannel(channel)
    return verifiedChannel
  }

  async getChannels(user: User) {
    // get channels from api
    const channels = await this.decorated.getChannels(user)

    // increase used quota count
    this.increaseUsedQuota(channels.length % 50)

    return channels
  }

  async getVideos(channel: Channel, top: number) {
    // get videos from api
    const videos = await this.decorated.getVideos(channel, top)

    // increase used quota count
    this.increaseUsedQuota(videos.length % 50)

    return videos
  }

  async getAllVideos(channel: Channel, max: number) {
    // get videos from api
    const videos = await this.decorated.getVideos(channel, max)

    // increase used quota count
    this.increaseUsedQuota(videos.length % 50)

    return videos
  }

  downloadVideo(videoUrl: string): Readable {
    return this.decorated.downloadVideo(videoUrl)
  }

  private async increaseUsedQuota(increment: number) {
    const today = new Date()
    const timestamp = today.setUTCHours(0, 0, 0, 0)
    await this._statsRepo.update({ partition: 'stats', date: timestamp }, { $ADD: { quotaUsed: increment } })
  }
}

export const YtClient = {
  create(clientId: string, clientSecret: string, redirectUri: string): IYoutubeClient {
    return new QuotaTrackingClient(new YoutubeClient(clientId, clientSecret, redirectUri))
  },
}
