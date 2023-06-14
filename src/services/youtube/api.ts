import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { MetricServiceClient } from '@google-cloud/monitoring'
import { youtube_v3 } from '@googleapis/youtube'
import { exec } from 'child_process'
import { OAuth2Client } from 'google-auth-library'
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { GaxiosError } from 'googleapis-common'
import { parse, toSeconds } from 'iso8601-duration'
import _ from 'lodash'
import moment from 'moment-timezone'
import { FetchError } from 'node-fetch'
import path from 'path'
import pkgDir from 'pkg-dir'
import { promisify } from 'util'
import ytdl from 'youtube-dl-exec'
import { ReadonlyConfig, WithRequired, formattedJSON } from '../../types'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtUser, YtVideo } from '../../types/youtube'

import Schema$PlaylistItem = youtube_v3.Schema$PlaylistItem
import Schema$Video = youtube_v3.Schema$Video
import Schema$Channel = youtube_v3.Schema$Channel

export class YtDlpClient {
  private ytdlpPath: string
  private exec

  constructor() {
    this.exec = promisify(exec)
    this.ytdlpPath = `${pkgDir.sync(__dirname)}/node_modules/youtube-dl-exec/bin/yt-dlp`
  }

  async getAllVideosIds(channel: YtChannel): Promise<string[]> {
    try {
      const { stdout } = await this.exec(
        `${this.ytdlpPath} --flat-playlist --get-id https://www.youtube.com/playlist?list=${channel.uploadsPlaylistId}`
      )

      // Each line of stdout is a video ID
      const videoIDs = stdout.split('\n').filter((id: unknown) => id) // Remove any empty lines
      return videoIDs
    } catch (err) {
      throw err
    }
  }
}

export interface IYoutubeApi {
  getUserFromCode(code: string, youtubeRedirectUri: string): Promise<YtUser>
  getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>): Promise<YtChannel>
  getVerifiedChannel(
    user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>
  ): Promise<{ channel: YtChannel; errors: YoutubeApiError[] }>
  getVideos(channel: YtChannel, ids: string[]): Promise<YtVideo[]>
  getAllVideos(channel: YtChannel): Promise<YtVideo[]>
  downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl>
  getCreatorOnboardingRequirements(): ReadonlyConfig['creatorOnboardingRequirements']
}

export interface IQuotaMonitoringClient {
  getQuotaUsage(): Promise<number>
  getQuotaLimit(): Promise<number>
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
      throw new Error(`Could not get User's access token using authorization code ${formattedJSON(message)}`)
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

    const channelResponse = await yt.channels
      .list({
        part: ['snippet', 'contentDetails', 'statistics'],
        mine: true,
      })
      .catch((err) => {
        if (err instanceof FetchError && err.code === 'ENOTFOUND') {
          throw new YoutubeApiError(ExitCodes.YoutubeApi.YOUTUBE_API_NOT_CONNECTED, err.message)
        }
        throw err
      })

    const [channel] = this.mapChannels(user, channelResponse.data.items ?? [])

    // Ensure channel exists
    if (!channel) {
      throw new YoutubeApiError(ExitCodes.YoutubeApi.CHANNEL_NOT_FOUND, `No Youtube Channel exists for given user`)
    }

    return channel
  }

  async getVerifiedChannel(
    user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>
  ): Promise<{ channel: YtChannel; errors: YoutubeApiError[] }> {
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
    const videos = (await this.getAllVideos(channel)).filter((v) => new Date(v.publishedAt) < videoCreationTimeCutoff)
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

    return { channel, errors }
  }

  async getVideos(channel: YtChannel, ids: string[]) {
    const yt = this.getYoutube(channel.userAccessToken, channel.userRefreshToken)
    try {
      return this.iterateVideos(yt, channel, ids)
    } catch (error) {
      throw new Error(`Failed to fetch videos for channel ${channel.title}. Error: ${error}`)
    }
  }

  async getAllVideos(channel: YtChannel) {
    const yt = this.getYoutube(channel.userAccessToken, channel.userRefreshToken)
    try {
      return this.iterateAllVideos(yt, channel)
    } catch (error) {
      throw new Error(`Failed to fetch videos for channel ${channel.title}. Error: ${error}`)
    }
  }

  async downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl> {
    const response = await ytdl(videoUrl, {
      noWarnings: true,
      printJson: true,
      format: 'bv[height<=1080][ext=mp4]+ba[ext=m4a]/bv[height<=1080][ext=webm]+ba[ext=webm]/best[height<=1080]',
      output: `${outPath}/%(id)s.%(ext)s`,
      ffmpegLocation: ffmpegInstaller.path,
    })
    return response
  }

  private async iterateVideos(youtube: youtube_v3.Youtube, channel: YtChannel, ids: string[]) {
    let videos: YtVideo[] = []

    // Youtube API allows to fetch up to 50 videos per request
    const idsChunks = _.chunk(ids, 50)

    for (const idsChunk of idsChunks) {
      const videosPage = idsChunk.length
        ? (
            await youtube.videos
              .list({
                id: ids,
                part: ['contentDetails', 'fileDetails', 'snippet', 'id', 'status', 'statistics'],
              })
              .catch((err) => {
                if (err instanceof FetchError && err.code === 'ENOTFOUND') {
                  throw new YoutubeApiError(ExitCodes.YoutubeApi.YOUTUBE_API_NOT_CONNECTED, err.message)
                }
                throw err
              })
          ).data?.items ?? []
        : []

      const page = this.mapVideos(videosPage, channel)
      videos = [...videos, ...page]
    }
    return videos
  }

  private async iterateAllVideos(youtube: youtube_v3.Youtube, channel: YtChannel, limit?: number) {
    let videos: YtVideo[] = []
    let nextPageToken: string | undefined

    do {
      const nextPage = await youtube.playlistItems
        .list({
          part: ['contentDetails', 'snippet', 'id', 'status'],
          playlistId: channel.uploadsPlaylistId,
          maxResults: 50,
          pageToken: nextPageToken,
        })
        .catch((err) => {
          if (err instanceof FetchError && err.code === 'ENOTFOUND') {
            throw new YoutubeApiError(ExitCodes.YoutubeApi.YOUTUBE_API_NOT_CONNECTED, err.message)
          }
          throw err
        })
      nextPageToken = nextPage.data.nextPageToken ?? ''

      // Filter `public` videos as only those would be synced
      const videosPage = nextPage.data.items?.filter((v) => v.status?.privacyStatus === 'public') ?? []

      const videosDetailsPage = videosPage.length
        ? (
            await youtube.videos
              .list({
                id: videosPage?.map((v) => v.snippet?.resourceId?.videoId ?? ``),
                part: ['contentDetails', 'fileDetails', 'snippet', 'id', 'status', 'statistics'],
              })
              .catch((err) => {
                if (err instanceof FetchError && err.code === 'ENOTFOUND') {
                  throw new YoutubeApiError(ExitCodes.YoutubeApi.YOUTUBE_API_NOT_CONNECTED, err.message)
                }
                throw err
              })
          ).data?.items ?? []
        : []

      const page = this.mapAllVideos(videosPage, videosDetailsPage, channel)
      videos = [...videos, ...page]
    } while (nextPageToken && (limit === undefined || videos.length < limit))
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
          customUrl: channel.snippet?.customUrl,
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

  private mapVideos(videos: Schema$Video[], channel: YtChannel): YtVideo[] {
    return (
      videos
        .map(
          (video) =>
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
              url: `https://youtube.com/watch?v=${video.id}`,
              publishedAt: video.snippet?.publishedAt,
              createdAt: new Date(),
              category: channel.videoCategoryId,
              languageIso: channel.joystreamChannelLanguageIso,
              joystreamChannelId: channel.joystreamChannelId,
              privacyStatus: video.status?.privacyStatus,
              ytRating: video.contentDetails?.contentRating?.ytRating,
              liveBroadcastContent: video.snippet?.liveBroadcastContent,
              license: video.status?.license,
              duration: toSeconds(parse(video.contentDetails?.duration ?? 'PT0S')),
              container: video.fileDetails?.container,
              uploadStatus: video.status?.uploadStatus,
              viewCount: parseInt(video.statistics?.viewCount ?? '0'),
              state: 'New',
            }
        )
        // filter out videos that are not public, processed, have live-stream or age-restriction, since those can't be synced yet
        .filter((v) => v.uploadStatus === 'processed' && v.liveBroadcastContent === 'none' && v.ytRating === undefined)
    )
  }

  private mapAllVideos(videos: Schema$PlaylistItem[], videosDetails: Schema$Video[], channel: YtChannel): YtVideo[] {
    return (
      videos
        .map(
          (video, i) =>
            <YtVideo>{
              id: video.snippet?.resourceId?.videoId,
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
              publishedAt: video.contentDetails?.videoPublishedAt,
              createdAt: new Date(),
              category: channel.videoCategoryId,
              languageIso: channel.joystreamChannelLanguageIso,
              joystreamChannelId: channel.joystreamChannelId,
              privacyStatus: video.status?.privacyStatus,
              ytRating: videosDetails[i].contentDetails?.contentRating?.ytRating,
              liveBroadcastContent: videosDetails[i].snippet?.liveBroadcastContent,
              license: videosDetails[i].status?.license,
              duration: toSeconds(parse(videosDetails[i].contentDetails?.duration ?? 'PT0S')),
              container: videosDetails[i].fileDetails?.container,
              uploadStatus: videosDetails[i].status?.uploadStatus,
              viewCount: parseInt(videosDetails[i].statistics?.viewCount ?? '0'),
              state: 'New',
            }
        )
        // filter out videos that are not public, processed, have live-stream or age-restriction, since those can't be synced yet
        .filter((v) => v.uploadStatus === 'processed' && v.liveBroadcastContent === 'none' && v.ytRating === undefined)
    )
  }
}

class QuotaMonitoringClient implements IQuotaMonitoringClient, IYoutubeApi {
  private quotaMonitoringClient: MetricServiceClient | undefined
  private googleCloudProjectId: string
  private DEFAULT_MAX_ALLOWED_QUOTA_USAGE = 95 // 95%

  constructor(private decorated: IYoutubeApi, private config: ReadonlyConfig) {
    // Use the client id to get the google cloud project id
    this.googleCloudProjectId = this.config.youtube.clientId.split('-')[0]

    // if we have a key file path, we use it to authenticate with the google cloud monitoring api
    if (this.config.youtube.adcKeyFilePath) {
      this.quotaMonitoringClient = new MetricServiceClient({
        keyFile: path.resolve(this.config.youtube.adcKeyFilePath),
      })
    }
  }

  async getQuotaLimit(): Promise<number> {
    // Get the unix timestamp for the start of the day in the PST timezone
    const dateInPstZone = moment().tz('America/Los_Angeles')
    dateInPstZone.startOf('day')
    const pstUnixTimestamp = dateInPstZone.unix()

    const now = new Date()

    // Create the request
    const request = {
      name: this.quotaMonitoringClient?.projectPath(this.googleCloudProjectId),
      filter:
        `metric.type = "serviceruntime.googleapis.com/quota/limit" ` +
        `AND ` +
        `metric.labels.limit_name = defaultPerDayPerProject ` +
        `AND ` +
        `resource.labels.service= "youtube.googleapis.com"`,
      interval: {
        startTime: {
          seconds: pstUnixTimestamp,
        },
        endTime: {
          seconds: Math.floor(now.getTime() / 1000),
        },
      },
    }

    // Get time series metrics data
    const timeSeries = await this.quotaMonitoringClient?.listTimeSeries(request)

    // Get Youtube API quota limit
    const quotaLimit = (timeSeries![0][0].points || [])[0]?.value?.int64Value
    return Number(quotaLimit)
  }

  async getQuotaUsage(): Promise<number> {
    // Get the unix timestamp for the start of the day in the PST timezone
    const dateInPstZone = moment().tz('America/Los_Angeles')
    dateInPstZone.startOf('day')
    const pstUnixTimestamp = dateInPstZone.unix()

    const now: Date = new Date()

    // Create the request
    const request = {
      name: this.quotaMonitoringClient?.projectPath(this.googleCloudProjectId),
      filter:
        `metric.type = "serviceruntime.googleapis.com/quota/rate/net_usage" ` +
        `AND ` +
        `resource.labels.service= "youtube.googleapis.com" `,
      interval: {
        startTime: {
          seconds: pstUnixTimestamp,
        },
        endTime: {
          seconds: Math.floor(now.getTime() / 1000),
        },
      },
    }

    // Get time series metrics data
    const timeSeries = await this.quotaMonitoringClient?.listTimeSeries(request)

    // Aggregate Youtube API quota usage for the day using the time series data
    let quotaUsage = 0
    timeSeries![0].forEach((data) => {
      quotaUsage = _.sumBy(data.points, (point) => {
        return Number(point.value?.int64Value)
      })
    })

    return quotaUsage
  }

  getCreatorOnboardingRequirements() {
    return this.decorated.getCreatorOnboardingRequirements()
  }

  getUserFromCode(code: string, youtubeRedirectUri: string) {
    return this.decorated.getUserFromCode(code, youtubeRedirectUri)
  }

  async getVerifiedChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>) {
    // These is no api quota check for this operation, as we allow untracked access to channel verification/signup endpoint.
    const verifiedChannel = await this.decorated.getVerifiedChannel(user)
    return verifiedChannel
  }

  async getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>) {
    // ensure have some left api quota
    if (!(await this.canCallYoutube())) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left. Please try again later.'
      )
    }

    // get channels from api
    const channels = await this.decorated.getChannel(user)
    return channels
  }

  async getVideos(channel: YtChannel, ids: string[]) {
    // ensure have some left api quota
    if (!(await this.canCallYoutube())) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left for signup. Please try again later.'
      )
    }

    // get videos from api
    const videos = await this.decorated.getVideos(channel, ids)
    return videos
  }

  async getAllVideos(channel: YtChannel) {
    // ensure have some left api quota
    if (!(await this.canCallYoutube())) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left. Please try again later.'
      )
    }

    // get videos from api
    const videos = await this.decorated.getAllVideos(channel)
    return videos
  }

  downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl> {
    return this.decorated.downloadVideo(videoUrl, outPath)
  }

  private async canCallYoutube(): Promise<boolean> {
    if (this.quotaMonitoringClient) {
      const quotaUsage = await this.getQuotaUsage()
      const quotaLimit = await this.getQuotaLimit()
      return (
        (quotaUsage * 100) / quotaLimit <
        (this.config.youtube.maxAllowedQuotaUsageInPercentage || this.DEFAULT_MAX_ALLOWED_QUOTA_USAGE)
      )
    }
    return true
  }
}

export const YoutubeApi = {
  create(config: ReadonlyConfig): IYoutubeApi {
    return new QuotaMonitoringClient(new YoutubeClient(config), config)
  },
}
