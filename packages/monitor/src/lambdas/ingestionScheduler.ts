import { EventRuleEvent } from '@pulumi/aws/cloudwatch'
import { MessageBus, getMatchingFrequenciesForDate, SyncService, YtClient } from '@joystream/ytube'
import { config } from 'aws-sdk'

export async function ingestionScheduler(event: EventRuleEvent) {
  console.log('event: ', event)
  config.update({
    region: process.env.AWS_REGION,
    dynamodb: { endpoint: process.env.AWS_ENDPOINT },
  })
  const youtubeClient = YtClient.create(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
  )
  // const date = new Date(event.time)
  // const frequencies = getMatchingFrequenciesForDate(date)
  // if (frequencies.length === 0) return
  await new SyncService(youtubeClient, new MessageBus(process.env.AWS_REGION)).startIngestionFor([0])
}
