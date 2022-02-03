import { ChannelMetadata, VideoMetadata } from '@joystream/content-metadata-protobuf'
export type DataObjectMetadata = {
    size: number
    ipfsHash: string
    replacedDataObjectId?: string
  }
  export type AccountId = string
  export type MemberId = string
  export type ChannelId = string
  export type VideoId = string
  export type JoystreamChannel = Omit<ChannelMetadata.AsObject, 'coverPhoto' | 'avatarPhoto' | 'category'>
  type ChannelAssetsKey = 'coverPhoto' | 'avatarPhoto'
  export type ChannelAssets<T> = {
    [key in ChannelAssetsKey]?: T
  }
  export type ChannelInputAssets = ChannelAssets<DataObjectMetadata>
  
  export type Membership = {
    memberId: MemberId,
    accountAddress: string,
    accountMnemonic: Mnemonic,
  }
  export type Mnemonic = string
  
  