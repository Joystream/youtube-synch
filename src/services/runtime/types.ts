import { IChannelMetadata, IVideoMetadata } from '@joystream/metadata-protobuf'
import { ChannelId, DataObjectId, VideoId } from '@joystream/types/primitives'
import { AugmentedEvent, AugmentedEvents } from '@polkadot/api/types/events'
import { GenericEvent } from '@polkadot/types'
import { Readable } from 'stream'

export type DataObjectMetadata = {
  size: number
  ipfsHash: string
}

type VideoAssetsKey = 'thumbnailPhoto' | 'video'
export type VideoAssets<T> = {
  [key in VideoAssetsKey]?: T
}
export type VideoInputAssets = VideoAssets<DataObjectMetadata>
export type VideoAssetsIds = VideoAssets<string>

type ChannelAssetsKey = 'coverPhoto' | 'avatarPhoto'
export type ChannelAssets<T> = {
  [key in ChannelAssetsKey]?: T
}
export type ChannelInputAssets = ChannelAssets<DataObjectMetadata>
export type ChannelAssetsIds = ChannelAssets<string>

export enum ExtrinsicStatus {
  ProcessingAssets,
  Unsigned,
  Signed,
  Syncing,
  Completed,
  Error,
  VoucherSizeLimitExceeded,
}
export type ExtrinsicStatusCallbackFn = (status: ExtrinsicStatus.Unsigned | ExtrinsicStatus.Signed) => void
export type ExtrinsicResult<T = undefined> = T extends undefined
  ? {
      block: number
    }
  : { block: number } & T

export type VideoInputParameters = Omit<IVideoMetadata, 'thumbnailPhoto' | 'video' | 'mediaType'> & {
  mimeMediaType?: string
}
export type ChannelInputMetadata = Omit<IChannelMetadata, 'coverPhoto' | 'avatarPhoto' | 'category'>

type JoystreamEvents = AugmentedEvents<'promise'>
type JoystreamEventData<TEvent> = TEvent extends AugmentedEvent<'promise', infer X> ? X : never
export type GetEventDataFn = <TSection extends keyof JoystreamEvents, TMethod extends keyof JoystreamEvents[TSection]>(
  section: TSection,
  method: TMethod
) => JoystreamEventData<JoystreamEvents[TSection][TMethod]>

export type ExtractChannelResultsAssetsIdsFn = (
  inputAssets: ChannelInputAssets,
  getEventData: GetEventDataFn
) => ChannelAssetsIds

export type ExtractVideoResultsAssetsIdsFn = (
  inputAssets: VideoInputAssets,
  getEventData: GetEventDataFn
) => VideoAssetsIds

export type SendExtrinsicResult = ExtrinsicResult<{
  events: GenericEvent[]
  getEventData: GetEventDataFn
}>

export type ChannelExtrinsicResult = ExtrinsicResult<{
  channelId: ChannelId
  assetsIds: ChannelAssetsIds
}>

export type VideoExtrinsicResult = ExtrinsicResult<{
  videoId: VideoId
  assetsIds: DataObjectId[]
}>

export type StorageNodeInfo = {
  bucketId: number
  apiEndpoint: string
}

export type AssetUploadInput = {
  dataObjectId: DataObjectId
  file: Readable
}

export type VideoFFProbeMetadata = {
  width?: number
  height?: number
  codecName?: string
  codecFullName?: string
  duration?: number
}

export type VideoFileMetadata = VideoFFProbeMetadata & {
  size: number
  container: string
  mimeType: string
}
