import { youtube_v3 } from '@googleapis/youtube'
import { OAuth2Client } from 'google-auth-library'
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { GaxiosError } from 'googleapis-common'
import { parse, toSeconds } from 'iso8601-duration'
import { Readable } from 'stream'
import { Logger } from 'winston'
import ytdl from 'ytdl-core'
import { StatsRepository } from '../../repository'
import { ReadonlyConfig, WithRequired, toPrettyJSON } from '../../types'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtUser, YtVideo } from '../../types/youtube'
import { LoggingService } from '../logging'
import Schema$PlaylistItem = youtube_v3.Schema$PlaylistItem
import Schema$Video = youtube_v3.Schema$Video
import Schema$Channel = youtube_v3.Schema$Channel

export interface IYoutubeApi {
  getUserFromCode(code: string, youtubeRedirectUri: string): Promise<YtUser>
  getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>): Promise<YtChannel>
  getVerifiedChannel(user: YtUser): Promise<YtChannel>
  getVideos(channel: YtChannel, top: number): Promise<YtVideo[]>
  getAllVideos(channel: YtChannel, max: number): Promise<YtVideo[]>
  downloadVideo(videoUrl: string): Promise<Readable>
  getCreatorOnboardingRequirements(): ReadonlyConfig['creatorOnboardingRequirements']
}

class YoutubeClient implements IYoutubeApi {
  private config: ReadonlyConfig

  constructor(config: ReadonlyConfig) {
    this.config = config
  }

  getCreatorOnboardingRequirements() {
    return this.config.creatorOnboardingRequirements
  }

  private getAuth(youtubeRedirectUri?: string) {
    return new OAuth2Client({
      clientId: this.config.youtube.clientId,
      clientSecret: this.config.youtube.clientSecret,
      redirectUri: youtubeRedirectUri,
    })
  }

  private getYoutube(accessToken: string, refreshToken: string) {
    const auth = this.getAuth()
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    return new youtube_v3.Youtube({ auth })
  }

  private async getAccessToken(
    code: string,
    youtubeRedirectUri: string
  ): Promise<WithRequired<GetTokenResponse['tokens'], 'access_token' | 'refresh_token'>> {
    try {
      const token = await this.getAuth(youtubeRedirectUri).getToken(code)
      if (!token.tokens?.access_token) {
        throw new Error('Access token not found in token response.')
      }

      if (!token.tokens?.refresh_token) {
        throw new Error(
          'Refresh token not found in token response. User authorization should be requested with `access_type: offline`'
        )
      }

      return { access_token: token.tokens.access_token, refresh_token: token.tokens.refresh_token }
    } catch (error) {
      const message = error instanceof GaxiosError ? error.response?.data : error
      throw new Error(`Could not get User's access token using authorization code ${toPrettyJSON(message)}`)
    }
  }

  async getUserFromCode(code: string, youtubeRedirectUri: string) {
    const tokenResponse = await this.getAccessToken(code, youtubeRedirectUri)

    const tokenInfo = await this.getAuth().getTokenInfo(tokenResponse.access_token)

    if (!tokenInfo.sub) {
      throw new Error(
        `User id not found in token info. Please add required 'userinfo.profile' scope in user authorization request.`
      )
    }

    if (!tokenInfo.email) {
      throw new Error(
        `User email not found in token info. Please add required 'userinfo.email' scope in user authorization request.`
      )
    }

    const user: YtUser = {
      id: tokenInfo.sub,
      email: tokenInfo.email,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      authorizationCode: code,
      createdAt: new Date(),
    }
    return user
  }

  async getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>) {
    const yt = this.getYoutube(user.accessToken, user.refreshToken)

    const channelResponse = await yt.channels.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      mine: true,
    })
    const [channel] = this.mapChannels(user, channelResponse.data.items ?? [])

    // Ensure channel exists
    if (!channel) {
      throw new YoutubeApiError(ExitCodes.YoutubeApi.CHANNEL_NOT_FOUND, `No Youtube Channel exists for given user`)
    }

    return channel
  }

  async getVerifiedChannel(user: YtUser): Promise<YtChannel> {
    const channel = await this.getChannel(user)

    const { minimumSubscribersCount, minimumVideoCount, minimumChannelAgeHours, minimumVideoAgeHours } =
      this.config.creatorOnboardingRequirements
    const errors: YoutubeApiError[] = []
    if (channel.statistics.subscriberCount < minimumSubscribersCount) {
      errors.push(
        new YoutubeApiError(
          ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_SUBSCRIBERS,
          `Channel ${channel.id} with ${channel.statistics.subscriberCount} subscribers does not ` +
            `meet Youtube Partner Program requirement of ${minimumSubscribersCount} subscribers`,
          channel.statistics.subscriberCount,
          minimumSubscribersCount
        )
      )
    }

    // at least MINiMUM_VIDEO_COUNT videos should be MINIMUM_VIDEO_AGE_HOURS old
    const videoCreationTimeCutoff = new Date()
    videoCreationTimeCutoff.setHours(videoCreationTimeCutoff.getHours() - minimumVideoAgeHours)

    // filter all videos that are older than MINIMUM_VIDEO_AGE_HOURS
    const videos = (await this.getVideos(channel, minimumVideoCount)).filter(
      (v) => new Date(v.publishedAt) < videoCreationTimeCutoff
    )
    if (videos.length < minimumVideoCount) {
      errors.push(
        new YoutubeApiError(
          ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_VIDEOS,
          `Channel ${channel.id} with ${videos.length} videos does not meet Youtube ` +
            `Partner Program requirement of at least ${minimumVideoCount} videos, each ${(
              minimumVideoAgeHours / 720
            ).toPrecision(2)} month old`,
          channel.statistics.videoCount,
          minimumVideoCount
        )
      )
    }

    // Channel should be at least MINIMUM_CHANNEL_AGE_HOURS old
    const channelCreationTimeCutoff = new Date()
    channelCreationTimeCutoff.setHours(channelCreationTimeCutoff.getHours() - minimumChannelAgeHours)
    if (new Date(channel.publishedAt) > channelCreationTimeCutoff) {
      errors.push(
        new YoutubeApiError(
          ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_CREATION_DATE,
          `Channel ${channel.id} with creation time of ${channel.publishedAt} does not ` +
            `meet Youtube Partner Program requirement of channel being at least ${(
              minimumChannelAgeHours / 720
            ).toPrecision(2)} months old`,
          channel.publishedAt,
          channelCreationTimeCutoff
        )
      )
    }

    if (errors.length > 0) {
      throw errors
    }
    return channel
  }

  async getVideos(channel: YtChannel, top: number) {
    const yt = this.getYoutube(channel.userAccessToken, channel.userRefreshToken)
    try {
      return await this.iterateVideos(yt, channel, top)
    } catch (error) {
      throw new Error(`Failed to fetch videos for channel ${channel.title}. Error: ${error}`)
    }
  }

  async getAllVideos(channel: YtChannel, max = 500) {
    const yt = this.getYoutube(channel.userAccessToken, channel.userRefreshToken)
    try {
      return await this.iterateVideos(yt, channel, max)
    } catch (error) {
      throw new Error(`Failed to fetch videos for channel ${channel.title}. Error: ${error}`)
    }
  }

  downloadVideo(videoUrl: string, quality = 'highest'): Promise<Readable> {
    return new Promise((resolve, reject) => {
      const stream = ytdl(videoUrl, { quality })
      stream.on('info', (info) => {
        if (info.length_seconds > 3600) {
          reject(new YoutubeApiError(ExitCodes.YoutubeApi.VIDEO_NOT_FOUND, 'Video too long'))
        }
      })
      resolve(stream)
    })
  }

  private async iterateVideos(youtube: youtube_v3.Youtube, channel: YtChannel, max: number) {
    let videos: YtVideo[] = []
    let continuation: string

    do {
      const nextPage = await youtube.playlistItems.list({
        part: ['contentDetails', 'snippet', 'id', 'status'],
        playlistId: channel.uploadsPlaylistId,
        maxResults: 50,
      })
      continuation = nextPage.data.nextPageToken ?? ''

      const videosDetails = nextPage.data.items?.length
        ? (
            await youtube.videos.list({
              id: nextPage.data.items?.map((v) => v.snippet?.resourceId?.videoId ?? ``),
              part: ['contentDetails', 'fileDetails', 'snippet', 'id', 'status', 'statistics'],
            })
          ).data?.items
        : []

      const page = this.mapVideos(nextPage.data.items ?? [], videosDetails ?? [], channel)
      videos = [...videos, ...page]
    } while (continuation && videos.length < max)
    return videos
  }

  private mapChannels(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>, channels: Schema$Channel[]) {
    return channels.map<YtChannel>(
      (channel) =>
        <YtChannel>{
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
            standard: channel.snippet?.thumbnails?.standard?.url,
          },
          statistics: {
            viewCount: parseInt(channel.statistics?.viewCount ?? '0'),
            subscriberCount: parseInt(channel.statistics?.subscriberCount ?? '0'),
            videoCount: parseInt(channel.statistics?.videoCount ?? '0'),
            commentCount: parseInt(channel.statistics?.commentCount ?? '0'),
          },
          uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
          language: channel.snippet?.defaultLanguage,
          performUnauthorizedSync: false,
          publishedAt: channel.snippet?.publishedAt,
          shouldBeIngested: true,
          yppStatus: 'Unverified',
          createdAt: new Date(),
          lastActedAt: new Date(),
          phantomKey: 'phantomData',
        }
    )
  }

  private mapVideos(videos: Schema$PlaylistItem[], videosDetails: Schema$Video[], channel: YtChannel) {
    return videos.map(
      (video, i) =>
        <YtVideo>{
          id: video.id,
          description: video.snippet?.description,
          title: video.snippet?.title,
          channelId: video.snippet?.channelId,
          thumbnails: {
            high: video.snippet?.thumbnails?.high?.url,
            medium: video.snippet?.thumbnails?.medium?.url,
            standard: video.snippet?.thumbnails?.standard?.url,
            default: video.snippet?.thumbnails?.default?.url,
          },
          url: `https://youtube.com/watch?v=${video.snippet?.resourceId?.videoId}`,
          resourceId: video.snippet?.resourceId?.videoId,
          publishedAt: video.contentDetails?.videoPublishedAt,
          createdAt: new Date(),
          category: channel.videoCategoryId,
          language: channel.joystreamChannelLanguageId,
          privacyStatus: video.status?.privacyStatus,
          liveBroadcastContent: videosDetails[i].snippet?.liveBroadcastContent,
          license: videosDetails[i].status?.license,
          duration: toSeconds(parse(videosDetails[i].contentDetails?.duration ?? 'PT0S')),
          container: videosDetails[i].fileDetails?.container,
          uploadStatus: videosDetails[i].status?.uploadStatus,
          viewCount: parseInt(videosDetails[i].statistics?.viewCount ?? '0'),
          state: 'New',
        }
    )
  }
}

class QuotaTrackingClient implements IYoutubeApi {
  private statsRepo

  constructor(private decorated: IYoutubeApi, private dailyApiQuota: ReadonlyConfig['limits']['dailyApiQuota']) {
    this.statsRepo = new StatsRepository()
  }

  getCreatorOnboardingRequirements() {
    return this.decorated.getCreatorOnboardingRequirements()
  }

  getUserFromCode(code: string, youtubeRedirectUri: string) {
    return this.decorated.getUserFromCode(code, youtubeRedirectUri)
  }

  async getVerifiedChannel(user: YtUser) {
    // ensure have some left api quota
    if (!(await this.canCallYoutube('signup'))) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left for signup. Please try again later.'
      )
    }

    try {
      const verifiedChannel = await this.decorated.getVerifiedChannel(user)
      // increase used quota count
      await this.increaseUsedQuota({ signupQuotaIncrement: 1 })
      return verifiedChannel
    } catch (error) {
      // increase used quota count even in case of failed verification
      await this.increaseUsedQuota({ signupQuotaIncrement: 1 })
      throw error
    }
  }

  async getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>) {
    // ensure have some left api quota
    if (!(await this.canCallYoutube('sync'))) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left. Please try again later.'
      )
    }

    // get channels from api
    const channels = await this.decorated.getChannel(user)

    // increase used quota count by 1 because only one page is returned
    await this.increaseUsedQuota({ syncQuotaIncrement: 1 })

    return channels
  }

  async getVideos(channel: YtChannel, top: number) {
    // ensure have some left api quota
    if (!(await this.canCallYoutube('sync'))) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left for signup. Please try again later.'
      )
    }

    // get videos from api
    const videos = await this.decorated.getVideos(channel, top)

    // increase used quota count, at least 2 api per channel are being used for requesting video details
    await this.increaseUsedQuota({ syncQuotaIncrement: parseInt((videos.length / 50).toString()) * 2 || 2 })

    return videos
  }

  async getAllVideos(channel: YtChannel, max: number) {
    // ensure have some left api quota
    if (!(await this.canCallYoutube('sync'))) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left. Please try again later.'
      )
    }

    // get videos from api
    const videos = await this.decorated.getAllVideos(channel, max)

    // increase used quota count, at least 2 api per channel are being used for requesting video details
    await this.increaseUsedQuota({ syncQuotaIncrement: parseInt((videos.length / 50).toString()) * 2 || 2 })

    return videos
  }

  downloadVideo(videoUrl: string): Promise<Readable> {
    return this.decorated.downloadVideo(videoUrl)
  }

  private async increaseUsedQuota({ syncQuotaIncrement = 0, signupQuotaIncrement = 0 }) {
    // Quota resets at Pacific Time, and pst is 8 hours behind UTC
    const stats = await this.statsRepo.getOrSetTodaysStats()
    const statsModel = await this.statsRepo.getModel()

    await statsModel.update(
      { partition: 'stats', date: stats.date },
      { $ADD: { syncQuotaUsed: syncQuotaIncrement, signupQuotaUsed: signupQuotaIncrement } }
    )
  }

  private async canCallYoutube(purpose: 'signup' | 'sync'): Promise<boolean> {
    // Total daily Youtube quota is 10,000 which is shared between signup(2%) and sync(98%) services
    const syncDailyQuota = 9500
    const signupDailyQuota = 500

    const stats = await this.statsRepo.getOrSetTodaysStats()

    return purpose === 'signup'
      ? stats.signupQuotaUsed < this.dailyApiQuota.signup
      : stats.syncQuotaUsed < this.dailyApiQuota.sync
  }
}

export const YoutubeApi = {
  create(config: ReadonlyConfig): IYoutubeApi {
    return new QuotaTrackingClient(new YoutubeClient(config), config.limits.dailyApiQuota)
  },
}
