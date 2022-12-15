import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { getConfig, DeploymentEnv } from '../../domain/src/config'

type LambdaName = 'ingestChannel' | 'createVideo' | 'uploadVideo' | 'scheduler' | 'orphanUsers'

export function lambda(name: LambdaName, resourceSuffix: DeploymentEnv, handler: string, source: string) {
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

  new aws.iam.RolePolicyAttachment(`${name}SnsAttach`, {
    role: role,
    policyArn: aws.iam.ManagedPolicies.AmazonSNSFullAccess,
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
    reservedConcurrentExecutions: name === 'createVideo' ? 1 : -1,
    tags: { environment: resourceSuffix },
    timeout: name === 'createVideo' || name === 'uploadVideo' ? 900 : 30,
    memorySize: 512,
    environment: { variables: getConfig() },
  })
  return func
}
