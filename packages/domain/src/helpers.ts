import { config } from 'aws-sdk'

export function setAwsConfig() {
  process.env.DEPLOYMENT_ENV === 'local' &&
    config.update({
      region: process.env.AWS_REGION,
      dynamodb: { endpoint: process.env.AWS_ENDPOINT },
      sns: { endpoint: process.env.AWS_ENDPOINT },
      s3: { endpoint: process.env.AWS_ENDPOINT },
    })
}
