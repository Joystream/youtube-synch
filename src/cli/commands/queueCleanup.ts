import { flags } from '@oclif/command'
import DefaultCommandBase from '../base/default'
import { DynamodbService } from '../../repository'
import { Config } from '../../types'
import { IYoutubeApi, YoutubeApi, YouTubeVideoData } from '../../services/youtube/api'
import { toSeconds, parse } from 'iso8601-duration'
import fs from 'fs'
import _ from 'lodash'
import { YtVideo } from '../../types/youtube'
import assert from 'assert'

type VideoKeys = { id: string, channelId: string }

export default class QueueCleanup extends DefaultCommandBase {
  static description = `Checks the current sync queue and cleans up invalid/inaccessible videos (removing them from db).`

  static flags = {
    exportPath: flags.string({
      description: 'Path to export the data from YouTube API (in json format)',
      required: false
    }),
    importPath: flags.string({
      description: 'Path to exported YouTube API data (used to reduce the number of YouTube API calls if some data is already available)',
      required: false
    }),
    removedVideosPath: flags.string({
      description: 'Path to store information about removed videos.',
      default: 'removedVideos.json'
    }),
    ...DefaultCommandBase.flags,
  }

  async getYouTubeVideos(youtubeApi: IYoutubeApi, ids: string[]): Promise<YouTubeVideoData[]> {
    const { exportPath, importPath } = this.parse(QueueCleanup).flags

    let knownVideos: YouTubeVideoData[] = []
    if (importPath) {
      knownVideos = JSON.parse(fs.readFileSync(importPath).toString())
      this.log(`Imported ${knownVideos.length} videos.`)
      ids = _.difference(ids, knownVideos.map(v => v.id))
    }

    this.log(`Missing YouTube data of ${ids.length} videos.`)

    let fetchedVideos: YouTubeVideoData[] = []
    if (ids.length) {
      await this.requireConfirmation(
        `${Math.ceil(ids.length / 50)} YouTube API calls will be executed, do you wish to continue?`,
        false
      )

      this.log('Fetching data from YouTube...')
      fetchedVideos = await youtubeApi.getYoutubeVideosByIds(ids)
      this.log(`Fetched data of ${fetchedVideos.length} videos from YouTube.`)
    }

    const videos = knownVideos.concat(fetchedVideos)

    if (exportPath) {
      fs.writeFileSync(exportPath, JSON.stringify(videos))
      this.log(`Exported ${videos.length} videos.`)
    }

    return videos
  }

  async run(): Promise<void> {
    const config = this.appConfig as Config
    const dynamodbService = new DynamodbService(config.aws, false)
    const youtubeApi = YoutubeApi.create(config, dynamodbService.repo.stats, this.logging)
    const { removedVideosPath } = this.parse(QueueCleanup).flags

    this.log('Loading unsynced videos...')
    let unsyncedVideos = await dynamodbService.videos.getAllUnsyncedVideos(['channelId', 'id'])
    const channelIds = _.uniq(unsyncedVideos.map(v => v.channelId))
    this.log(`Found ${unsyncedVideos.length} unsynced videos in ${channelIds.length} channels.`)

    this.log('Checking syncable channels...')
    const channelIdBatches = _.chunk(channelIds, 50)
    const syncableChannels = new Set<string>()
    for (const batch of channelIdBatches) { 
      await Promise.all(batch.map(async (channelId) => {
        const channel = await dynamodbService.channels.getById(
          channelId,
          ['shouldBeIngested', 'allowOperatorIngestion']
        )
        if (channel.shouldBeIngested && channel.allowOperatorIngestion) {
          syncableChannels.add(channelId)
        }
      }))
    }
    this.log('Syncable channels set generated.')

    // Filter out videos that should not be synced
    this.log('Filtering videos...')
    const queueVideos = unsyncedVideos.filter(v => syncableChannels.has(v.channelId))
    this.log(`Found ${queueVideos.length} videos in queue.`)

    const videoIds: string[] = queueVideos.map(v => v.id)
    const ytVideos = await this.getYouTubeVideos(youtubeApi, videoIds)
    const ytVideoById = new Map(ytVideos.map(v => [v.id, v]))

    const videosByStatus = {
      missing: [] as VideoKeys[],
      unprocessed: [] as VideoKeys[],
      private: [] as VideoKeys[],
      live: [] as VideoKeys[],
      ageRestricted: [] as VideoKeys[],
      regionRestricted: [] as VideoKeys[],
      tooLong: [] as VideoKeys[],
      missingData: [] as VideoKeys[]
    }

    // const allowed: string[] = []
    // const blocked: string [] = []
    queueVideos.map(videoKeys => {
      const v = ytVideoById.get(videoKeys.id)
      assert(v, `Missing YouTube video: ${videoKeys.id}`)
      if (v.missing) {
        videosByStatus.missing.push(videoKeys)
      }
      else if (v.status && v.snippet && v.contentDetails && v.snippet.channelId) {
        if (v.status.uploadStatus !== 'processed') {
          videosByStatus.unprocessed.push(videoKeys)
        }
        if (v.status.privacyStatus !== 'public') {
          videosByStatus.private.push(videoKeys)
        }
        if (v.snippet.liveBroadcastContent !== 'none') {
          videosByStatus.live.push(videoKeys)
        }
        if (v.contentDetails.contentRating?.ytRating !== undefined) {
          videosByStatus.ageRestricted.push(videoKeys)
        }
        if (v.contentDetails.regionRestriction?.allowed || v.contentDetails.regionRestriction?.blocked?.length) {
          // allowed.push(...v.contentDetails.regionRestriction.allowed || [])
          // blocked.push(...v.contentDetails.regionRestriction.blocked || [])
          videosByStatus.regionRestricted.push(videoKeys)
        }
        const { maxVideoDuration } = config.sync.limits || {}
        const videoDuration = toSeconds(parse(v.contentDetails.duration ?? 'PT0S'))
        if (maxVideoDuration && videoDuration > maxVideoDuration) {
          videosByStatus.tooLong.push(videoKeys)
        }
      } else {
        const props = ['status', 'snippet', 'contentDetails'] as const
        const missingProps: string[] = []
        for (const prop of props) {
          if (!v[prop]) {
            missingProps.push(prop)
          }
        }
        this.log(`Missing some data from video ${v.id}: ${missingProps.join(', ')}`)
        videosByStatus.missingData.push(videoKeys)
      }
    })
    

    console.log(Object.entries(videosByStatus).map(([status, vids]) => [status, vids.length]))

    const videosToRemove = [
      ...videosByStatus.ageRestricted,
      ...videosByStatus.live,
      ...videosByStatus.missing,
      ...videosByStatus.private,
      ...videosByStatus.tooLong,
      ...videosByStatus.unprocessed
    ]
    this.log(`Will remove ${videosToRemove.length} videos...`)
    await this.requireConfirmation(`Are you sure you want to remove ${videosToRemove.length} videos?`, false)

    this.log(`Creating backup of videos to remove...`)
    const videosBackup: { dbVideo: YtVideo, ytVideo?: YouTubeVideoData }[] = [] 
    for (const videosBatch of _.chunk(videosToRemove, 50)) {
      await Promise.all(videosBatch.map(async (v) => {
        // TODO: Use id index instead?
        const dbVideo = await dynamodbService.videos.get(v.channelId, v.id)
        const ytVideo = ytVideoById.get(v.id)
        if (!dbVideo) {
          throw new Error(`Db video not found: ${v.id}`)
        }
        videosBackup.push({ dbVideo, ytVideo })
      }))
    } 
    assert(videosBackup.length === videosToRemove.length)
    fs.writeFileSync(removedVideosPath, JSON.stringify(videosBackup))
    this.log(`Backup created.`)

    this.log(`Removing ${videosToRemove.length} broken videos...`)
    const videoBatches = _.chunk(videosBackup, 50)
    for (const batch of videoBatches) {
      await Promise.all(batch.map(({ dbVideo }) => dynamodbService.videos.delete(dbVideo)))
    }
    this.log(`${videosToRemove.length} videos successfully removed!`)
  }
}
