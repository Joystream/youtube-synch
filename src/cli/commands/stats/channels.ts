import { flags } from '@oclif/command'
import { CLIError } from '@oclif/errors'
import YtSynchCommandBase from '../../base/ytSynchApi'
import { displayTable } from '../../utils/display'
import { ChannelStatsRecord } from '../../utils/types'

export default class ChannelStats extends YtSynchCommandBase {
  static description = `Returns channels created from date x till date y + link to joystream and youtube channel + Referrer ids.`

  static flags = {
    appDomain: flags.string({
      required: false,
      description: 'Domain of the application that should be used to construct the channel URLs',
      char: 'd',
    }),
    ...YtSynchCommandBase.flags,
  }

  async run(): Promise<void> {
    const { appDomain } = this.parse(ChannelStats).flags
    const startDate = await this.datePrompt({ message: 'Enter start date' })
    const endDate = await this.datePrompt({ message: 'Enter end date' })

    if (endDate < startDate) {
      throw new CLIError('End date must be greater than start date')
    }

    const channels = await this.getChannels()

    const channelRecords: ChannelStatsRecord<typeof appDomain>[] = channels
      .filter((c) => {
        console.log(c.youtubeChannelId, c.joystreamChannelId, c.referrerChannelId)
        return new Date(c.createdAt) >= startDate && new Date(c.createdAt) <= endDate
      })
      .map(({ youtubeChannelId, joystreamChannelId, referrerChannelId }) => ({
        youtubeChannelIdOrUrl: `https://www.youtube.com/channel/${youtubeChannelId}`,
        joystreamChannelIdOrUrl: appDomain ? `https://${appDomain}/channel/${joystreamChannelId}` : joystreamChannelId,
        referrerChannelIdOrUrl: referrerChannelId
          ? appDomain
            ? `https://${appDomain}/channel/${referrerChannelId}`
            : referrerChannelId
          : undefined,
      }))

    if (channelRecords.length > 0) {
      displayTable(
        channelRecords.map((c) => ({
          'Youtube Channel URL': c.youtubeChannelIdOrUrl,
          'Joystream Channel ID or URL': c.joystreamChannelIdOrUrl,
          'Referrer Channel ID or URL': c.referrerChannelIdOrUrl ?? '',
        })),
        3
      )
    } else {
      this.log(`There are no channels that signed up between ${startDate} and ${endDate}`)
    }
  }
}
