import { StatsRepository } from '../../repository'
import { ReadonlyConfig } from '../../types'
import { QuotaMonitoringDataApiV3 } from './api'
import { YtDlpClient } from './openApi'
import { YoutubeOperationalApi } from './operationalApi'

export class YoutubeApi {
  public readonly dataApiV3: QuotaMonitoringDataApiV3
  public readonly ytdlp: YtDlpClient
  public readonly operationalApi: YoutubeOperationalApi

  constructor(private config: ReadonlyConfig, statsRepo: StatsRepository) {
    this.ytdlp = new YtDlpClient(config)

    this.operationalApi = new YoutubeOperationalApi(config)

    if (this.config.youtube.apiMode !== 'api-free') {
      this.dataApiV3 = new QuotaMonitoringDataApiV3(config, statsRepo)
    }
  }

  getCreatorOnboardingRequirements() {
    return this.config.creatorOnboardingRequirements
  }
}
