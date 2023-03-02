import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'
import { ConfigParserService } from '../utils/configParser'
import { ReadonlyConfig } from '../types'
import { Stats, YtChannel, YtUser, YtVideo } from '../types/youtube'

const nameof = <T>(name: keyof T) => <string>name
const config = new ConfigParserService('./config.yml').parse()
const resourceSuffix = config.env

function lambdaFunction(name: string, resourceSuffix: ReadonlyConfig['env'], handler: string, source: string) {
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
      // variables: config,
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
  hashKey: nameof<YtUser>('id'),
  attributes: [
    {
      name: nameof<YtUser>('id'),
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
  hashKey: nameof<YtChannel>('userId'),
  rangeKey: nameof<YtChannel>('id'),
  attributes: [
    {
      name: nameof<YtChannel>('userId'),
      type: 'S',
    },
    {
      name: nameof<YtChannel>('id'),
      type: 'S',
    },
    {
      name: nameof<YtChannel>('joystreamChannelId'),
      type: 'N',
    },
    {
      name: nameof<YtChannel>('createdAt'),
      type: 'S',
    },
    {
      name: nameof<YtChannel>('phantomKey'),
      type: 'S',
    },
  ],
  billingMode: 'PROVISIONED',
  globalSecondaryIndexes: [
    {
      name: 'joystreamChannelId-createdAt-index',
      hashKey: nameof<YtChannel>('joystreamChannelId'), // we'll have a single value partition
      rangeKey: nameof<YtChannel>('createdAt'),
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
    {
      name: 'phantomKey-createdAt-index',
      hashKey: nameof<YtChannel>('phantomKey'), // we'll have a single value partition
      rangeKey: nameof<YtChannel>('createdAt'),
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
    {
      hashKey: nameof<YtChannel>('id'),
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
  hashKey: nameof<YtVideo>('channelId'),
  rangeKey: nameof<YtVideo>('id'),
  attributes: [
    {
      name: nameof<YtVideo>('channelId'),
      type: 'S',
    },
    {
      name: nameof<YtVideo>('id'),
      type: 'S',
    },
    {
      name: nameof<YtVideo>('state'),
      type: 'S',
    },
  ],
  globalSecondaryIndexes: [
    {
      hashKey: nameof<YtVideo>('state'),
      rangeKey: nameof<YtVideo>('channelId'),
      name: 'state-channelId-index',
      projectionType: 'ALL',
      readCapacity: 1,
      writeCapacity: 1,
    },
  ],
  billingMode: 'PROVISIONED',
  readCapacity: 10,
  writeCapacity: 10,
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

export const usersTableArn = userTable.arn
export const channelsTableArn = channelsTable.arn
export const videosTableArn = videosTable.arn
export const statsTableArn = statsTable.arn

export const url = yppEndpoint.url
