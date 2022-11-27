import { config } from 'aws-sdk'
import { getConfig } from './config'

export function setAwsConfig() {
  const { AWS_ENDPOINT, DEPLOYMENT_ENV } = getConfig()
  DEPLOYMENT_ENV === 'local' &&
    config.update({
      region: process.env.AWS_REGION,
      dynamodb: { endpoint: AWS_ENDPOINT },
      sns: { endpoint: AWS_ENDPOINT },
      s3: { endpoint: AWS_ENDPOINT },
    })
}
