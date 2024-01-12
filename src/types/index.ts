import { YoutubeSyncNodeConfiguration } from './generated/ConfigJson'

type SyncEnabled = Omit<NonNullable<YoutubeSyncNodeConfiguration['sync']>, 'limits'> & {
  enable: true
  downloadsDir: string // make required when enabled
  intervals: NonNullable<YoutubeSyncNodeConfiguration['sync']['intervals']> // make required when enabled
  limits: Omit<NonNullable<YoutubeSyncNodeConfiguration['sync']['limits']>, 'storage'> & { storage: number }
}

type SyncDisabled = Omit<NonNullable<YoutubeSyncNodeConfiguration['sync']>, 'limits'> & {
  enable: false
  downloadsDir?: string
  intervals?: YoutubeSyncNodeConfiguration['sync']['intervals']
  limits?: Omit<NonNullable<YoutubeSyncNodeConfiguration['sync']['limits']>, 'storage'> & { storage: number }
}

type YoutubeApiEnabled = Omit<YoutubeSyncNodeConfiguration['youtube'], 'api'> & {
  apiMode: 'api' | 'both'
  api: NonNullable<YoutubeSyncNodeConfiguration['youtube']['api']>
}

type YoutubeApiDisabled = Omit<YoutubeSyncNodeConfiguration['youtube'], 'api'> & {
  apiMode: 'api-free'
}

export type Config = Omit<YoutubeSyncNodeConfiguration, 'sync' | 'youtube'> & {
  version: string
  sync: SyncEnabled | SyncDisabled
  youtube: YoutubeApiEnabled | YoutubeApiDisabled
}

export type ReadonlyConfig = DeepReadonly<Config>
export type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }

type Secret<T> = { [K in keyof T]: '###SECRET###' }

export type DisplaySafeConfig = Omit<Config, 'youtube' | 'aws' | 'httpApi' | 'joystream' | 'logs'> & {
  httpApi: Secret<Config['httpApi']>
  youtube: Secret<Config['youtube']>
  joystream: Secret<Config['joystream']>
  logs?: { elastic: Secret<NonNullable<Config['logs']>['elastic']> }
  aws?: { credentials: Secret<NonNullable<Config['aws']>['credentials']> }
}

export function formattedJSON(obj: unknown) {
  return JSON.stringify(obj, null, 2)
}

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> }
