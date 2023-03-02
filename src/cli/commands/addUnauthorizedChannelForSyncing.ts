import { flags } from '@oclif/command'
import { CLIError } from '@oclif/errors'
import { PalletContentChannelRecord } from '@polkadot/types/lookup'
import axios from 'axios'
import { load } from 'cheerio'
import ytpl from 'ytpl'
import { DynamodbService } from '../../repository'
import { Thumbnails, YtChannel, YtVideo } from '../../types/youtube'
import ApiCommandBase from '../base/api'
import CLIExitCodes from '../base/ExitCodes'

export default class AddUnauthorizedChannelForSyncing extends ApiCommandBase {
  static description = 'Add Unauthorized Channel For Syncing, this command will also '

  static flags = {
    channelUrl: flags.string({
      description:
        'Youtube Channel or User URL (e,g. https://www.youtube.com/@MrBeast https://www.youtube.com/user/mrbeast6000)',
      exclusive: ['ytChannelId'],
    }),
    ytChannelId: flags.string({
      description: 'Youtube Channel ID',
      exclusive: ['channelUrl'],
    }),
    videosLimit: flags.integer({
      description: 'Limit the number of videos to sync',
      default: 50,
    }),
    joystreamChannelId: flags.integer({
      description: 'Joystream Channel ID where Youtube videos will be replicated',
      required: true,
    }),
    ...ApiCommandBase.flags,
  }

  async isCollaboratorSet(jsChannel: PalletContentChannelRecord) {
    const collaborator = this.appConfig.joystream.channelCollaborator.memberId.toString()
    const member = await this.api.query.members.membershipById(collaborator)
    if (member.isNone) {
      throw new Error(`Joystream member with id ${collaborator} not found`)
    }

    const { collaborators } = jsChannel
    const isCollaboratorSet = [...collaborators].some(
      ([member, permissions]) => member.toString() === collaborator && [...permissions].some((p) => p.isAddVideo)
    )
    return isCollaboratorSet
  }

  async run(): Promise<void> {
    const { channelUrl, ytChannelId, videosLimit, joystreamChannelId } = this.parse(
      AddUnauthorizedChannelForSyncing
    ).flags

    let channelPlaylistId: string | undefined

    if (!channelUrl && !ytChannelId) {
      throw new CLIError('Please provide either --channelUrl or --ytChannelId', {
        exit: CLIExitCodes.InvalidInput,
      })
    }

    if (ytChannelId) {
      // Resolve channel's upload Playlist ID from channel ID
      channelPlaylistId = await ytpl.getPlaylistID(ytChannelId)
    } else if (channelUrl) {
      // Resolve channel's upload Playlist ID from channel URL
      const response = (await axios.get(channelUrl)).data
      const $ = load(response)
      const youtubeChannelId = $('meta[itemprop="channelId"]').attr('content')
      if (!youtubeChannelId) {
        throw new CLIError(
          'Could not resolve channel ID from URL, please check the URL and try again. Or use --ytChannelId',
          {
            exit: CLIExitCodes.InvalidInput,
          }
        )
      }
      channelPlaylistId = await ytpl.getPlaylistID(youtubeChannelId)
    }

    const result = await ytpl(channelPlaylistId || '', { limit: videosLimit })

    // Get Joystream Channel
    const jsChannel = await this.api.query.content.channelById(joystreamChannelId)

    // Ensure joystream channel exists
    if (jsChannel.isEmpty) {
      throw new CLIError(`Channel ${joystreamChannelId} does not exist`, {
        exit: CLIExitCodes.InvalidInput,
      })
    }

    // Ensure joystream channel has collaborator set
    if (!(await this.isCollaboratorSet(jsChannel))) {
      throw new CLIError(`Channel ${joystreamChannelId} does not have collaborator member to manage syncing`, {
        exit: CLIExitCodes.InvalidInput,
      })
    }

    // Init dynamo client
    const dynamo = DynamodbService.init()

    // Ensure Joystream Channel is not already associated with some other Youtube channel.
    try {
      await dynamo.channels.getByJoystreamChannelId(joystreamChannelId)
      throw new CLIError(
        `Joystream Channel ${joystreamChannelId} is already associated with another Youtube channel. Try again with different --joystreamChannelId`,
        {
          exit: CLIExitCodes.InvalidInput,
        }
      )
    } catch (error) {
      if (error instanceof CLIError) {
        throw error
      }
    }

    // Ensure Youtube Channel is not already being synced.
    try {
      const ytChannel = await dynamo.channels.getByChannelId(result.author.channelID)
      if (ytChannel.performUnauthorizedSync) {
        await this.requireConfirmation(
          'This youtube channel is already being synced. Do you want to redo the syncing?',
          false
        )
      } else {
        throw new CLIError(`Cannot add already authorized channel as "unauthorized" channel for syncing`, {
          exit: CLIExitCodes.InvalidInput,
        })
      }
    } catch (error) {
      if (error instanceof CLIError) {
        throw error
      }
    }

    this.jsonPrettyPrint(JSON.stringify({ channelUrl, ytChannelId, videosLimit, joystreamChannelId }))
    await this.requireConfirmation('Do you confirm the provided input?', true)

    // Save channel to DB
    const c = await dynamo.channels.save({
      id: result.author.channelID,
      title: result.author.name,
      userId: `UnauthorizedUser-${result.author.channelID}`,
      joystreamChannelId,
      createdAt: new Date(),
      lastActedAt: new Date(),
      shouldBeIngested: true,
      yppStatus: 'Unverified',
      performUnauthorizedSync: true,
    } as YtChannel)

    // Save videos to DB
    for (const video of result.items) {
      await dynamo.videos.save({
        id: video.id,
        channelId: result.author.channelID,
        title: video.title,
        thumbnails: { default: video.thumbnails[0]?.url, medium: video.thumbnails[1]?.url } as Thumbnails,
        duration: video.durationSec || 0,
        createdAt: new Date(),
        resourceId: video.id,
        url: video.shortUrl,
        playlistId: channelPlaylistId,
        privacyStatus: 'public',
        liveBroadcastContent: video.isLive ? 'live' : 'none',
        state: 'New',
        viewCount: 0,
      } as YtVideo)
    }

    this.log(`Successfully added Channel "${result.author.name}" to DB for unauthorized syncing`)
  }
}
