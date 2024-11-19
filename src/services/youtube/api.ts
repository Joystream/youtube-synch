import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { MetricServiceClient } from '@google-cloud/monitoring'
import { youtube_v3 } from '@googleapis/youtube'
import { exec } from 'child_process'
import { GetTokenResponse } from 'google-auth-library/build/src/auth/oauth2client'
import { GaxiosError, OAuth2Client } from 'googleapis-common'
import _ from 'lodash'
import moment from 'moment-timezone'
import { FetchError } from 'node-fetch'
import path from 'path'
import pkgDir from 'pkg-dir'
import { promisify } from 'util'
import ytdl, { create } from 'youtube-dl-exec'
import { StatsRepository } from '../../repository'
import { ReadonlyConfig, WithRequired, formattedJSON } from '../../types'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtDlpFlatPlaylistOutput, YtDlpVideoOutput, YtUser, YtVideo } from '../../types/youtube'

import Schema$Channel = youtube_v3.Schema$Channel
import Schema$PlaylistItem = youtube_v3.Schema$PlaylistItem

export interface IOpenYTApi {
  ensureChannelExists(channelId: string): Promise<string>
  getVideos(channel: YtChannel, ids: YtDlpFlatPlaylistOutput): Promise<YtVideo[]>
}

const YT_DLP_PATH = path.join(
  path.dirname(require.resolve('youtube-dl-exec/package.json')),
  'bin',
  'yt-dlp'
)

export class YtDlpClient implements IOpenYTApi {
  private ytdlpPath: string
  private exec

  constructor() {
    this.exec = promisify(exec)
    this.ytdlpPath = `${pkgDir.sync(__dirname)}/node_modules/youtube-dl-exec/bin/yt-dlp`
  }

  async ensureChannelExists(channelId: string): Promise<string> {
    // "-I :1" is used to only fetch at most one video of the channel if it exists.
    return (await this.exec(`${this.ytdlpPath} --print channel_id https://www.youtube.com/channel/${channelId} -I :1`))
      .stdout
  }

  async getVideos(channel: YtChannel, ids: YtDlpFlatPlaylistOutput): Promise<YtVideo[]> {
    const videosMetadata: YtDlpVideoOutput[] = []
    const idsChunks = _.chunk(ids, 50)

    for (const idsChunk of idsChunks) {
      const videosMetadataChunk = (
        await Promise.all(
          idsChunk.map(async ({ id, isShort }) => {
            try {
              const { stdout } = await this.exec(`${this.ytdlpPath} -J https://www.youtube.com/watch?v=${id}`)
              return { ...JSON.parse(stdout), isShort } as YtDlpVideoOutput
            } catch (err) {
              if (
                err instanceof Error &&
                (err.message.includes(`This video is age-restricted`) ||
                  err.message.includes(`Join this channel to get access to members-only content`))
              ) {
                return
              }
              if (
                err instanceof Error && err.message.includes(`This live event will begin in a few moments`)
              ) {
                return
              }
              throw err
            }
          })
        )
      ).filter((v) => v) as YtDlpVideoOutput[]
      videosMetadata.push(...videosMetadataChunk)
    }

    return this.mapVideos(videosMetadata, channel)
  }

  private mapVideos(videosMetadata: YtDlpVideoOutput[], channel: YtChannel): YtVideo[] {
    return videosMetadata
      .map(
        (video) =>
          <YtVideo>{
            id: video?.id,
            description: video?.description || '',
            title: video?.title,
            channelId: video?.channel_id,
            thumbnails: {
              high: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
              medium: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`,
              standard: `https://i.ytimg.com/vi/${video.id}/sddefault.jpg`,
              default: `https://i.ytimg.com/vi/${video.id}/default.jpg`,
            },
            url: `https://youtube.com/watch?v=${video.id}`,
            publishedAt: moment(video?.upload_date, 'YYYYMMDD').toDate().toISOString(),
            createdAt: new Date(),
            category: channel.videoCategoryId,
            languageIso: channel.joystreamChannelLanguageIso,
            privacyStatus: video?.availability || 'public',
            liveBroadcastContent:
              video?.live_status === 'is_upcoming' ? 'upcoming' : video?.live_status === 'is_live' ? 'live' : 'none',
            license:
              video?.license === 'Creative Commons Attribution license (reuse allowed)' ? 'creativeCommon' : 'youtube',
            duration: video?.duration,
            container: video?.ext,
            isShort: video.isShort,
            viewCount: video?.view_count || 0,
            state: 'New',
          }
      )
      .filter((v) => v.privacyStatus === 'public' && v.liveBroadcastContent === 'none')
  }

  async getVideosIDs(
    channel: YtChannel,
    limit?: number,
    order?: 'first' | 'last',
    videoType: ('videos' | 'shorts' | 'streams')[] = ['videos', 'shorts'] // Excluding the live streams from syncing
  ): Promise<YtDlpFlatPlaylistOutput> {
    if (limit === undefined && order !== undefined) {
      throw new Error('Order should only be provided if limit is provided')
    }

    let limitOption = ''
    if (limit) {
      limitOption = !order || order === 'first' ? `-I :${limit}` : `-I -${limit}:-1`
    }

    const allVideos = await Promise.all(
      videoType.map(async (type) => {
        try {
          const { stdout } = await this.exec(
            `${this.ytdlpPath} --extractor-args "youtubetab:approximate_date" -J --flat-playlist ${limitOption} https://www.youtube.com/channel/${channel.id}/${type}`,
            { maxBuffer: Number.MAX_SAFE_INTEGER }
          )

          const videos: YtDlpFlatPlaylistOutput = []
          JSON.parse(stdout).entries.forEach((category: any) => {
            if (category.entries) {
              category.entries.forEach((video: any) => {
                videos.push({
                  id: video.id,
                  publishedAt: new Date(video.timestamp * 1000) /** Convert UNIX to date */,
                  isShort: type === 'shorts',
                })
              })
            } else {
              videos.push({
                id: category.id,
                publishedAt: new Date(category.timestamp * 1000) /** Convert UNIX to date */,
                isShort: type === 'shorts',
              })
            }
          })

          return videos
        } catch (err) {
          if (err instanceof Error && err.message.includes(`This channel does not have a ${type} tab`)) {
            return []
          }
          throw err
        }
      })
    )

    // Flatten all videos and then sort based on the `order` parameter
    const flattenedAndSortedVideos = allVideos.flat().sort((a, b) => {
      if (order === 'last') {
        return a.publishedAt.getTime() - b.publishedAt.getTime() // Oldest first
      } else {
        // Default to 'first' if order is not provided
        return b.publishedAt.getTime() - a.publishedAt.getTime() // Most recent first
      }
    })
    return limit ? flattenedAndSortedVideos.slice(0, limit) : flattenedAndSortedVideos
  }
}

export interface IYoutubeApi {
  ytdlpClient: YtDlpClient
  getUserFromCode(code: string, youtubeRedirectUri: string): Promise<YtUser>
  getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>): Promise<YtChannel>
  getVerifiedChannel(
    user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>
  ): Promise<{ channel: YtChannel; errors: YoutubeApiError[] }>
  getVideos(channel: YtChannel, top: number): Promise<YtVideo[]>
  downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl>
  getCreatorOnboardingRequirements(): ReadonlyConfig['creatorOnboardingRequirements']
}

export interface IQuotaMonitoringClient {
  getQuotaUsage(): Promise<number>
  getQuotaLimit(): Promise<number>
}

export class YoutubeClient implements IYoutubeApi {
  private config: ReadonlyConfig
  private proxyIdx = -1
  readonly ytdlpClient: YtDlpClient

  constructor(config: ReadonlyConfig) {
    this.config = config
    this.ytdlpClient = new YtDlpClient()
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
      joystreamMemberIds: [],
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

  async getVideos(channel: YtChannel, limit: number) {
    const yt = this.getYoutube(channel.userAccessToken, channel.userRefreshToken)
    try {
      return this.iterateVideos(yt, channel, limit)
    } catch (error) {
      throw new Error(`Failed to fetch videos for channel ${channel.title}. Error: ${error}`)
    }
  }

  getNextProxy() {
    const proxies = this.config.proxy?.urls
    if (!proxies) {
      return undefined
    }
    ++this.proxyIdx
    if (this.proxyIdx >= proxies.length) {
      this.proxyIdx = 0
    }
    return proxies[this.proxyIdx]
  }

  async downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl> {
    // Those flags are not currently recognized by `youtube-dl-exec`, but they are still
    // supported by yt-dlp (see: https://github.com/yt-dlp/yt-dlp)
    const proxy = this.getNextProxy()
    console.error(`Using proxy ${proxy} to download ${videoUrl}...`)

    const bandwidthLimit = this.config.sync.limits?.bandwidthPerDownload
    const executable = bandwidthLimit ?
      `trickle -s -d ${bandwidthLimit} -u ${bandwidthLimit} ${YT_DLP_PATH}`
      : YT_DLP_PATH
    const response = await create(executable)(videoUrl, {
      noWarnings: true,
      printJson: true,
      format: 'bv*[height<=1080][ext=mp4]+ba[ext=m4a]/bv*[height<=1080][ext=webm]+ba[ext=webm]/best[height<=1080]',
      output: `${outPath}/%(id)s.%(ext)s`,
      ffmpegLocation: ffmpegInstaller.path,
      // forceIpv6: true,
      limitRate: bandwidthLimit ?? `${bandwidthLimit}K`,
      bufferSize: '64K',
      retries: 0,
      proxy,
      // noWaitForVideo: true, // our version of youtube-dl-exec is not aware of this flag
    })
    return response
  }

  private async iterateVideos(youtube: youtube_v3.Youtube, channel: YtChannel, limit: number) {
    let videos: YtVideo[] = []
    let nextPageToken: string = ''

    do {
      const nextPage = await youtube.playlistItems
        .list({
          part: ['contentDetails', 'snippet', 'id', 'status'],
          playlistId: channel.uploadsPlaylistId,
          maxResults: 50,
          pageToken: nextPageToken ?? undefined,
        })
        .catch((err) => {
          if (err instanceof FetchError && err.code === 'ENOTFOUND') {
            throw new YoutubeApiError(ExitCodes.YoutubeApi.YOUTUBE_API_NOT_CONNECTED, err.message)
          }
          throw err
        })
        nextPageToken = nextPage.data.nextPageToken ?? ''

      const page = this.mapVideos(nextPage.data.items ?? [], channel)
      videos = [...videos, ...page]
      console.log('videos.length   <   max', videos.length, limit, channel.joystreamChannelId)
    } while (nextPageToken && videos.length < limit)
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

  private mapVideos(videos: Schema$PlaylistItem[], channel: YtChannel): YtVideo[] {
    return (
      videos
        .map(
          (video) =>
            <YtVideo>{
              id: video.contentDetails?.videoId,
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
              publishedAt: video.snippet?.publishedAt,
              createdAt: new Date(),
              category: channel.videoCategoryId,
              languageIso: channel.joystreamChannelLanguageIso,
              privacyStatus: video.status?.privacyStatus,
              ytRating: undefined,
              liveBroadcastContent: 'none',
              license: 'creativeCommon',
              duration: 0,
              container: '',
              uploadStatus: 'processed',
              viewCount: 0,
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

class QuotaMonitoringClient implements IQuotaMonitoringClient, IYoutubeApi {
  private quotaMonitoringClient: MetricServiceClient | undefined
  private googleCloudProjectId: string
  private DEFAULT_MAX_ALLOWED_QUOTA_USAGE = 95 // 95%
  private youtubeQuotaCache: { result: boolean; timestamp: number } | null = null
  private CACHE_DURATION = 30000 // 30 seconds in milliseconds

  constructor(private decorated: IYoutubeApi, private config: ReadonlyConfig, private statsRepo: StatsRepository) {
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

  /**
   * Implement IYoutubeApi interface
   **/

  get ytdlpClient() {
    return this.decorated.ytdlpClient
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

    // increase used quota count by 1 because only one page is returned
    await this.increaseUsedQuota({ signupQuotaIncrement: 1 })

    return verifiedChannel
  }

  async getChannel(user: Pick<YtUser, 'id' | 'accessToken' | 'refreshToken'>) {
    // ensure have some left api quota
    await this.ensureYoutubeQuota()

    // get channels from api
    const channels = await this.decorated.getChannel(user)

    // increase used quota count by 1 because only one page is returned
    await this.increaseUsedQuota({ syncQuotaIncrement: 1 })

    return channels
  }

  async getVideos(channel: YtChannel, top: number) {
    // ensure have some left api quota
    await this.ensureYoutubeQuota()

    // get videos from api
    const videos = await this.decorated.getVideos(channel, top)

    // increase used quota count, 1 api call is being used per page of 50 videos
    await this.increaseUsedQuota({ syncQuotaIncrement: Math.ceil(videos.length / 50) })

    return videos
  }

  downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl> {
    return this.decorated.downloadVideo(videoUrl, outPath)
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

  private async ensureYoutubeQuota() {
    const now = Date.now()
    if (this.youtubeQuotaCache && now - this.youtubeQuotaCache.timestamp < this.CACHE_DURATION) {
      if (!this.youtubeQuotaCache.result) {
        throw new YoutubeApiError(
          ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
          'No more quota left. Please try again later.'
        )
      }
    }

    const result = await this.canCallYoutube()
    this.youtubeQuotaCache = { result, timestamp: now }

    if (!result) {
      throw new YoutubeApiError(
        ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED,
        'No more quota left. Please try again later.'
      )
    }
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
  create(config: ReadonlyConfig, statsRepo: StatsRepository): IYoutubeApi {
    return new QuotaMonitoringClient(new YoutubeClient(config), config, statsRepo)
  },
}
