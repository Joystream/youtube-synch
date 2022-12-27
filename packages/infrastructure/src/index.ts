import * as aws from '@pulumi/aws'
// pulumi doesn't work properly with monorepos atm
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { User, Channel, Video, VideoEvent, Stats } from '../../domain/src'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { AvailableTopic } from '../../ytube/src'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { DeploymentEnv, getConfig } from '../../domain/src/config'

const nameof = <T>(name: keyof T) => <string>name
const resourceSuffix = getConfig().DEPLOYMENT_ENV as DeploymentEnv

function lambdaFunction(name: string, resourceSuffix: DeploymentEnv, handler: string, source: string) {
  // IAM role
  const role = new aws.iam.Role(`${name}Role`, {
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
          Effect: 'Allow',
          Sid: '',
        },
      ],
    },
  })

  // IAM policy attachments
  new aws.iam.RolePolicyAttachment(`${name}Attach`, {
    role: role,
    policyArn: aws.iam.ManagedPolicies.AWSLambdaExecute,
  })

  new aws.iam.RolePolicyAttachment(`${name}DynamoAttach`, {
    role: role,
    policyArn: aws.iam.ManagedPolicies.AmazonDynamoDBFullAccess,
  })

  // Next, create the Lambda function itself:
  const func = new aws.lambda.Function(name, {
    code: new pulumi.asset.AssetArchive({
      '.': new pulumi.asset.FileArchive(source),
    }),
    runtime: 'nodejs14.x',
    role: role.arn,
    handler: handler,
    name: name,
    tags: { environment: resourceSuffix },
    memorySize: 1024,
    timeout: 60,
    environment: {
      variables: getConfig(),
    },
  })
  return func
}

const yppEndpoint = new awsx.apigateway.API('ypp-api', {
  routes: [
    {
      path: '{proxy+}',
      method: 'ANY',
      eventHandler: lambdaFunction('ypp-api', resourceSuffix, 'main.handler', '../../../dist/packages/api-lambda'),
    },
  ],
})

const userTable = new aws.dynamodb.Table('users', {
  name: 'users',
  hashKey: nameof<User>('id'),
  attributes: [
    {
      name: nameof<User>('id'),
      type: 'S',
    },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
  tags: { environment: resourceSuffix },
})

const channelsTable = new aws.dynamodb.Table('channels', {
  name: 'channels',
  hashKey: nameof<Channel>('userId'),
  rangeKey: nameof<Channel>('id'),
  attributes: [
    {
      name: nameof<Channel>('userId'),
      type: 'S',
    },
    {
      name: nameof<Channel>('id'),
      type: 'S',
    },
    {
      name: nameof<Channel>('frequency'),
      type: 'N',
    },
    {
      name: nameof<Channel>('createdAt'),
      type: 'N',
    },
    {
      name: nameof<Channel>('phantomKey'),
      type: 'S',
    },
  ],
  billingMode: 'PROVISIONED',
  globalSecondaryIndexes: [
    {
      name: 'frequency-id-index',
      hashKey: nameof<Channel>('frequency'),
      rangeKey: nameof<Channel>('id'),
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
    {
      name: 'phantomKey-createdAt-index',
      hashKey: nameof<Channel>('phantomKey'), // we'll have a single partition for users
      rangeKey: nameof<Channel>('createdAt'),
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
    {
      hashKey: nameof<Channel>('id'),
      name: 'id-index',
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
  ],
  readCapacity: 1,
  writeCapacity: 1,
  tags: { environment: resourceSuffix },
})

const videosTable = new aws.dynamodb.Table('videos', {
  name: 'videos',
  hashKey: nameof<Video>('channelId'),
  rangeKey: nameof<Video>('id'),
  attributes: [
    {
      name: nameof<Video>('channelId'),
      type: 'S',
    },
    {
      name: nameof<Video>('id'),
      type: 'S',
    },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
  tags: { environment: resourceSuffix },
})

const videoLogsTable = new aws.dynamodb.Table('videoLogs', {
  attributes: [
    {
      name: 'videoId',
      type: 'S',
    },
    {
      name: 'channelId',
      type: 'S',
    },
  ],
  name: 'videoLogs',
  hashKey: nameof<VideoEvent>('channelId'), // we'll have a single partition for users
  rangeKey: nameof<VideoEvent>('videoId'),
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
  tags: { environment: resourceSuffix },
})

const statsTable = new aws.dynamodb.Table('stats', {
  name: 'stats',
  hashKey: nameof<Stats>('partition'),
  rangeKey: nameof<Stats>('date'),
  attributes: [
    { name: nameof<Stats>('partition'), type: 'S' },
    { name: nameof<Stats>('date'), type: 'S' },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 1,
  writeCapacity: 1,
  tags: { environment: resourceSuffix },
})

const userEventsTopic = new aws.sns.Topic(<AvailableTopic>'userEvents', {
  name: <AvailableTopic>'userEvents',
  displayName: 'Users events',
})

const channelEventsTopic = new aws.sns.Topic(<AvailableTopic>'channelEvents', {
  displayName: 'Channels events',
  name: <AvailableTopic>'channelEvents',
})

const createVideoEvents = new aws.sns.Topic(<AvailableTopic>'createVideoEvents', {
  name: <AvailableTopic>'createVideoEvents',
  displayName: 'Create Videos events',
})

const uploadVideoEvents = new aws.sns.Topic(<AvailableTopic>'uploadVideoEvents', {
  name: <AvailableTopic>'uploadVideoEvents',
  displayName: 'Upload Videos events',
})

export const usersTableArn = userTable.arn
export const channelsTableArn = channelsTable.arn
export const videosTableArn = videosTable.arn
export const videoLogsTableArn = videoLogsTable.arn
export const statsTableArn = statsTable.arn

export const createVideosTopicArn = createVideoEvents.arn
export const uploadVideosTopicArn = uploadVideoEvents.arn
export const channelsTopicArn = channelEventsTopic.arn
export const usersTopicArn = userEventsTopic.arn

export const url = yppEndpoint.url
