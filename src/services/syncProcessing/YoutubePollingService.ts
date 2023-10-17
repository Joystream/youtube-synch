import { GaxiosError } from 'gaxios/build/src/common'
import _ from 'lodash'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtDlpFlatPlaylistOutput, verifiedVariants } from '../../types/youtube'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { IYoutubeApi } from '../youtube/api'

export class YoutubePollingService {
  private logger: Logger
  private youtubeApi: IYoutubeApi
  private joystreamClient: JoystreamClient
  private dynamodbService: IDynamodbService

  public constructor(
    logging: LoggingService,
    youtubeApi: IYoutubeApi,
    dynamodbService: IDynamodbService,
    joystreamClient: JoystreamClient
  ) {
    this.logger = logging.createLogger('YoutubePollingService')
    this.youtubeApi = youtubeApi
    this.dynamodbService = dynamodbService
    this.joystreamClient = joystreamClient
  }

  async start(pollingInterval: number) {
    this.logger.info(
      `Starting Youtube channels & videos ingestion service with polling interval of ${pollingInterval} minute(s).`
    )

    // start polling
    setTimeout(async () => this.runPollingWithInterval(pollingInterval), 0)
  }

  // get IDs of all videos of a channel that are still not tracked in DB
  private async getUntrackedVideosIds(
    channel: YtChannel,
    videosIds: YtDlpFlatPlaylistOutput
  ): Promise<YtDlpFlatPlaylistOutput> {
    // Get all the existing videos
    const existingVideos = await this.dynamodbService.repo.videos.query({ channelId: channel.id }, (q) => q)
    return _.differenceBy(videosIds, existingVideos, 'id')
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

        // Ingest videos of channels in a batch of 50 to limit IO/CPU resource consumption
        const channelsBatch = _.chunk(channels, 50)
        // Process each batch
        for (let i = 0; i < channelsBatch.length; i++) {
          await Promise.all(channelsBatch[i].map((channel) => this.performVideosIngestion(channel)))
        }
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
    const channelsWithSyncEnabled = async () =>
      await this.dynamodbService.repo.channels.scan({}, (scan) =>
        scan
          .filter('yppStatus')
          .in(['Unverified', ...verifiedVariants])
          .where('shouldBeIngested')
          .eq(true)
          .and()
          .where('allowOperatorIngestion')
          .eq(true)
          .and()
          // * Unauthorized channels add by infra operator are exempted from periodic
          // * ingestion as we don't have access to their access/refresh tokens
          .where('performUnauthorizedSync')
          .eq(false)
      )

    // updated channel objects with uptodate info
    const channelsToBeIngested = await channelsWithSyncEnabled()
    const updatedChannels = (
      await Promise.all(
        channelsToBeIngested.map(async (ch) => {
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
              return {
                ...ch,
                yppStatus: 'OptedOut',
                shouldBeIngested: false,
                lastActedAt: new Date(),
              }
            }

            // Update the current channel record if it changed
            if (!_.isEqual(ch.statistics, uptodateChannel.statistics)) {
              return { ...ch, statistics: uptodateChannel.statistics }
            }
          } catch (err: unknown) {
            // if app permission is revoked by user from Google account then set `shouldBeIngested` to false & OptOut channel from
            // Ypp program,  because then trying to fetch user channel will throw error with code 400 and 'invalid_grant' message
            if (err instanceof GaxiosError && err.code === '400' && err.response?.data?.error === 'invalid_grant') {
              this.logger.warn(
                `Opting out '${ch.id}' from YPP program as their owner has revoked the permissions from Google settings`
              )
              return {
                ...ch,
                yppStatus: 'OptedOut',
                shouldBeIngested: false,
                lastActedAt: new Date(),
              }
              // ! Although type of `err.code` is string, the api api response returns it as number.
            } else if (
              err instanceof GaxiosError &&
              err.code === (403 as any) &&
              (err as GaxiosError).response?.data?.error?.errors[0]?.reason === 'authenticatedUserAccountSuspended'
            ) {
              this.logger.warn(
                `Opting out '${ch.id}' from YPP program as their Youtube channel has been terminated by the Youtube.`
              )
              return {
                ...ch,
                yppStatus: 'OptedOut',
                shouldBeIngested: false,
                lastActedAt: new Date(),
              }
            } else if (err instanceof YoutubeApiError && err.code === ExitCodes.YoutubeApi.CHANNEL_NOT_FOUND) {
              this.logger.warn(`Opting out '${ch.id}' from YPP program as Channel is not found on Youtube.`)
              return {
                ...ch,
                yppStatus: ' OptedOut',
                shouldBeIngested: false,
                lastActedAt: new Date(),
              }
            } else if (
              err instanceof YoutubeApiError &&
              err.code === ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED
            ) {
              this.logger.info('Youtube quota limit exceeded, skipping polling for now.')
              return
            }
            this.logger.error('Failed to fetch updated channel info', { err, channelId: ch.joystreamChannelId })
          }
        })
      )
    ).filter((ch): ch is YtChannel => ch !== undefined)

    // save updated  channels
    await this.dynamodbService.repo.channels.upsertAll(updatedChannels)

    return channelsWithSyncEnabled()
  }

  public async performVideosIngestion(channel: YtChannel) {
    try {
      const historicalVideosCountLimit = YtChannel.videoCap(channel)

      // get iDs of all sync-able videos within the channel limits
      const videosIds = await this.youtubeApi.ytdlpClient.getVideos(channel, historicalVideosCountLimit)

      // get all video Ids that are not yet being tracked
      let untrackedVideosIds = await this.getUntrackedVideosIds(channel, videosIds)

      // if size limit has reached, don't track new historical videos
      if (YtChannel.hasSizeLimitReached(channel)) {
        untrackedVideosIds = untrackedVideosIds.filter((v) => v.publishedAt >= channel.createdAt)
      }

      //  get all videos that are not yet being tracked
      const untrackedVideos = await this.youtubeApi.getVideos(
        channel,
        untrackedVideosIds.map((v) => v.id)
      )

      // save all new videos to DB including
      await this.dynamodbService.repo.videos.upsertAll(untrackedVideos)
    } catch (err) {
      if (err instanceof YoutubeApiError && err.code === ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED) {
        this.logger.info('Youtube quota limit exceeded, skipping polling for now.')
        return
      }

      this.logger.error('Failed to ingest videos for channel', { err, channelId: channel.joystreamChannelId })
    }
  }
}
