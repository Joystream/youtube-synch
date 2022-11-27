// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { User, Channel, IngestChannel, Stats, Video, VideoEvent, ChannelSpotted } from '@youtube-sync/domain'
import { ChannelsRepository, statsRepository, VideosRepository } from './database'
import { IUploadService, mapTo, MessageBus, IYoutubeClient, UsersRepository } from '..'
import { JoystreamUploadService } from './uploadService'
import { Frequency } from './frequency'

const DailyQuota = 10000

export class SyncService {
  private _uploader: IUploadService
  private channelsRepository: ChannelsRepository
  private usersRepository: UsersRepository
  private videosRepository: VideosRepository

  constructor(private youtube: IYoutubeClient, private bus: MessageBus) {
    this._uploader = new JoystreamUploadService(youtube)
    this.channelsRepository = new ChannelsRepository()
    this.usersRepository = new UsersRepository()
    this.videosRepository = new VideosRepository()
  }

  async startIngestionFor(frequencies: Frequency[]) {
    // get all channels that need to be ingested
    const channelsToBeIngested = await this.channelsRepository.scan('frequency', (s) =>
      s.in(frequencies).filter('shouldBeIngested').eq(true)
    )

    // create channels event
    const channelsEvent = channelsToBeIngested.map((ch) => new IngestChannel(ch, Date.now()))

    // publish events
    return this.bus.publishAll(channelsEvent, 'channelEvents')
  }

  async ingestChannels(user: User) {
    // ensure have some api quota
    if (!(await this.canCallYoutube())) {
      return []
    }

    // fetch all channels of user from youtube API
    const channels = await this.youtube.getChannels(user)

    // save channels
    await this.channelsRepository.upsertAll(channels)

    // update user channels count
    this.usersRepository.save(user)

    // create channel events
    const channelEvents = channels.map((ch) => new ChannelSpotted(ch, Date.now()))

    // publish events
    return this.bus.publishAll(channelEvents, 'channelEvents')
  }

  async ingestAllVideos(channel: Channel, top: number) {
    // ensure have some api quota
    if (!(await this.canCallYoutube())) return []

    // get all videos of the channel
    const allVideos = await this.youtube.getAllVideos(channel, top)

    // get new videos
    const newVideos = await this.onlyNewVideos(channel, allVideos)

    // save not videos tp DB
    this.videosRepository.upsertAll(newVideos)

    // create user events
    const videoEvents = newVideos.map((v) => new VideoEvent('New', v.id, v.channelId, Date.now()))

    // publish events
    return this.bus.publishAll(videoEvents, 'videoEvents')
  }

  async uploadVideo(channelId: string, videoId: string) {
    return this._uploader.uploadVideo(channelId, videoId)
  }

  private async onlyNewVideos(channel: Channel, videos: Video[]): Promise<Video[]> {
    const existingVideos = await this.videosRepository.query({ channelId: channel.id }, (q) => q)
    const set = new Set(existingVideos.map((v) => v.id))
    return videos //.filter((v) => !set.has(v.id))
  }

  private async canCallYoutube(): Promise<boolean> {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    let statsDoc = await statsRepository().get({
      partition: 'stats',
      date: today.setUTCHours(0, 0, 0, 0),
    })
    if (!statsDoc) {
      statsDoc = await statsRepository().update({
        partition: 'stats',
        date: today.setUTCHours(0, 0, 0, 0),
        quotaUsed: 0,
      })
    }
    const stats = mapTo<Stats>(statsDoc)
    return stats.quotaUsed < DailyQuota
  }
}
