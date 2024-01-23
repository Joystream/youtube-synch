import { ReadonlyConfig } from '../../types'
import { YtDlpClient } from './openApi'
import { YoutubeOperationalApi } from './operationalApi'

export const YT_VIDEO_TITLE_REQUIRED_FOR_SIGNUP = `I want to be in YPP`

export class YoutubeApi {
  public readonly ytdlp: YtDlpClient
  public readonly operationalApi: YoutubeOperationalApi

  constructor(private config: ReadonlyConfig) {
    this.ytdlp = new YtDlpClient(config)
    this.operationalApi = new YoutubeOperationalApi(config)
  }

  getCreatorOnboardingRequirements() {
    return this.config.creatorOnboardingRequirements
  }
}
