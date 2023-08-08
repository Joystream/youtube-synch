import { YtChannel } from '../../types/youtube'

export class SyncLimits {
  static videoCap(ch: YtChannel): number {
    if (ch.statistics.subscriberCount < 5000) {
      return 100
    } else if (ch.statistics.subscriberCount < 50000) {
      return 250
    } else {
      return 1000
    }
  }

  static sizeCap(ch: YtChannel): number {
    if (ch.statistics.subscriberCount < 5000) {
      return 10_000_000_000 // 10 GB
    } else if (ch.statistics.subscriberCount < 50000) {
      return 100_000_000_000 // 100 GB
    } else {
      return 1_000_000_000_000 // 1 TB
    }
  }

  static hasSizeLimitReached(ch: YtChannel) {
    return ch.historicalVideoSyncedSize >= this.sizeCap(ch)
  }
}
