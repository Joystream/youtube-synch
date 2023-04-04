import { getInputJson } from '@joystream/js/utils'
import { flags } from '@oclif/command'
import { execFile } from 'child_process'
import { promisify } from 'util'
import RuntimeApiCommandBase from '../../base/runtimeApi'
import { SyncMultipleChannelsInputSchema } from '../../utils/jsonSchemas'
import { SyncMultipleChannelsInput } from '../../utils/types'

export default class SyncMultipleUnauthorizedChannels extends RuntimeApiCommandBase {
  static description = 'Sync multiple unauthorized channels, this command internally uses.'
  static flags = {
    input: flags.string({
      char: 'i',
      required: true,
      description: `Path to JSON file to use as input`,
    }),
    ...RuntimeApiCommandBase.flags,
  }

  async run(): Promise<void> {
    const { input } = this.parse(SyncMultipleUnauthorizedChannels).flags
    const channels = await getInputJson<SyncMultipleChannelsInput>(input, SyncMultipleChannelsInputSchema)

    const pExecFile = promisify(execFile)

    for (const { channelUrl, videosLimit } of channels) {
      this.log(`Adding channel ${channelUrl} for syncing`)
      await pExecFile('./bin/run', [
        `addUnauthorizedChannelForSyncing`,
        '--channelUrl',
        channelUrl,
        '--videosLimit',
        videosLimit.toString(),
      ])
    }

    this.log(`Successfully added all channels for syncing`)
  }
}
