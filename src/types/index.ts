import { YoutubeSyncNodeConfiguration } from './generated/ConfigJson'
import { YtVideo } from './youtube'

export type Config = YoutubeSyncNodeConfiguration

export type ReadonlyConfig = DeepReadonly<YoutubeSyncNodeConfiguration>
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }

type Secret<T> = { [K in keyof T]: '###SECRET###' }

export function toPrettyJSON(obj: unknown) {
  return JSON.stringify(obj, null, 2)
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> }

export type VideoProcessingTask = YtVideo & {
  joystreamChannelId: number
  priorityScore: number //
}
