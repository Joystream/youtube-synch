// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  User,
  Channel,
  IngestChannel,
  Stats,
  Video,
  VideoEvent,
  ChannelSpotted,
  Result,
  DomainError,
} from '@youtube-sync/domain';
import {
  ChannelsRepository,
  statsRepository,
  VideosRepository,
} from './database';
import {
  IUploadService,
  mapTo,
  MessageBus,
  createUserModel,
  IYoutubeClient,
  UsersRepository,
} from '..';
import { S3UploadService } from './uploadService';
import { Frequency } from './frequency';
import R from 'ramda'
const DailtyQuota = 10000
export class SyncService {
  private _uploader: IUploadService;
  private channelsRepository: ChannelsRepository;
  private usersRepository: UsersRepository;
  private videosRepository: VideosRepository
  constructor(private youtube: IYoutubeClient, private bus: MessageBus) {
    this._uploader = new S3UploadService(youtube);
    this.channelsRepository = new ChannelsRepository();
    this.usersRepository = new UsersRepository();
    this.videosRepository = new VideosRepository()
  }
  async startIngestionFor(frequencies: Frequency[]){
    return await R.pipe(
      () => this.channelsRepository.scan('frequency', s => s.in(frequencies).filter('shouldBeInjested').eq(true)),
      R.andThen(ch => Result.map(ch, channels => channels.map((ch) => new IngestChannel(ch, Date.now())))),
      R.andThen(ch => Result.bindAsync(ch, events => this.bus.publishAll(events, 'channelEvents')))
    )()
  }
  async ingestChannels(user: User){
    if (!(await this.canCallYoutube())) return [];

    return R.pipe(
      this.youtube.getChannels,
      R.andThen(ch => Result.bindAsync(ch, channels => this.channelsRepository.upsertAll(channels))),
      R.andThen(ch => Result.checkAsync(ch, channels => this.usersRepository.save({...user, channelsCount: channels.length}, 'users'))),
      R.andThen(ch => Result.map(ch, channels => channels.map((ch) => new ChannelSpotted(ch, Date.now())))),
      R.andThen(ev => Result.bindAsync(ev, events => this.bus.publishAll(events, 'channelEvents')))
    )(user);
  }
  async ingestAllVideos(channel: Channel, top: number) {
    if (!(await this.canCallYoutube())) return [];
    return R.pipe(
      this.youtube.getAllVideos,
      R.andThen(v => Result.bindAsync(v, allVideos => this.onlyNewVideos(channel, allVideos))),
      R.andThen(v => Result.map(v, newVideos => newVideos.map((v) => new VideoEvent('new', v.id, v.channelId, Date.now())))),
      R.andThen(ev => Result.bindAsync(ev, events => this.bus.publishAll(events, 'videoEvents')))
    )(channel, top)
  }

  async uploadVideo(channelId: string, videoId: string) {
    return this._uploader.uploadVideo(channelId, videoId);
  }

  private async onlyNewVideos(
    channel: Channel,
    videos: Video[]
  ): Promise<Result<Video[], DomainError>> {
    return R.pipe(
      () => this.videosRepository.query({channelId : channel.id}, q => q.filter('id').in(videos.map((v) => v.id))),
      R.andThen(v => Result.map(v, existingVideos => new Set(existingVideos.map(v => v.id)))),
      R.andThen(v => Result.map(v, set => videos.filter(vid => !set.has(vid.id))))
    )()
  }
  private async canCallYoutube(): Promise<boolean> {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const statsDoc = await statsRepository().get({
      partition: 'stats',
      date: today.setUTCHours(0, 0, 0, 0),
    });
    const stats = mapTo<Stats>(statsDoc);
    return stats.quotaUsed < DailtyQuota;
  }
}
