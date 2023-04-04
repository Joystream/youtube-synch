import { flags } from '@oclif/command'
import { CLIError } from '@oclif/errors'
import YtSynchCommandBase from '../../base/ytSynchApi'
import { displayCollapsedRow, displayHeader, displayTable } from '../../utils/display'
import { ChannelStatsRecord, VideoStatsRecord } from '../../utils/types'

export default class VideoByChannelStats extends YtSynchCommandBase {
  static description = `Returns the number of videos created (for a given channel) from date x till date y + link to joystream and youtube channel + Referrer ids.`

  static flags = {
    joystreamChannelId: flags.integer({
      required: true,
      description: 'ID of the synced Joystream channel for which the uploaded videos stats should be returned',
    }),
    appDomain: flags.string({
      required: false,
      description: 'Domain of the application that should be used to construct the channel & videos URLs',
      char: 'd',
    }),
    ...YtSynchCommandBase.flags,
  }

  async run(): Promise<void> {
    const { joystreamChannelId, appDomain } = this.parse(VideoByChannelStats).flags
    const startDate = await this.datePrompt({ message: 'Enter start date' })
    const endDate = await this.datePrompt({ message: 'Enter end date' })

    if (endDate < startDate) {
      throw new CLIError('End date must be greater than start date')
    }

    const channel = await this.getChannel(joystreamChannelId)
    const videos = await this.getVideosByChannel(joystreamChannelId)
    const channelRecord: ChannelStatsRecord<typeof appDomain> = {
      youtubeChannelIdOrUrl: `https://www.youtube.com/channel/${channel.youtubeChannelId}`,
      joystreamChannelIdOrUrl: appDomain
        ? `https://${appDomain}/channel/${channel.joystreamChannelId}`
        : channel.joystreamChannelId,
      referrerChannelIdOrUrl: channel.referrerChannelId
        ? `https://gleev.xyz/channel/${channel.referrerChannelId}`
        : undefined,
    }
    const videosRecords: VideoStatsRecord<typeof appDomain>[] = videos
      .filter((v) => {
        return new Date(v.createdAt) >= startDate && new Date(v.createdAt) <= endDate && v.state === 'UploadSucceeded'
      })
      .map(({ title, url, category, joystreamVideo }) => ({
        title,
        url,
        category,
        joystreamVideoIdOrUrl: appDomain ? `https://gleev.xyz/video/${joystreamVideo.id}` : joystreamVideo.id,
      }))

    displayCollapsedRow({
      'Youtube Channel ID or URL': channelRecord.youtubeChannelIdOrUrl,
      'Joystream Channel ID or URL': channelRecord.joystreamChannelIdOrUrl,
      'Referrer Channel ID or URL': channelRecord.referrerChannelIdOrUrl ?? '',
      'Videos Count': videos.length.toString(),
    })

    displayHeader(
      `Video Stats for channel ${channelRecord.joystreamChannelIdOrUrl} between ${startDate} and ${endDate}`
    )

    if (videosRecords.length > 0) {
      displayTable(
        videosRecords.map((v) => ({
          'Title': v.title,
          'Video Youtube URL': v.url,
          'Video Category ID': v.category,
          'Video Joystream ID or URL': v.joystreamVideoIdOrUrl,
        })),
        3
      )
    } else {
      this.log(`There are no videos that were created up between ${startDate} and ${endDate}`)
    }
  }
}
