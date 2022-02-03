import { ingestChannelHandler } from "./src/lambdas/ingestChannel";
import { ingestionScheduler } from "./src/lambdas/ingestionScheduler";
import { orphanUsersChecker } from "./src/lambdas/orphanUsers";
import { userCreatedHandler } from "./src/lambdas/userCreated";
import { videoCreatedHandler } from "./src/lambdas/videoCreated";

export const ingestChannel = ingestChannelHandler
export const scheduler = ingestionScheduler
export const videoCreated = videoCreatedHandler
export const userCreated = userCreatedHandler
export const orphanUsers = orphanUsersChecker
