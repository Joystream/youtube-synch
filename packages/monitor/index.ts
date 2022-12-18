import { ingestChannelHandler } from './src/lambdas/ingestChannel'
import { ingestionScheduler } from './src/lambdas/ingestionScheduler'
import { createVideoHandler } from './src/lambdas/createVideo'
import { uploadVideoHandler } from './src/lambdas/uploadVideo'

export const ingestChannel = ingestChannelHandler
export const scheduler = ingestionScheduler
export const createVideo = createVideoHandler
export const uploadVideo = uploadVideoHandler
