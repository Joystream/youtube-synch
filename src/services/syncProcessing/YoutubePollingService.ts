import { GaxiosError } from 'gaxios/build/src/common'
import _ from 'lodash'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel } from '../../types/youtube'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { IYoutubeApi, YtDlpClient } from '../youtube/api'

export class YoutubePollingService {
  private config: ReadonlyConfig
  private logger: Logger
  private youtubeApi: IYoutubeApi
  private ytdlpClient: YtDlpClient
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
    this.ytdlpClient = new YtDlpClient()
    this.dynamodbService = dynamodbService
    this.joystreamClient = joystreamClient
  }

  async start() {
    this.logger.info(`Starting Youtube channels & videos ingestion service.`)
    this.logger.info(`Polling interval is set to ${this.config.intervals.youtubePolling} minute(s).`)

    // start polling
    setTimeout(async () => this.runPollingWithInterval(this.config.intervals.youtubePolling), 0)
  }

  // get IDs of all new videos of the channel
  private async getNewVideosIds(channel: YtChannel, allVideosIds: string[]): Promise<string[]> {
    // Get all the existing videos
    const existingVideos = await this.dynamodbService.repo.videos.query({ channelId: channel.id }, (q) => q)

    return _.difference(
      allVideosIds,
      existingVideos.map((v) => v.id)
    )
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

        await Promise.allSettled(channels.map((channel) => this.performVideosIngestion(channel)))
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
    const channelsWithSyncElabled = async () =>
      await this.dynamodbService.repo.channels.scan('shouldBeIngested', (s) =>
        // * Unauthorized channels add by infra operator are exempted from periodic
        // * ingestion as we don't have access to their access/refresh tokens
        s.eq(true).and().filter('performUnauthorizedSync').eq(false)
      )

    // updated channel objects with uptodate info
    const updatedChannels: YtChannel[] = []
    const channelsToBeIngested = await channelsWithSyncElabled()
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

        // Update the current channel record if it changed
        if (!_.isEqual(ch.statistics, uptodateChannel.statistics)) {
          updatedChannels.push({ ...ch, statistics: uptodateChannel.statistics })
        }
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
          // ! Although type of `err.code` is string, the api api response returns it as number.
        } else if (
          err instanceof GaxiosError &&
          err.code === (403 as any) &&
          (err as GaxiosError).response?.data?.error?.errors[0]?.reason === 'authenticatedUserAccountSuspended'
        ) {
          this.logger.warn(
            `Opting out '${ch.id}' from YPP program as their Youtube channel has been terminated by the Youtube.`
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

    return channelsWithSyncElabled()
  }

  private async performVideosIngestion(channel: YtChannel) {
    try {
      // get all sync-able videos of the channel
      const allVideosIds = await this.ytdlpClient.getAllVideosIds(channel)

      // get all new video Ids that are not yet being tracked
      const newVideosIds = await this.getNewVideosIds(channel, allVideosIds)

      //  get all new videos that are not yet being tracked
      const newVideos = await this.youtubeApi.getVideos(channel, newVideosIds)

      // save all new videos to DB including
      await this.dynamodbService.repo.videos.upsertAll(newVideos)
    } catch (err) {
      this.logger.error('Failed to ingest videos for channel', { err, channelId: channel.joystreamChannelId })
    }
  }
}
