import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import { exec } from 'child_process'
import _ from 'lodash'
import moment from 'moment-timezone'
import pkgDir from 'pkg-dir'
import { promisify } from 'util'
import ytdl from 'youtube-dl-exec'
import { ReadonlyConfig } from '../../types'
import { YtChannel, YtDlpFlatPlaylistOutput, YtDlpVideoOutput, YtUser, YtVideo } from '../../types/youtube'

export interface IOpenYTApi {
  getChannel(channelId: string): Promise<{ id: string; title: string; description: string }>
  getVideoFromUrl(videoUrl: string): Promise<YtVideo>
  getVideos(channel: YtChannel, ids: string[]): Promise<YtVideo[]>
  downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl>
  getUserAndVideoFromVideoUrl(videoUrl: string): Promise<{ user: YtUser; video: YtVideo }>
}

export class YtDlpClient implements IOpenYTApi {
  private ytdlpPath: string
  private exec

  constructor(private config: ReadonlyConfig) {
    this.exec = promisify(exec)
    this.ytdlpPath = `${pkgDir.sync(__dirname)}/node_modules/youtube-dl-exec/bin/yt-dlp`
  }

  async getChannel(channelId: string): Promise<{ id: string; title: string; description: string }> {
    // "-I :0" is used to not fetch any of the videos of the channel but only it's metadata
    const output = (
      await this.exec(`${this.ytdlpPath} --skip-download -J https://www.youtube.com/channel/${channelId} -I :0`)
    ).stdout

    return JSON.parse(output) as { id: string; title: string; description: string }
  }

  async getVideoFromUrl(videoUrl: string): Promise<YtVideo> {
    const { stdout } = await this.exec(`${this.ytdlpPath} -J ${videoUrl}`)
    const output = JSON.parse(stdout) as YtDlpVideoOutput
    return this.mapVideo(output)
  }

  async getUserAndVideoFromVideoUrl(videoUrl: string): Promise<{ user: YtUser; video: YtVideo }> {
    const video = await this.getVideoFromUrl(videoUrl)

    const user: YtUser = {
      id: video.channelId,
      youtubeVideoUrl: videoUrl,
      createdAt: new Date(),
    }
    return { user, video }
  }

  async downloadVideo(videoUrl: string, outPath: string): ReturnType<typeof ytdl> {
    const response = await ytdl(videoUrl, {
      noWarnings: true,
      printJson: true,
      format: 'bv[height<=1080][ext=mp4]+ba[ext=m4a]/bv[height<=1080][ext=webm]+ba[ext=webm]/best[height<=1080]',
      output: `${outPath}/%(id)s.%(ext)s`,
      ffmpegLocation: ffmpegInstaller.path,
      proxy: this.config.proxy?.url,
    })
    return response
  }

  async getVideos(channel: YtChannel, ids: string[]): Promise<YtVideo[]> {
    const videosMetadata: YtDlpVideoOutput[] = []
    const idsChunks = _.chunk(ids, 50)

    for (const idsChunk of idsChunks) {
      const videosMetadataChunk = await Promise.all(
        idsChunk.map(async (id) => {
          const { stdout } = await this.exec(`${this.ytdlpPath} -J https://www.youtube.com/watch?v=${id}`)
          return JSON.parse(stdout) as YtDlpVideoOutput
        })
      )
      videosMetadata.push(...videosMetadataChunk)
    }

    return this.mapVideos(videosMetadata, channel)
  }

  private mapVideo(video: YtDlpVideoOutput, channel?: YtChannel): YtVideo {
    return <YtVideo>{
      id: video?.id,
      description: video?.description || '',
      title: video?.title,
      channelId: video?.channel_id,
      thumbnails: {
        high: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
        medium: `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`,
        default: `https://i.ytimg.com/vi/${video.id}/default.jpg`,
      },
      url: `https://youtube.com/watch?v=${video.id}`,
      publishedAt: moment(video?.upload_date, 'YYYYMMDD').toDate().toISOString(),
      createdAt: new Date(),
      category: channel?.videoCategoryId,
      languageIso: channel?.joystreamChannelLanguageIso,
      privacyStatus: video?.availability || 'public',
      liveBroadcastContent:
        video?.live_status === 'is_upcoming' ? 'upcoming' : video?.live_status === 'is_live' ? 'live' : 'none',
      license: video?.license === 'Creative Commons Attribution license (reuse allowed)' ? 'creativeCommon' : 'youtube',
      duration: video?.duration,
      container: video?.ext,
      viewCount: video?.view_count || 0,
      state: 'New',
    }
  }

  private mapVideos(videosMetadata: YtDlpVideoOutput[], channel: YtChannel): YtVideo[] {
    return videosMetadata
      .map((video) => this.mapVideo(video, channel))
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
                videos.push({ id: video.id, publishedAt: new Date(video.timestamp * 1000) /** Convert UNIX to date */ })
              })
            } else {
              videos.push({
                id: category.id,
                publishedAt: new Date(category.timestamp * 1000) /** Convert UNIX to date */,
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
