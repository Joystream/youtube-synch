import { EventRuleEvent } from '@pulumi/aws/cloudwatch'
import { MessageBus, SyncService, YtClient } from '@joystream/ytube'
import { setAwsConfig } from '@youtube-sync/domain'

export async function ingestionScheduler(event: EventRuleEvent) {
  // Set AWS config in case we are running locally
  setAwsConfig()

  console.log('event: ', event)
  const youtubeClient = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  // const date = new Date(event.time)
  // const frequencies = getMatchingFrequenciesForDate(date)
  // if (frequencies.length === 0) return
  await new SyncService(youtubeClient, new MessageBus()).startIngestionFor([0])
}
