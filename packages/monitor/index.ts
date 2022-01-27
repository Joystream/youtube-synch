import * as aws from '@pulumi/aws';
import { channelIngestionScheduler } from './lambdas/channelIngestionScheduler';
import { userCreatedHandler } from './lambdas/userCreatedHandler';
import { ingestChannelHandler } from './lambdas/ingestChannelHandler';
import {
  videoCreatedHandler,
  videoStateLogger,
} from './lambdas/videoCreatedHandler';
import { EventRuleEvent } from '@pulumi/aws/cloudwatch';
import { orphanUsersChecker } from './lambdas/orphanUsersChecker';
import { AvailableTopic } from '../ytube/src';
// Create an AWS resource (S3 Bucket)

// every 30 minutes will scan users that do not have any channels
aws.cloudwatch.onSchedule(
  'orphanUsersChecker', 
  'cron(0/30 * * * ? *)', 
  new aws.lambda.CallbackFunction<EventRuleEvent, void>("orphanUsersChecker", {
    callback: orphanUsersChecker
}))

const schedule = new aws.cloudwatch.EventRule('everyMinute', {
  description: 'Event is fired every hour',
  name: 'everyMinute',
  scheduleExpression: 'cron(0/1 * * * ? *)',
});
// topics
const userCreatedTopic = new aws.sns.Topic(<AvailableTopic>'userEvents');
const ingestChannelTopic = new aws.sns.Topic(<AvailableTopic>'channelEvents');
const videoEvents = new aws.sns.Topic(<AvailableTopic>'videoEvents');
// subscriptions
schedule.onEvent('everyMinute', channelIngestionScheduler);
userCreatedTopic.onEvent('userCreated', userCreatedHandler);
ingestChannelTopic.onEvent('ingestChannel', ingestChannelHandler);
videoEvents.onEvent('videoCreated', videoCreatedHandler);
videoEvents.onEvent('videoEvent', videoStateLogger);
