import _ from 'lodash'
import { youtube_v3 } from '@googleapis/youtube'
import Schema$Video = youtube_v3.Schema$Video
import { loadConfig } from './config'
import { parse, toSeconds } from 'iso8601-duration'

export const ytApi = new youtube_v3.Youtube({ auth: loadConfig('YT_API_KEY') })

export async function getVideoDurationsMap(ids: string[]): Promise<Map<string, number>> {
  const durations: Map<string, number> = new Map()
  const idBatches = _.chunk(ids, 50)
  for (const idsBatch of idBatches) {
    const nextPage = await ytApi.videos.list({
      id: idsBatch,
      part: ['id', 'status', 'snippet', 'contentDetails'],
      maxResults: 50
    })
    nextPage.data.items
      ?.filter((v): v is Schema$Video & { id: string } =>
        !!(
          v.id &&
          v.status?.uploadStatus === 'processed' &&
          v.status.privacyStatus === 'public' &&
          v.snippet?.liveBroadcastContent === 'none' &&
          v.contentDetails?.contentRating?.ytRating === undefined
        )
      )
      .forEach((v) => {
        durations.set(v.id, toSeconds(parse(v.contentDetails?.duration ?? 'PT0S')))
      })
  }
  
  return durations
}