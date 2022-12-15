import { ingestChannelHandler } from './src/lambdas/ingestChannel'
import { ingestionScheduler } from './src/lambdas/ingestionScheduler'
import { orphanUsersChecker } from './src/lambdas/orphanUsers'
import { userCreatedHandler } from './src/lambdas/userCreated'
import { createVideoHandler } from './src/lambdas/createVideo'
import { uploadVideoHandler } from './src/lambdas/uploadVideo'

export const ingestChannel = ingestChannelHandler
export const scheduler = ingestionScheduler
export const createVideo = createVideoHandler
export const uploadVideo = uploadVideoHandler
export const userCreated = userCreatedHandler
export const orphanUsers = orphanUsersChecker
