import { MetricServiceClient } from '@google-cloud/monitoring'
import { youtube_v3 } from '@googleapis/youtube'
import { OAuth2Client } from 'google-auth-library'
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { GaxiosError } from 'googleapis-common'
import { parse, toSeconds } from 'iso8601-duration'
import _ from 'lodash'
import moment from 'moment-timezone'
import { FetchError } from 'node-fetch'
import path from 'path'
import { StatsRepository } from '../../repository'
import { ReadonlyConfig, WithRequired, formattedJSON } from '../../types'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtUser, YtVideo } from '../../types/youtube'
import { YtDlpClient } from './openApi'

import Schema$Video = youtube_v3.Schema$Video
import Schema$Channel = youtube_v3.Schema$Channel

interface IDataApiV3 {
  getUserFromCode(code: string, youtubeRedirectUri: string): Promise<YtUser>
  getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>): Promise<YtChannel>
  getVerifiedChannel(
    user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>
  ): Promise<{ channel: YtChannel; errors: YoutubeApiError[] }>
  getVideos(channel: YtChannel, ids: string[]): Promise<YtVideo[]>
}

interface IQuotaMonitoringDataApiV3 extends IDataApiV3 {
  getQuotaUsage(): Promise<number>
  getQuotaLimit(): Promise<number>
}

class DataApiV3 implements IDataApiV3 {
  private config: ReadonlyConfig
  readonly ytdlpClient: YtDlpClient

  constructor(config: ReadonlyConfig) {
    this.config = config
    this.ytdlpClient = new YtDlpClient(config)
  }

  private getAuth(youtubeRedirectUri?: string) {
    if (this.config.youtube.apiMode !== 'api-free') {
      return new OAuth2Client({
        clientId: this.config.youtube.api.clientId,
        clientSecret: this.config.youtube.api.clientSecret,
        redirectUri: youtubeRedirectUri,
      })
    } else {
      throw new Error('getAuth: Youtube API is not enabled')
    }
  }

  private getYoutube(accessToken?: string, refreshToken?: string) {
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

    const channel = await this.getChannel({
      id: tokenInfo.sub,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
    })

    const user: YtUser = {
      id: channel.id,
      email: tokenInfo.email,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      authorizationCode: code,
      joystreamMemberId: undefined,
      youtubeVideoUrl: undefined,
      createdAt: new Date(),
    }
    return user
  }

  async getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>) {
    const yt = this.getYoutube(user.accessToken, user.refreshToken)

    const channelResponse = await yt.channels
      .list({
        part: ['snippet', 'contentDetails', 'statistics', 'brandingSettings'],
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
    const {
      minimumSubscribersCount,
      minimumVideosCount,
      minimumChannelAgeHours,
      minimumVideoAgeHours,
      minimumVideosPerMonth,
      monthsToConsider,
    } = this.config.creatorOnboardingRequirements

    const channel = await this.getChannel(user)
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

    // at least 'minimumVideosCount' videos should be 'minimumVideoAgeHours' old
    const videoCreationTimeCutoff = new Date()
    videoCreationTimeCutoff.setHours(videoCreationTimeCutoff.getHours() - minimumVideoAgeHours)

    // filter all videos that are older than 'minimumVideoAgeHours'
    const oldVideos = (await this.ytdlpClient.getVideosIDs(channel, minimumVideosCount, 'last')).filter(
      (v) => v.publishedAt < videoCreationTimeCutoff
    )
    if (oldVideos.length < minimumVideosCount) {
      errors.push(
        new YoutubeApiError(
          ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_VIDEOS,
          `Channel ${channel.id} with ${oldVideos.length} videos does not meet Youtube ` +
            `Partner Program requirement of at least ${minimumVideosCount} videos, each ${(
              minimumVideoAgeHours / 720
            ).toPrecision(2)} month old`,
          channel.statistics.videoCount,
          minimumVideosCount
        )
      )
    }

    // TODO: make configurable (currently hardcoded to latest 1 month)
    // at least 'minimumVideosPerMonth' should be there for 'monthsToConsider'
    const nMonthsAgo = new Date()
    nMonthsAgo.setMonth(nMonthsAgo.getMonth() - 1)

    const newVideos = (await this.ytdlpClient.getVideosIDs(channel, minimumVideosPerMonth)).filter(
      (v) => v.publishedAt > nMonthsAgo
    )
    if (newVideos.length < minimumVideosPerMonth) {
      errors.push(
        new YoutubeApiError(
          ExitCodes.YoutubeApi.CHANNEL_CRITERIA_UNMET_NEW_VIDEOS_REQUIREMENT,
          `Channel ${channel.id} videos does not meet Youtube Partner Program ` +
            `requirement of at least ${minimumVideosPerMonth} video per ` +
            `month, posted over the last ${monthsToConsider} months`,
          channel.statistics.videoCount,
          minimumVideosPerMonth
        )
      )
    }

    // Channel should be at least 'minimumChannelAgeHours' old
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

  private async iterateVideos(youtube: youtube_v3.Youtube, channel: YtChannel, ids: string[]) {
    let videos: YtVideo[] = []

    // Youtube API allows to fetch up to 50 videos per request
    const idsChunks = _.chunk(ids, 50)

    for (const idsChunk of idsChunks) {
      const videosPage = idsChunk.length
        ? (
            await youtube.videos
              .list({
                id: idsChunk,
                part: [
                  'id',
                  'status',
                  'snippet',
                  'statistics',
                  'fileDetails',
                  'contentDetails',
                  'liveStreamingDetails',
                ],
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

  private mapChannels(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>, channels: Schema$Channel[]) {
    return channels.map<YtChannel>(
      (channel) =>
        <YtChannel>{
          id: channel.id,
          description: channel.snippet?.description,
          title: channel.snippet?.title,
          customUrl: channel.snippet?.customUrl,
          userAccessToken: user.accessToken,
          userRefreshToken: user.refreshToken,
          thumbnails: {
            default: channel.snippet?.thumbnails?.default?.url,
            medium: channel.snippet?.thumbnails?.medium?.url,
            high: channel.snippet?.thumbnails?.high?.url,
          },
          statistics: {
            viewCount: parseInt(channel.statistics?.viewCount ?? '0'),
            subscriberCount: parseInt(channel.statistics?.subscriberCount ?? '0'),
            videoCount: parseInt(channel.statistics?.videoCount ?? '0'),
            commentCount: parseInt(channel.statistics?.commentCount ?? '0'),
          },
          historicalVideoSyncedSize: 0,
          bannerImageUrl: channel.brandingSettings?.image?.bannerExternalUrl,
          uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
          language: channel.snippet?.defaultLanguage,
          publishedAt: channel.snippet?.publishedAt,
          performUnauthorizedSync: false,
          shouldBeIngested: true,
          allowOperatorIngestion: true,
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
                default: video.snippet?.thumbnails?.default?.url,
              },
              url: `https://youtube.com/watch?v=${video.id}`,
              publishedAt: video.snippet?.publishedAt,
              createdAt: new Date(),
              category: channel.videoCategoryId,
              languageIso: channel.joystreamChannelLanguageIso,
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
        .filter(
          (v) =>
            v.uploadStatus === 'processed' &&
            v.privacyStatus === 'public' &&
            v.liveBroadcastContent === 'none' &&
            v.ytRating === undefined
        )
    )
  }
}

export class QuotaMonitoringDataApiV3 implements IQuotaMonitoringDataApiV3 {
  private quotaMonitoringClient: MetricServiceClient | undefined
  private googleCloudProjectId: string
  private DEFAULT_MAX_ALLOWED_QUOTA_USAGE = 95 // 95%
  private dataApiV3: IDataApiV3

  constructor(private config: ReadonlyConfig, private statsRepo: StatsRepository) {
    this.dataApiV3 = new DataApiV3(config)

    if (this.config.youtube.apiMode !== 'api-free') {
      // Use the client id to get the google cloud project id
      this.googleCloudProjectId = this.config.youtube.api?.clientId.split('-')[0]

      // if we have a key file path, we use it to authenticate with the google cloud monitoring api
      if (this.config.youtube.api.adcKeyFilePath) {
        this.quotaMonitoringClient = new MetricServiceClient({
          keyFile: path.resolve(this.config.youtube.api?.adcKeyFilePath),
        })
      }
    } else {
      throw new Error(`QuotaMonitoringDataApiV3: Youtube API is not enabled`)
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
    const quotaLimit = Number((timeSeries![0][0]?.points || [])[0]?.value?.int64Value)
    return _.isFinite(quotaLimit) ? quotaLimit : Number.MAX_SAFE_INTEGER
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
      quotaUsage = _.sumBy(data?.points, (point) => {
        return Number(point.value?.int64Value)
      })
    })

    return quotaUsage
  }

  getUserFromCode(code: string, youtubeRedirectUri: string) {
    return this.dataApiV3.getUserFromCode(code, youtubeRedirectUri)
  }

  async getVerifiedChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>) {
    // These is no api quota check for this operation, as we allow untracked access to channel verification/signup endpoint.
    const verifiedChannel = await this.dataApiV3.getVerifiedChannel(user)

    // increase used quota count by 1 because only one page is returned
    await this.increaseUsedQuota({ signupQuotaIncrement: 1 })

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
    const channels = await this.dataApiV3.getChannel(user)

    // increase used quota count by 1 because only one page is returned
    await this.increaseUsedQuota({ syncQuotaIncrement: 1 })

    return channels
  }

  async getVideos(channel: YtChannel, ids: string[]) {
    // ensure have some left api quota
    if (!(await this.canCallYoutube())) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left. Please try again later.'
      )
    }

    // get videos from api
    const videos = await this.dataApiV3.getVideos(channel, ids)

    // increase used quota count, 1 api call is being used per page of 50 videos
    await this.increaseUsedQuota({ syncQuotaIncrement: Math.ceil(videos.length / 50) })

    return videos
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

  private async canCallYoutube(): Promise<boolean> {
    if (this.config.youtube.apiMode !== 'api-free' && this.quotaMonitoringClient) {
      const quotaUsage = await this.getQuotaUsage()
      const quotaLimit = await this.getQuotaLimit()
      return (
        (quotaUsage * 100) / quotaLimit <
        (this.config.youtube.api?.maxAllowedQuotaUsageInPercentage || this.DEFAULT_MAX_ALLOWED_QUOTA_USAGE)
      )
    }
    return true
  }
}
