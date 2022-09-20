import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

export function lambda(name: string, handler: string, source: string) {
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
    environment: {
      variables: {
        YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID,
        YOUTUBE_CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET,
        YOUTUBE_REDIRECT_URI: process.env.YOUTUBE_REDIRECT_URI,
        AWS_ENDPOINT: process.env.AWS_ENDPOINT,
        JOYSTREAM_QUERY_NODE_URL: process.env.JOYSTREAM_QUERY_NODE_URL,
        JOYSTREAM_WEBSOCKET_RPC: process.env.JOYSTREAM_WEBSOCKET_RPC,
        JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT: process.env.JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT,
        JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID: process.env.JOYSTREAM_CHANNEL_COLLABORATOR_MEMBER_ID,
      },
    },
  })
  return func
}
