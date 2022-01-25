import * as aws from '@pulumi/aws';
import { channelIngestionScheduler } from './lambdas/channelIngestionScheduler';
import { userCreatedHandler } from './lambdas/userCreatedHandler';
import { ingestChannelHandler } from './lambdas/ingestChannelHandler';
import {
  videoCreatedHandler,
  videoStateLogger,
} from './lambdas/videoCreatedHandler';
// Create an AWS resource (S3 Bucket)
const schedule = new aws.cloudwatch.EventRule('everyMinute', {
  description: 'Event is fired every hour',
  name: 'everyMinute',
  scheduleExpression: 'cron(0/1 * * * ? *)',
});
// topics
const userCreatedTopic = new aws.sns.Topic('userEvents');
const ingestChannelTopic = new aws.sns.Topic('channelEvents');
const videoEvents = new aws.sns.Topic('videoEvents');
// subscriptions
schedule.onEvent('everyMinute', channelIngestionScheduler);
userCreatedTopic.onEvent('userCreated', userCreatedHandler);
ingestChannelTopic.onEvent('ingestChannel', ingestChannelHandler);
videoEvents.onEvent('videoCreated', videoCreatedHandler);
videoEvents.onEvent('videoEvent', videoStateLogger);

// joystream upload queue
const uploadVideoQueue = new aws.sqs.Queue('uploadVideo');
