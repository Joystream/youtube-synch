import { GaxiosError } from 'gaxios/build/src/common'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtVideo } from '../../types/youtube'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { IYoutubeApi } from '../youtube/api'

export class YoutubePollingService {
  private config: ReadonlyConfig
  private logger: Logger
  private youtubeApi: IYoutubeApi
  private joystreamClient: JoystreamClient
  private dynamodbService: IDynamodbService

  public constructor(
    config: ReadonlyConfig,
    logging: LoggingService,
    youtubeApi: IYoutubeApi,
    dynamodbService: IDynamodbService,
    joystreamClient: JoystreamClient
  ) {
    this.config = config
    this.logger = logging.createLogger('YoutubePollingService')
    this.youtubeApi = youtubeApi
    this.dynamodbService = dynamodbService
    this.joystreamClient = joystreamClient
  }

  async start() {
    this.logger.info(`Starting Youtube channels & videos ingestion service.`)
    this.logger.info(`Polling interval is set to ${this.config.intervals.youtubePolling} minute(s).`)

    // start polling
    setTimeout(async () => this.runPollingWithInterval(this.config.intervals.youtubePolling), 0)
  }

  // get all unsynced videos
  private async getUnsyncedVideos(channel: YtChannel, newVideos: YtVideo[]): Promise<YtVideo[]> {
    // Get all the existing videos
    const existingVideos = await this.dynamodbService.repo.videos.query({ channelId: channel.id }, (q) => q)

    return newVideos.reduce((unSyncedVideos, video) => {
      const existingVideo = existingVideos.find((v) => v.id === video.id)
      if (!existingVideo) {
        // Video is a new video, so add it to the list of unsynced videos
        unSyncedVideos.push(video)
      } else if (
        existingVideo.state === 'New' ||
        existingVideo.state === 'VideoCreationFailed' ||
        existingVideo.state === 'UploadFailed'
      ) {
        // If video is already being tracked but hasn't been synced yet then we update it's fields (e.g. viewCount), which are
        // being used to calculate it's syncing priority. After that add video to the list of unsynced videos for re/processing.
        unSyncedVideos.push({
          ...video,
          createdAt: existingVideo.createdAt,
          state: existingVideo.state,
          joystreamVideo: existingVideo.joystreamVideo,
        })
      }
      return unSyncedVideos
    }, [] as YtVideo[])
  }

  /**
   * Performs polling for updating channel state.
   * @param pollingIntervalMinutes - defines an interval between polling runs
   * @returns void promise.
   */
  private async runPollingWithInterval(pollingIntervalMinutes: number) {
    const sleepInterval = pollingIntervalMinutes * 60 * 1000
    while (true) {
      this.logger.info(`Youtube polling service paused for ${pollingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      try {
        this.logger.info(`Resume polling....`)

        const channels = await this.performChannelsIngestion()

        this.logger.info(
          `Completed Channels Ingestion. Videos of ${channels.length} channels will be prepared for syncing in this polling cycle....`
        )

        await Promise.all(channels.map((channel) => this.performVideosIngestion(channel)))
      } catch (err) {
        this.logger.error(`Critical Polling error`, { err })
      }
    }
  }

  /**
   * @returns updated channels
   */
  private async performChannelsIngestion(): Promise<YtChannel[]> {
    // get all channels that need to be ingested
    const channelsToBeIngested = await this.dynamodbService.repo.channels.scan('shouldBeIngested', (s) =>
      // * Unauthorized channels add by infra operator are exempted from periodic
      // * ingestion as we don't have access to their access/refresh tokens
      s.eq(true).and().filter('performUnauthorizedSync').eq(false)
    )

    // updated channel objects with uptodate info (e.g. subscriber count)
    const updatedChannels: YtChannel[] = []
    for (const ch of channelsToBeIngested) {
      try {
        const uptodateChannel = await this.youtubeApi.getChannel({
          id: ch.userId,
          accessToken: ch.userAccessToken,
          refreshToken: ch.userRefreshToken,
        })

        // ensure that Ypp collaborator member is still set as channel's collaborator
        const isCollaboratorSet = await this.joystreamClient.doesChannelHaveCollaborator(ch.joystreamChannelId)
        if (!isCollaboratorSet) {
          this.logger.warn(
            `Joystream Channel ${ch.joystreamChannelId} has either not set or revoked Ypp collaborator member ` +
              `as channel's collaborator. Corresponding Youtube Channel '${ch.id}' is being opted out from Ypp program.`
          )
          updatedChannels.push({
            ...ch,
            yppStatus: 'OptedOut',
            shouldBeIngested: false,
            lastActedAt: new Date(),
          })
          continue
        }

        updatedChannels.push({ ...ch, statistics: uptodateChannel.statistics })
      } catch (err: unknown) {
        // if app permission is revoked by user from Google account then set `shouldBeIngested` to false & OptOut channel from
        // Ypp program,  because then trying to fetch user channel will throw error with code 400 and 'invalid_grant' message
        if (err instanceof GaxiosError && err.code === '400' && err.response?.data?.error === 'invalid_grant') {
          this.logger.warn(
            `Opting out '${ch.id}' from YPP program as their owner has revoked the permissions from Google settings`
          )
          updatedChannels.push({
            ...ch,
            yppStatus: 'OptedOut',
            shouldBeIngested: false,
            lastActedAt: new Date(),
          })
          continue
        } else if (err instanceof YoutubeApiError && err.code === ExitCodes.YoutubeApi.CHANNEL_NOT_FOUND) {
          this.logger.warn(`Opting out '${ch.id}' from YPP program as Channel is not found on Youtube.`)
          updatedChannels.push({
            ...ch,
            yppStatus: 'OptedOut',
            shouldBeIngested: false,
            lastActedAt: new Date(),
          })
          continue
        } else if (err instanceof YoutubeApiError && err.code === ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED) {
          this.logger.info('Youtube quota limit exceeded, skipping polling for now.')
          return []
        }
        updatedChannels.push(ch)
        this.logger.error('Failed to fetch updated channel info', { err, channelId: ch.joystreamChannelId })
      }
    }

    // save updated  channels
    await this.dynamodbService.repo.channels.upsertAll(updatedChannels)

    return updatedChannels.filter((ch) => ch.shouldBeIngested)
  }

  private async performVideosIngestion(channel: YtChannel, top = 1000) {
    // get all sync-able videos of the channel
    const allVideos = await this.youtubeApi.getAllVideos(channel, top)

    // get all unsynced videos
    const unsyncedVideos = await this.getUnsyncedVideos(channel, allVideos)

    // save all unsynced videos to DB including new + old(as some fields on old videos might have changed, e.g. viewCount)
    await this.dynamodbService.repo.videos.upsertAll(unsyncedVideos)
  }
}
