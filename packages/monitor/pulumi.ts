import { AvailableTopic } from '@joystream/ytube'
import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import { lambda } from './src/lambda'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { getConfig, DeploymentEnv } from '../domain/src/config'

interface CommonInfraOutput {
  createVideosTopicArn: string
  uploadVideosTopicArn: string
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

const createVideosTopic = aws.sns.Topic.get(
  <AvailableTopic>'createVideoEvents',
  commonInfrastructure.getOutputValue(nameof<CommonInfraOutput>('createVideosTopicArn'))
)
const uploadVideosTopic = aws.sns.Topic.get(
  <AvailableTopic>'uploadVideoEvents',
  commonInfrastructure.getOutputValue(nameof<CommonInfraOutput>('uploadVideosTopicArn'))
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

// Bind channelEvents SNS topic to ingestChannel lambda
channelsTopic.onEvent('ingestChannel', lambda('ingestChannel', resourceSuffix, 'main.ingestChannel', buildDirectory))
// Bind createVideoEvents SNS topic to createVideo lambda
createVideosTopic.onEvent('createVideo', lambda('createVideo', resourceSuffix, 'main.createVideo', buildDirectory))
// Bind uploadVideoEvents SNS topic to uploadVideo lambda
uploadVideosTopic.onEvent('uploadVideo', lambda('uploadVideo', resourceSuffix, 'main.uploadVideo', buildDirectory))
