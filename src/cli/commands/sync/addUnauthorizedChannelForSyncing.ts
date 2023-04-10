import { ChannelCreationInputParameters } from '@joystream/cli/lib/Types'
import { flags } from '@oclif/command'
import { CLIError } from '@oclif/errors'
import { PalletContentChannelRecord } from '@polkadot/types/lookup'
import axios from 'axios'
import { load } from 'cheerio'
import ytpl from 'ytpl'
import { DynamodbService } from '../../../repository'
import { Thumbnails, YtChannel, YtVideo } from '../../../types/youtube'
import CLIExitCodes from '../../base/ExitCodes'
import RuntimeApiCommandBase from '../../base/runtimeApi'

export default class AddUnauthorizedChannelForSyncing extends RuntimeApiCommandBase {
  static description =
    `Add Unauthorized Youtube Channel For Syncing, this command will also create` +
    ` corresponding Joystream Channel if --joystreamChannelId  flag is not provided`

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
      required: false,
    }),
    ...RuntimeApiCommandBase.flags,
  }

  async createJoystreamChannel(ytChannel: ytpl.Result) {
    const channelOwnerKeypair = await this.prepareDevAccount(ytChannel.author.name)
    const memberId = await this.buyMembership(channelOwnerKeypair)

    // Import & select channel owner key
    await this.joystreamCli.importAccount(channelOwnerKeypair)
    const channelInput: ChannelCreationInputParameters = {
      title: ytChannel.author.name,
      isPublic: true,
      language: 'en',
      collaborators: [
        { memberId: Number(this.appConfig.joystream.channelCollaborator.memberId), permissions: ['AddVideo'] },
      ],
    }

    const memberContextFlags = ['--context', 'Member', '--useMemberId', memberId.toString()]
    return this.joystreamCli.createChannel(channelInput, memberContextFlags)
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
    const { channelUrl, ytChannelId, videosLimit } = this.parse(AddUnauthorizedChannelForSyncing).flags
    let { joystreamChannelId } = this.parse(AddUnauthorizedChannelForSyncing).flags
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

    const dynamo = new DynamodbService(this.appConfig.aws)
    const ytChannel = await ytpl(channelPlaylistId || '', { limit: videosLimit })

    // Ensure Youtube Channel is not already being synced.
    try {
      const ytCh = await dynamo.channels.getByChannelId(ytChannel.author.channelID)
      if (ytCh.performUnauthorizedSync) {
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

    // Ensure Joystream Channel is not already associated with some other Youtube channel.
    if (joystreamChannelId) {
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
      try {
        const { title } = await dynamo.channels.getByJoystreamChannelId(joystreamChannelId)
        // Allow to re-sync the same JS channel with the same YT channel
        if (title !== ytChannel.author.name) {
          throw new CLIError(
            `Joystream Channel ${joystreamChannelId} is already associated with another Youtube channel. Try again with different --joystreamChannelId`,
            {
              exit: CLIExitCodes.InvalidInput,
            }
          )
        }
      } catch (error) {
        if (error instanceof CLIError) {
          throw error
        }
      }
    }

    this.jsonPrettyPrint(JSON.stringify({ channelUrl, ytChannelId, videosLimit, joystreamChannelId }))
    await this.requireConfirmation('Do you confirm the provided input?', true)

    if (!joystreamChannelId) {
      await this.requireConfirmation(
        'No --joystreamChannelId was provided, so by default a new Joystream channel will be created ',
        true
      )
      joystreamChannelId = await this.createJoystreamChannel(ytChannel)
    }

    // Save channel to DB
    const c = await dynamo.channels.save({
      id: ytChannel.author.channelID,
      title: ytChannel.author.name,
      userId: `UnauthorizedUser-${ytChannel.author.channelID}`,
      joystreamChannelId,
      createdAt: new Date(),
      lastActedAt: new Date(),
      shouldBeIngested: true,
      yppStatus: 'Unverified',
      videoCategoryId: '868-2',
      performUnauthorizedSync: true,
    } as YtChannel)

    // Save videos to DB
    for (const video of ytChannel.items) {
      await dynamo.videos.save({
        id: video.id,
        channelId: ytChannel.author.channelID,
        title: video.title,
        thumbnails: { default: video.thumbnails[0]?.url, medium: video.thumbnails[1]?.url } as Thumbnails,
        duration: video.durationSec || 0,
        createdAt: new Date(),
        resourceId: video.id,
        url: video.shortUrl,
        privacyStatus: 'public',
        uploadStatus: 'processed',
        joystreamChannelId: c.joystreamChannelId,
        liveBroadcastContent: video.isLive ? 'live' : 'none',
        state: 'New',
        viewCount: 0,
      } as YtVideo)
    }

    this.log(
      `Successfully added Channel ${JSON.stringify({
        ytChannel: ytChannel.author.name,
        joystreamChannel: joystreamChannelId,
      })} to DB for unauthorized syncing`
    )
  }
}
