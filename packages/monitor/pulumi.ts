import { AvailableTopic } from '@joystream/ytube'
import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
import { lambda } from './src/lambda'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { DeploymentEnv, getConfig } from '../domain/src/config'

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

const buildDirectory = '../../dist/packages/monitor'

const commonInfraStackReference = `zeeshanakram3/youtube-partner-program/${process.env.DEPLOYMENT_ENV}`
const commonInfrastructure = new pulumi.StackReference(commonInfraStackReference)
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

const ingestionSchedule = new aws.cloudwatch.EventRule('everyHalfHour', {
  description: 'Event is fired every thirty minutes',
  name: 'everyHalfHour',
  scheduleExpression: 'cron(0/30 * * * ? *)',
})

// lambda layer
// const { arn } = lambdaLayer('ffmpeg-layer', '../../dist/layer')

//lambdas

// Bind ingestionSchedule (everyMinute) EventRule to scheduler lambda
ingestionSchedule.onEvent('channelsIngestion', lambda('scheduler', resourceSuffix, 'main.scheduler', buildDirectory))
// Bind channelEvents SNS topic to ingestChannel lambda
channelsTopic.onEvent('ingestChannel', lambda('ingestChannel', resourceSuffix, 'main.ingestChannel', buildDirectory))
// Bind uploadVideoEvents SNS topic to uploadVideo lambda
uploadVideosTopic.onEvent('uploadVideo', lambda('uploadVideo', resourceSuffix, 'main.uploadVideo', buildDirectory))

const size = 't2.medium'
const group = new aws.ec2.SecurityGroup('ypp-server-security-group', {
  ingress: [
    { protocol: 'tcp', fromPort: 22, toPort: 22, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 443, toPort: 443, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 80, toPort: 80, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 4000, toPort: 4000, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 9944, toPort: 9944, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 9933, toPort: 9933, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 8081, toPort: 8081, cidrBlocks: ['0.0.0.0/0'] },
    { protocol: 'tcp', fromPort: 30333, toPort: 30333, cidrBlocks: ['0.0.0.0/0'] },
  ],
  egress: [{ protocol: '-1', fromPort: 0, toPort: 0, cidrBlocks: ['0.0.0.0/0'] }],
})
const server = new aws.ec2.Instance('ypp-server', {
  tags: { Name: 'ypp-server' },
  keyName: 'zeeshan',
  instanceType: size,
  vpcSecurityGroupIds: [group.id], // reference the security group resource above
  ami: 'ami-0574da719dca65348', // Ubuntu
})

export const publicIp = server.publicIp
export const publicHostName = server.publicDns
