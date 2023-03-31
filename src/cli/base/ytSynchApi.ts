import { flags } from '@oclif/command'
import { CLIError } from '@oclif/errors'
import axios, { AxiosError } from 'axios'
import { ChannelDto, VideoDto } from 'src/services/httpApi/dtos'
import DefaultCommandBase from './default'
import ExitCodes from './ExitCodes'

/**
 * Abstract base class for commands that require access to the YtSynch Http API.
 */
export default abstract class YtSynchCommandBase extends DefaultCommandBase {
  protected httpApiUrl!: string

  static flags = {
    httpApiUrl: flags.string({
      required: false,
      default: `http://localhost:${process.env.YT_SYNCH__HTTP_API__PORT || 3001}`,
      description: 'HttpApi URL from where channels & videos stats should be fetched',
    }),
    ...DefaultCommandBase.flags,
  }

  async init(): Promise<void> {
    await super.init()
    const { httpApiUrl } = this.parse(this.constructor as typeof YtSynchCommandBase).flags
    this.httpApiUrl = httpApiUrl.endsWith('/') ? httpApiUrl.slice(0, -1) : httpApiUrl
  }

  async getChannel(channelId: number): Promise<ChannelDto> {
    try {
      const response = await axios.get<ChannelDto>(`${this.httpApiUrl}/channels/${channelId}`)
      return response.data
    } catch (error) {
      throw new CLIError(`Failed to fetch channel from HttpApi, msg: ${(error as AxiosError).response?.data.message}`, {
        exit: ExitCodes.HttpApiError,
      })
    }
  }

  async getChannels(): Promise<ChannelDto[]> {
    try {
      const response = await axios.get<ChannelDto[]>(`${this.httpApiUrl}/channels`)
      return response.data
    } catch (error) {
      throw new CLIError(
        `Failed to fetch channels from HttpApi, msg: ${(error as AxiosError).response?.data.message}`,
        {
          exit: ExitCodes.HttpApiError,
        }
      )
    }
  }

  async getVideosByChannel(channelId: number): Promise<VideoDto[]> {
    try {
      const response = await axios.get<VideoDto[]>(`${this.httpApiUrl}/channels/${channelId}/videos`)
      return response.data
    } catch (error) {
      throw new CLIError(`Failed to fetch videos from HttpApi, msg: ${(error as AxiosError).response?.data.message}`, {
        exit: ExitCodes.HttpApiError,
      })
    }
  }
}
