import { ChannelDto, VideoDto } from 'src/services/httpApi/dtos'

// Object with "name" and "value" properties, used for rendering simple CLI tables like:
// Total balance:   100 JOY
// Free balance:     50 JOY
export type NameValueObj = { name: string; value: string }

export type SyncMultipleChannelsInput = {
  channelUrl: string
  videosLimit: string
}[]

export type ChannelStatsRecord<AtlasDomain> = //AtlasDomain extends string
  Omit<
    {
      [K in keyof ChannelDto as K extends `${infer O}Id` ? `${O}IdOrUrl` : never]: K extends
        | 'joystreamChannelId'
        | 'referrerChannelId'
        ? AtlasDomain extends string
          ? `https://${AtlasDomain}/channel/${ChannelDto[K]}`
          : ChannelDto[K]
        : K extends 'youtubeChannelId'
        ? `https://www.youtube.com/channel/${ChannelDto[K]}`
        : ChannelDto[K]
    },
    'videoCategoryIdOrUrl'
  >

export type VideoStatsRecord<AtlasDomain> = Pick<VideoDto, 'url' | 'title' | 'category'> & {
  joystreamVideoIdOrUrl: AtlasDomain extends string ? `https://${AtlasDomain}/video/${string}` : string
}
