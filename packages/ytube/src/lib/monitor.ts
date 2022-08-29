// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { User, Channel, IngestChannel, Stats, Video, VideoEvent, ChannelSpotted, Result } from '@youtube-sync/domain'
import { ChannelsRepository, statsRepository, VideosRepository } from './database'
import { IUploadService, mapTo, MessageBus, IYoutubeClient, UsersRepository } from '..'
import { S3UploadService } from './uploadService'
import { Frequency } from './frequency'
import R from 'ramda'

const DailyQuota = 10000

export class SyncService {
  private _uploader: IUploadService
  private channelsRepository: ChannelsRepository
  private usersRepository: UsersRepository
  private videosRepository: VideosRepository

  constructor(private youtube: IYoutubeClient, private bus: MessageBus) {
    this._uploader = new S3UploadService(youtube)
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
    if (!(await this.canCallYoutube())) return []

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

    // create user events
    const videoEvents = newVideos.map((v) => new VideoEvent('new', v.id, v.channelId, Date.now()))

    // publish events
    return this.bus.publishAll(videoEvents, 'videoEvents')
  }

  async uploadVideo(channelId: string, videoId: string) {
    return this._uploader.uploadVideo(channelId, videoId)
  }

  private async onlyNewVideos(channel: Channel, videos: Video[]): Promise<Video[]> {
    return R.pipe(
      () => this.videosRepository.query({ channelId: channel.id }, (q) => q.filter('id').in(videos.map((v) => v.id))),
      R.andThen((existingVideos) => new Set(existingVideos.map((v) => v.id))),
      R.andThen((set) => videos.filter((vid) => !set.has(vid.id)))
    )()
  }

  private async canCallYoutube(): Promise<boolean> {
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const statsDoc = await statsRepository().get({
      partition: 'stats',
      date: today.setUTCHours(0, 0, 0, 0),
    })
    const stats = mapTo<Stats>(statsDoc)
    return stats.quotaUsed < DailyQuota
  }
}
