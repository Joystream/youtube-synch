import _ from 'lodash'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtVideo, verifiedVariants } from '../../types/youtube'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { IYoutubeApi } from '../youtube/api'
import { GaxiosError } from 'googleapis-common'

export class YoutubePollingService {
  private logger: Logger

  public constructor(
    logging: LoggingService,
    private youtubeApi: IYoutubeApi,
    private dynamodbService: IDynamodbService,
    private joystreamClient: JoystreamClient
  ) {
    this.logger = logging.createLogger('YoutubePollingService')
  }

  async start(pollingInterval: number) {
    this.logger.info(
      `Starting Youtube channels & videos ingestion service with polling interval of ${pollingInterval} minute(s).`
    )

    // start polling
    setTimeout(async () => this.runPollingWithInterval(pollingInterval), 0)
  }

  // get IDs of all videos of a channel that are still not tracked in DB
  private async getUntrackedVideos(channel: YtChannel, videos: YtVideo[]): Promise<YtVideo[]> {
    // Get all the existing videos
    const existingVideos = await this.dynamodbService.repo.videos.query({ channelId: channel.id }, (q) => q)
    return _.differenceBy(videos, existingVideos, 'id')
  }

  /**
   * Performs polling for updating channel state.
   * @param pollingIntervalMinutes - defines an interval between polling runs
   * @returns void promise.
   */
  private async runPollingWithInterval(pollingIntervalMinutes: number) {
    const sleepInterval = pollingIntervalMinutes * 60 * 1000
    while (true) {
      try {
        const channelsWithNewVideos = _.orderBy(await this.performChannelsIngestion(), ['joystreamChannelId'], ['desc'])

        this.logger.info(
          `Videos of ${channelsWithNewVideos.length} channels will be prepared for syncing in this polling cycle....`
        )

        // Ingest videos of channels in a batch of 100 to limit IO/CPU resource consumption
        const channelsBatches = _.chunk(channelsWithNewVideos, 100)
        // Process each batch

        let channelsProcessed = 0
        for (const channelsBatch of channelsBatches) {
          // TODO: Uncomment after verification
          // await Promise.all(channelsBatch.map((channel) => this.performVideosIngestion(channel)))
          channelsProcessed += channelsBatch.length
          this.logger.info(`Ingested videos of ${channelsProcessed}/${channelsWithNewVideos.length} channels...`)
        }
      } catch (err) {
        this.logger.error(`Critical Polling error`, { err })
      }
      this.logger.info(`All videos ingested.`)
      this.logger.info(`Youtube polling service paused for ${pollingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      this.logger.info(`Resume polling....`)
    }
  }

  /**
   * @returns updated channels
   */
  private async performChannelsIngestion(): Promise<YtChannel[]> {
    // get all channels that need to be ingested
    const channelsWithSyncEnabled = await this.dynamodbService.repo.channels.scan(
        {},
        (scan) =>
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

    this.logger.info(`Found ${channelsWithSyncEnabled.length} channels with sync enabled.`)

    const channelsToBeIngestedChunks = _.chunk(channelsWithSyncEnabled, 50)
    const channelsScheduledForVideoIngestion: YtChannel[] = []

    let checkedChannelsCount = 0
    let updatedChannelsCount = 0
    for (const channelsBatch of channelsToBeIngestedChunks) {
      const channelsStats = await this.youtubeApi.getChannelsStats(channelsBatch.map(c => c.id))
      const channelStatsbyId = new Map(channelsStats.map(c => [c.id, c.statistics]))
      checkedChannelsCount += channelsBatch.length
      const updatedChannels = (
        await Promise.all(
          channelsBatch.map(async (ch) => {
            try {
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
              // Check channel's updated stats
              const channelStats = channelStatsbyId.get(ch.id)
              if (!channelStats) {
                this.logger.warn(`Missing channel stats for channel ${ch.id}! Verifying channel status...`)
                // TODO: Uncomment after verification
                // try {
                //   await this.youtubeApi.getChannel({ id: ch.userId, accessToken: ch.userAccessToken, refreshToken: ch.userRefreshToken })
                // } catch (e) {
                //   if (e instanceof GaxiosError && e.message.includes('YouTube account of the authenticated user is suspended')) {
                //     this.logger.warn(
                //       `Opting out '${ch.id}' from YPP program as their Youtube channel has been terminated by the Youtube.`
                //     )
                //     return {
                //       ...ch,
                //       yppStatus: 'OptedOut',
                //       shouldBeIngested: false,
                //       lastActedAt: new Date(),
                //     }
                //   }
                //   this.logger.warn(`Status of channel ${ch.id} unclear. Will be skipped for this cycle...`, { err: e })
                //   return
                // }
                this.logger.warn(`Status of channel ${ch.id} unclear. Will be skipped for this cycle...`)
                return
              }
              // Schedule for video ingestion if videoCount has changed
              if (channelStats.videoCount !== ch.statistics.videoCount) {
                this.logger.debug('Channel stats changed', { oldStats: ch.statistics, newStats: channelStats })
                channelsScheduledForVideoIngestion.push(ch)
              }
              // Update stats in DynamoDB
              // TODO: Uncomment after verification
              // return {
              //   ...ch,
              //   statistics: {
              //     ...channelStats
              //   }
              // }
            } catch (err: unknown) {
              this.logger.error('Failed to fetch updated channel info', { err, channelId: ch.joystreamChannelId })
            }
          })
        )
      ).filter((ch): ch is YtChannel => ch !== undefined)

      // save updated  channels
      // TODO: Uncomment after verification
      // await this.dynamodbService.repo.channels.upsertAll(updatedChannels)
      updatedChannelsCount += updatedChannels.length

      this.logger.info(`Processed ${checkedChannelsCount}/${channelsWithSyncEnabled.length} channels...`)
      // A delay between batches if necessary to prevent rate limits or high CPU/IO usage
      await sleep(100)
    }

    this.logger.info(
      `Finished channel ingestion. ` +
      `Updated ${updatedChannelsCount} channels.` +
      `Found ${channelsScheduledForVideoIngestion.length} channels with new videos.`
    )
    return channelsScheduledForVideoIngestion
  }

  public async performVideosIngestion(channel: YtChannel, initialIngestion = false) {
    try {
      const historicalVideosCountLimit = YtChannel.videoCap(channel)
      const limit = initialIngestion ? historicalVideosCountLimit : 50

      // get new sync-able videos of the channel
      const videos = await this.youtubeApi.getVideos(channel, limit)

      // get all video Ids that are not yet being tracked
      let untrackedVideos = await this.getUntrackedVideos(channel, videos)

      this.logger.debug(`Found ${untrackedVideos.length} untracked videos (out of last ${videos.length}) for channel ${channel.joystreamChannelId}`)
      // save all new videos to DB including
      await this.dynamodbService.repo.videos.upsertAll(untrackedVideos)
    } catch (err) {
      if (err instanceof YoutubeApiError && err.code === ExitCodes.YoutubeApi.YOUTUBE_QUOTA_LIMIT_EXCEEDED) {
        this.logger.info('Youtube quota limit exceeded, skipping polling for now.')
        return
      }

      // if app permission is revoked by user from Google account then set `shouldBeIngested` to false & OptOut channel from
      // Ypp program,  because then trying to fetch user channel will throw error with code 400 and 'invalid_grant' message
      if ((err as any).code === '400' && (err as any).message === 'invalid_grant') {
        this.logger.warn(
          `Opting out '${channel.id}' from YPP program as their owner has revoked the permissions from Google settings`
        )

        this.logger.debug(`Google permissions error`, {
          err,
          channelId: channel.joystreamChannelId,
          ytChannelId: channel.id,
        })

        // TODO: Uncomment after verification
        // await this.dynamodbService.repo.channels.save({
        //   ...channel,
        //   yppStatus: 'OptedOut',
        //   shouldBeIngested: false,
        //   lastActedAt: new Date(),
        // })
        return
      }

      this.logger.error('Failed to ingest videos for channel', {
        err,
        channelId: channel.joystreamChannelId,
        ytChannelId: channel.id,
      })
    }
  }
}
