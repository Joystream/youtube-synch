import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

function lambdaFunction(name: string, handler: string, source: string) {
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
    memorySize: 512,
    timeout: 10,
  })
  return func
}

const endpoint = new awsx.apigateway.API('youtube-sync-api', {
  routes: [
    {
      path: '{proxy+}',
      method: 'ANY',
      eventHandler: lambdaFunction('api', 'main.handler', '../../dist/packages/api-lambda'),
    },
  ],
})

export const url = endpoint.url
