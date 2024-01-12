import axios from 'axios'
import { ReadonlyConfig } from '../../types'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtUser } from '../../types/youtube'
import { YtDlpClient } from './openApi'

type OperationalApiChannelListResponse = {
  kind: string
  etag: string
  items: Channel[]
}

type Channel = {
  kind: string
  etag: string
  id: string
  status: any
  countryChannelId: string
  about: {
    stats: {
      joinedDate: number
      viewCount: number
      subscriberCount: number
      videoCount: number
    }
    description: string
    details: {
      location: string
    }
    handle: string
  }
  snippet: {
    avatar: Image[]
    banner: Image[]
  }
}

type Image = {
  url: string
}

const YT_VIDEO_TITLE_REQUIRED_FOR_SIGNUP = `I want to be in YPP`

export class YoutubeOperationalApi {
  private baseUrl: string
  readonly ytdlpClient: YtDlpClient

  constructor(private config: ReadonlyConfig) {
    this.ytdlpClient = new YtDlpClient(config)
    this.baseUrl = config.youtube.operationalApi.url
  }

  async getChannel(channelId: string): Promise<YtChannel> {
    try {
      const [ytdlpApiResponse, operationalApiResponse] = await Promise.all([
        this.ytdlpClient.getChannel(channelId),
        axios.get(`${this.baseUrl}/channels?part=status,about,snippet&id=${channelId}`),
      ])

      return this.mapChannel(
        (operationalApiResponse.data as OperationalApiChannelListResponse).items[0],
        ytdlpApiResponse
      )
    } catch (error) {
      throw error
    }
  }

  async getVerifiedChannel(user: YtUser): Promise<{ channel: YtChannel; errors: YoutubeApiError[] }> {
    const {
      minimumSubscribersCount,
      minimumVideosCount,
      minimumChannelAgeHours,
      minimumVideoAgeHours,
      minimumVideosPerMonth,
      monthsToConsider,
    } = this.config.creatorOnboardingRequirements

    const errors: YoutubeApiError[] = []

    const video = await this.ytdlpClient.getVideoFromUrl(user.youtubeVideoUrl!)

    if (video.privacyStatus !== 'unlisted') {
      errors.push(
        new YoutubeApiError(
          ExitCodes.YoutubeApi.VIDEO_PRIVACY_STATUS_NOT_UNLISTED,
          `Video ${video.id} is not unlisted`,
          video.privacyStatus,
          'unlisted'
        )
      )
    }

    if (video.title !== YT_VIDEO_TITLE_REQUIRED_FOR_SIGNUP) {
      errors.push(
        new YoutubeApiError(
          ExitCodes.YoutubeApi.VIDEO_TITLE_NOT_MATCHING,
          `Video ${video.id} title is not matching`,
          video.title,
          YT_VIDEO_TITLE_REQUIRED_FOR_SIGNUP
        )
      )
    }

    const channel = await this.getChannel(video.channelId)
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

  private mapChannel(channel: Channel, ytdlpApiResponse: { title: string }): YtChannel {
    return <YtChannel>{
      id: channel.id,
      description: channel.about.description,
      title: ytdlpApiResponse.title,
      customUrl: channel.about.handle,
      thumbnails: {
        default: channel.snippet?.avatar[0].url,
        medium: channel.snippet?.avatar[1].url,
        high: channel.snippet?.avatar[2].url,
      },
      statistics: {
        viewCount: channel.about.stats.viewCount,
        subscriberCount: channel.about.stats.subscriberCount,
        videoCount: channel.about.stats.videoCount,
        commentCount: 0,
      },
      historicalVideoSyncedSize: 0,
      bannerImageUrl: channel.snippet.banner[0]?.url,
      //   language: channel.snippet?.defaultLanguage, // TODO: find workaround for channel
      publishedAt: new Date(channel.about.stats?.joinedDate).toISOString(),
      performUnauthorizedSync: false,
      shouldBeIngested: true,
      allowOperatorIngestion: true,
      yppStatus: 'Unverified',
      createdAt: new Date(),
      lastActedAt: new Date(),
      phantomKey: 'phantomData',
    }
  }
}
