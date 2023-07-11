import AWS from 'aws-sdk'
import { loadConfig as config } from './config'

AWS.config.update({
  region: config().AWS_REGION,
  credentials: {
    accessKeyId: config().AWS_ACCESS_KEY_ID,
    secretAccessKey: config().AWS_SECRET_ACCESS_KEY,
  },
})

export default AWS
