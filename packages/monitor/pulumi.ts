import { AvailableTopic } from '@joystream/ytube'
import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import { lambda } from './src/lambda'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { getConfig, DeploymentEnv } from '../domain/src/config'

interface CommonInfraOutput {
  videosTopicArn: string
  channelsTopicArn: string
  usersTopicArn: string
  usersTableArn: string
  channelsTableArn: string
  videosTableArn: string
  videoLogsTableArn: string
  statsTableArn: string
}

const nameof = <T>(name: keyof T) => <string>name
const resourceSuffix = getConfig().DEPLOYMENT_ENV as DeploymentEnv

const commonInfraStackReference = `zeeshanakram3/youtube-partner-program/${process.env.DEPLOYMENT_ENV}`
const commonInfrastructure = new pulumi.StackReference(commonInfraStackReference)
const orphanUsersSchedule = new aws.cloudwatch.EventRule('everyHalfHour', {
  description: 'Check',
  name: 'everyHalfHour',
  scheduleExpression: 'cron(0/30 * * * ? *)',
})
const ingestionSchedule = new aws.cloudwatch.EventRule('everyMinute', {
  description: 'Event is fired every minute',
  name: 'everyMinute',
  scheduleExpression: 'cron(0/1 * * * ? *)',
})

const buildDirectory = '../../dist/packages/monitor'

const videoTopic = aws.sns.Topic.get(
  <AvailableTopic>'videoEvents',
  commonInfrastructure.getOutputValue(nameof<CommonInfraOutput>('videosTopicArn'))
)
const channelsTopic = aws.sns.Topic.get(
  <AvailableTopic>'channelEvents',
  commonInfrastructure.getOutputValue(nameof<CommonInfraOutput>('channelsTopicArn'))
)

//lambdas

// Bind ingestionSchedule (everyMinute) EventRule to scheduler lambda
ingestionSchedule.onEvent('channelsIngestion', lambda('scheduler', resourceSuffix, 'main.scheduler', buildDirectory))
orphanUsersSchedule.onEvent(
  'checkOrphanUsers',
  lambda('orphanUsers', resourceSuffix, 'main.orphanUsers', buildDirectory)
)

// Bind videoEvents SNS topic to videoCreated lambda
videoTopic.onEvent('videoCreated', lambda('videoCreated', resourceSuffix, 'main.videoCreated', buildDirectory))
channelsTopic.onEvent('ingestChannel', lambda('ingestChannel', resourceSuffix, 'main.ingestChannel', buildDirectory))
