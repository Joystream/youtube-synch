import _ from 'lodash'
import sleep from 'sleep-promise'
import { Logger } from 'winston'
import { IDynamodbService } from '../../repository'
import { ExitCodes, YoutubeApiError } from '../../types/errors'
import { YtChannel, YtVideo, verifiedVariants } from '../../types/youtube'
import { LoggingService } from '../logging'
import { JoystreamClient } from '../runtime/client'
import { IYoutubeApi } from '../youtube/api'

export class YoutubePollingService {
  private logger: Logger
  private lastPolledChannelId: number | undefined = undefined // Track the last successfully polled channel ID

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
      this.logger.info(`Youtube polling service paused for ${pollingIntervalMinutes} minute(s).`)
      await sleep(sleepInterval)
      try {
        this.logger.info(`Resume polling....`)

        const channels = _.orderBy(await this.performChannelsIngestion(), ['joystreamChannelId'], ['desc'])

        console.log('Total channels to be polled:', channels.length)
        // Start polling from the last successfully polled channel ID
        const startIndex = this.lastPolledChannelId
          ? channels.findIndex((channel) => channel.joystreamChannelId === this.lastPolledChannelId)
          : 0
        const channelsToPoll = channels.slice(startIndex)

        this.logger.info(
          `Completed Channels Ingestion. Videos of ${channelsToPoll.length} channels will be prepared for syncing in this polling cycle....`
        )

        // Ingest videos of channels in a batch of 50 to limit IO/CPU resource consumption
        const channelsBatch = _.chunk(channelsToPoll, 100)
        // Process each batch

        let a = 0
        for (const channels of channelsBatch) {
          a = a + channels.length
          await Promise.all(channels.map((channel) => this.performVideosIngestion(channel)))
          this.lastPolledChannelId = channels[channels.length - 1].joystreamChannelId // Update last polled channel ID
          console.log('videos ingestion batch:', a)
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
    const channelsToBeIngestedChunks = _.chunk(await channelsWithSyncEnabled(), 100)

    let a = 0
    console.log('await channelsWithSyncEnabled()', (await channelsWithSyncEnabled()).length)
    for (const channelsToBeIngested of channelsToBeIngestedChunks) {
      a = a + channelsToBeIngested.length
      console.log('channels ingestion batch:', a)
      const updatedChannels = (
        await Promise.all(
          channelsToBeIngested.map(async (ch) => {
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
            } catch (err: unknown) {
              if (err instanceof Error && err.message.includes('This account has been terminated')) {
                this.logger.warn(
                  `Opting out '${ch.id}' from YPP program as their Youtube channel has been terminated by the Youtube.`
                )
                return {
                  ...ch,
                  yppStatus: 'OptedOut',
                  shouldBeIngested: false,
                  lastActedAt: new Date(),
                }
              } else if (err instanceof Error && err.message.includes('The playlist does not exist')) {
                this.logger.warn(`Opting out '${ch.id}' from YPP program as Channel does not exist on Youtube.`)
                return {
                  ...ch,
                  yppStatus: 'OptedOut',
                  shouldBeIngested: false,
                  lastActedAt: new Date(),
                }
              }
              this.logger.error('Failed to fetch updated channel info', { err, channelId: ch.joystreamChannelId })
            }
          })
        )
      ).filter((ch): ch is YtChannel => ch !== undefined)

      // save updated  channels
      await this.dynamodbService.repo.channels.upsertAll(updatedChannels)

      // A delay between batches if necessary to prevent rate limits or high CPU/IO usage
      await sleep(100)
    }

    return channelsWithSyncEnabled()
  }

  public async performVideosIngestion(channel: YtChannel, initialIngestion = false) {
    try {
      const historicalVideosCountLimit = YtChannel.videoCap(channel)
      const limit = initialIngestion ? historicalVideosCountLimit : 50

      // get new sync-able videos of the channel
      const videos = await this.youtubeApi.getVideos(channel, limit)

      // get all video Ids that are not yet being tracked
      let untrackedVideos = await this.getUntrackedVideos(channel, videos)

      console.log('untrackedVideos.length', videos.length, untrackedVideos.length, channel.joystreamChannelId)
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

        await this.dynamodbService.repo.channels.save({
          ...channel,
          yppStatus: 'OptedOut',
          shouldBeIngested: false,
          lastActedAt: new Date(),
        })
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
