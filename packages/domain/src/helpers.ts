import { config } from 'aws-sdk'
import * as dynamoose from 'dynamoose'
import { getConfig } from './config'

export function setAwsConfig() {
  const { AWS_ENDPOINT, DEPLOYMENT_ENV } = getConfig()
  DEPLOYMENT_ENV === 'local' &&
    config.update({
      region: process.env.AWS_REGION,
      dynamodb: { endpoint: AWS_ENDPOINT }, // -> doesn't seem to not work
      sns: { endpoint: AWS_ENDPOINT },
      s3: { endpoint: AWS_ENDPOINT },
    })

  // Separately configure dynamoose with local endpoint
  // because somehow it doesn't work with aws-sdk config
  DEPLOYMENT_ENV === 'local' && dynamoose.aws.ddb.local(AWS_ENDPOINT)
}

export function toPrettyJSON(obj: unknown) {
  return JSON.stringify(obj, null, 2)
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> }
