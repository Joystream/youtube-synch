// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Channel, ChannelSpotted, IngestChannel, Stats, User, Video, VideoEvent } from '@youtube-sync/domain'
import { JoystreamClient } from '@youtube-sync/joy-api'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { Uploader } from 'packages/joy-api/storage/uploader'
import { ChannelsRepository, mapTo, statsRepository, UsersRepository, VideosRepository } from './database'
import { Frequency } from './frequency'
import { MessageBus } from './messageBus'
import { ISyncService, JoystreamSyncService } from './uploadService'
import { IYoutubeClient } from './youtubeClient'

const DailyQuota = 10000

export class SyncService {
  private syncService: ISyncService
  private channelsRepository: ChannelsRepository
  private usersRepository: UsersRepository
  private videosRepository: VideosRepository

  constructor(
    private youtube: IYoutubeClient,
    private joystreamClient: JoystreamClient,
    private storageClient: Uploader,
    private bus: MessageBus
  ) {
    this.syncService = new JoystreamSyncService(this.joystreamClient, this.storageClient)
    this.channelsRepository = new ChannelsRepository()
    this.usersRepository = new UsersRepository()
    this.videosRepository = new VideosRepository()
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

  // get all videos with state 'New'
  private async onlyNewVideos(channel: Channel, videos: Video[]): Promise<Video[]> {
    const existingVideos = await this.videosRepository.query({ channelId: channel.id }, (q) => q)
    const existingVideoIds = new Set(existingVideos.filter((v) => v.uploadStatus === 'processed').map((v) => v.id))
    return videos.filter((v) => !existingVideoIds.has(v.id))
  }

  async startIngestionFor(frequencies: Frequency[]) {
    // get all channels that need to be ingested
    const channelsToBeIngested = await this.channelsRepository.scan('frequency', (s) =>
      s.in(frequencies).filter('shouldBeIngested').eq(true)
    )

    // create channels event based on
    // `shouldBeIngested` flag should be set to true
    // `isSuspended` flag should be set to false
    const channelsEvent = channelsToBeIngested
      .filter((ch) => ch.shouldBeIngested && !ch.isSuspended)
      .map((ch) => new IngestChannel(ch, Date.now()))

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

    // get all videos with state 'New'
    const newVideos = await this.onlyNewVideos(channel, allVideos)

    // save new videos tp DB
    await this.videosRepository.upsertAll(newVideos)

    // create video events
    const videoEvents = newVideos.map((v) => new VideoEvent('New', v.id, v.channelId, Date.now()))

    // publish events
    return this.bus.publishAll(videoEvents, 'createVideoEvents')
  }

  async createVideo(channelId: string, videoId: string): Promise<VideoEvent> {
    // Load channel and video records from DB
    const channel = await this.channelsRepository.get(channelId)
    const video = await this.videosRepository.get(channelId, videoId)

    // if video hasn't finished processing on Youtube, then don't sync it yet
    if (video.uploadStatus !== 'processed') {
      return
    }

    try {
      // Update video state and save to DB
      await this.videosRepository.save({ ...video, state: 'CreatingVideo' })

      // Create video on joystream blockchain by calling extrinsic
      const { joystreamVideo } = await this.syncService.createVideo(channel, video)

      // Update video state and save to DB
      await this.videosRepository.save({ ...video, joystreamVideo, state: 'VideoCreated' })

      // upload video event
      const videoCreatedEvent = new VideoEvent('VideoCreated', video.id, video.channelId, Date.now())

      // publish upload video event
      return this.bus.publish(videoCreatedEvent, 'uploadVideoEvents')
    } catch (error) {
      // Update video state and save to DB
      await this.videosRepository.save({ ...video, state: 'VideoCreationFailed' })

      // upload video event
      const VideoCreationFailedEvent = new VideoEvent('VideoCreationFailed', video.id, video.channelId, Date.now())

      // publish upload video event
      return this.bus.publish(VideoCreationFailedEvent, 'createVideoEvents')
    }
  }

  async uploadVideo(channelId: string, videoId: string) {
    // Load channel and video records from DB
    const channel = await this.channelsRepository.get(channelId)
    const video = await this.videosRepository.get(channelId, videoId)

    try {
      // Update video state and save to DB
      await this.videosRepository.save({ ...video, state: 'UploadStarted' })

      // Upload the video assets
      await this.syncService.uploadVideo(channel, video)

      // Update video state and save to DB
      await this.videosRepository.save({ ...video, state: 'UploadSucceeded' })
    } catch (error) {
      // Update video state and save to DB
      await this.videosRepository.save({ ...video, state: 'UploadFailed' })

      // upload video event
      const uploadFailedEvent = new VideoEvent('UploadFailed', video.id, video.channelId, Date.now())

      // publish upload video event
      return this.bus.publish(uploadFailedEvent, 'uploadVideoEvents')
    }
  }
}
