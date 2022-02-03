import { AvailableTopic } from '@joystream/ytube';
import * as aws from '@pulumi/aws';
import * as pulumi from "@pulumi/pulumi";
import { lambda } from './src/lambda';
interface CommonInfraOutput{
    videosTopicArn: string,
    channelsTopicArn: string,
    usersTopicArn: string,
    usersTableArn: string,
    channelsTableArn: string,
    videosTableArn: string,
    videoLogsTableArn: string,
    statsTableArn: string,
}
const nameof = <T>(name: keyof T) => <string>name;
const commonInfrastructure = new pulumi.StackReference('joystream/youtube-sync/dev')
const orphanUsersSchedule = new aws.cloudwatch.EventRule('everyHalfHour', {
    description: 'Check',
    name: 'everyHalfHour',
    scheduleExpression: 'cron(0/30 * * * ? *)'
})
const ingestionSchedule = new aws.cloudwatch.EventRule('everyMinute', {
  description: 'Event is fired every hour',
  name: 'everyMinute',
  scheduleExpression: 'cron(0/1 * * * ? *)',
});
const buildDirectory = '../../dist/packages/monitor'

const videoTopic = aws.sns.Topic.get(<AvailableTopic>'videoEvents', commonInfrastructure.getOutputValue(nameof<CommonInfraOutput>('videosTopicArn')));
const channelsTopic = aws.sns.Topic.get(<AvailableTopic>'channelEvents', commonInfrastructure.getOutputValue(nameof<CommonInfraOutput>('channelsTopicArn')));

//lambdas
ingestionSchedule.onEvent('channelsIngestion', lambda('scheduler', 'main.scheduler', buildDirectory))
orphanUsersSchedule.onEvent('checkOrphanUsers', lambda('orphanUsers', 'main.orphanUsers', buildDirectory))
videoTopic.onEvent('videoCreated', lambda('videoCreated', 'main.videoCreated', buildDirectory))
channelsTopic.onEvent('ingestChannel', lambda('ingestChannel', 'main.ingestChannel', buildDirectory))



