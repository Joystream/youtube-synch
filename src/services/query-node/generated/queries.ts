import * as Types from './schema'

import gql from 'graphql-tag'
export type AppFieldsFragment = {
  id: string
  name: string
  websiteUrl?: Types.Maybe<string>
  useUri?: Types.Maybe<string>
  smallIcon?: Types.Maybe<string>
  mediumIcon?: Types.Maybe<string>
  bigIcon?: Types.Maybe<string>
  oneLiner?: Types.Maybe<string>
  description?: Types.Maybe<string>
  termsOfService?: Types.Maybe<string>
  category?: Types.Maybe<string>
  authKey?: Types.Maybe<string>
  platforms?: Types.Maybe<Array<string>>
  ownerMember: { id: string }
}

export type GetAppByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']
}>

export type GetAppByIdQuery = { appByUniqueInput?: Types.Maybe<AppFieldsFragment> }

export type GetAppsByNameQueryVariables = Types.Exact<{
  name: Types.Scalars['String']
}>

export type GetAppsByNameQuery = { apps: Array<AppFieldsFragment> }

export type ChannelFieldsFragment = {
  id: string
  totalVideosCreated: number
  videos: Array<{ id: string; videoStateBloatBond: any }>
  language?: Types.Maybe<{ id: string; iso: string }>
  ownerMember?: Types.Maybe<{ id: string; controllerAccount: string }>
}

export type GetChannelByIdQueryVariables = Types.Exact<{
  channelId: Types.Scalars['ID']
}>

export type GetChannelByIdQuery = { channelByUniqueInput?: Types.Maybe<ChannelFieldsFragment> }

export type VideoFieldsFragment = {
  id: string
  ytVideoId?: Types.Maybe<string>
  entryApp?: Types.Maybe<{ id: string; name: string }>
}

export type GetVideoByYtResourceIdAndEntryAppNameQueryVariables = Types.Exact<{
  ytVideoId: Types.Scalars['String']
  entryAppName: Types.Scalars['String']
}>

export type GetVideoByYtResourceIdAndEntryAppNameQuery = { videos: Array<VideoFieldsFragment> }

export type MemberMetadataFieldsFragment = { name?: Types.Maybe<string>; about?: Types.Maybe<string> }

export type MembershipFieldsFragment = {
  id: string
  handle: string
  controllerAccount: string
  rootAccount: string
  metadata: MemberMetadataFieldsFragment
}

export type GetMembersByIdsQueryVariables = Types.Exact<{
  ids?: Types.Maybe<Array<Types.Scalars['ID']> | Types.Scalars['ID']>
}>

export type GetMembersByIdsQuery = { memberships: Array<MembershipFieldsFragment> }

export type GetMemberByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['ID']
}>

export type GetMemberByIdQuery = { membershipByUniqueInput?: Types.Maybe<MembershipFieldsFragment> }

export type StorageNodeInfoFragment = {
  id: string
  dataObjectsSize: any
  dataObjectsSizeLimit: any
  dataObjectsCount: any
  dataObjectCountLimit: any
  operatorMetadata?: Types.Maybe<{ nodeEndpoint?: Types.Maybe<string> }>
}

export type GetStorageNodesInfoByBagIdQueryVariables = Types.Exact<{
  bagId?: Types.Maybe<Types.Scalars['ID']>
}>

export type GetStorageNodesInfoByBagIdQuery = { storageBuckets: Array<StorageNodeInfoFragment> }

export type GetStorageBucketsQueryVariables = Types.Exact<{
  count?: Types.Maybe<Types.Scalars['Int']>
}>

export type GetStorageBucketsQuery = { storageBuckets: Array<StorageNodeInfoFragment> }

export type StorageBucketsCountQueryVariables = Types.Exact<{ [key: string]: never }>

export type StorageBucketsCountQuery = { storageBucketsConnection: { totalCount: number } }

export type DistributionBucketFamilyFieldsFragment = { id: string; buckets: Array<{ id: string; bucketIndex: number }> }

export type GetDistributionFamiliesAndBucketsQueryVariables = Types.Exact<{ [key: string]: never }>

export type GetDistributionFamiliesAndBucketsQuery = {
  distributionBucketFamilies: Array<DistributionBucketFamilyFieldsFragment>
}

export type DataObjectInfoFragment = {
  id: string
  size: any
  stateBloatBond: any
  storageBagId: string
  type:
    | { __typename: 'DataObjectTypeChannelAvatar'; channel?: Types.Maybe<{ id: string }> }
    | { __typename: 'DataObjectTypeChannelCoverPhoto'; channel?: Types.Maybe<{ id: string }> }
    | { __typename: 'DataObjectTypeVideoMedia'; video?: Types.Maybe<{ id: string }> }
    | { __typename: 'DataObjectTypeVideoThumbnail'; video?: Types.Maybe<{ id: string }> }
    | {
        __typename: 'DataObjectTypeVideoSubtitle'
        video?: Types.Maybe<{ id: string }>
        subtitle?: Types.Maybe<{ id: string }>
      }
    | { __typename: 'DataObjectTypeUnknown' }
}

export type GetDataObjectsByBagIdQueryVariables = Types.Exact<{
  bagId?: Types.Maybe<Types.Scalars['ID']>
}>

export type GetDataObjectsByBagIdQuery = { storageDataObjects: Array<DataObjectInfoFragment> }

export type GetDataObjectsByChannelIdQueryVariables = Types.Exact<{
  channelId?: Types.Maybe<Types.Scalars['ID']>
}>

export type GetDataObjectsByChannelIdQuery = { storageDataObjects: Array<DataObjectInfoFragment> }

export type GetDataObjectsByVideoIdQueryVariables = Types.Exact<{
  videoId?: Types.Maybe<Types.Scalars['ID']>
}>

export type GetDataObjectsByVideoIdQuery = { storageDataObjects: Array<DataObjectInfoFragment> }

export type GetStorageBagInfoForAssetQueryVariables = Types.Exact<{
  assetId: Types.Scalars['ID']
}>

export type GetStorageBagInfoForAssetQuery = { storageDataObjectByUniqueInput?: Types.Maybe<DataObjectInfoFragment> }

export type QueryNodeStateFieldsFragment = { chainHead: number; lastCompleteBlock: number }

export type QueryNodeStateSubscriptionVariables = Types.Exact<{ [key: string]: never }>

export type QueryNodeStateSubscription = { stateSubscription: QueryNodeStateFieldsFragment }

export const AppFields = gql`
  fragment AppFields on App {
    id
    name
    ownerMember {
      id
    }
    websiteUrl
    useUri
    smallIcon
    mediumIcon
    bigIcon
    oneLiner
    description
    termsOfService
    category
    authKey
    platforms
  }
`
export const ChannelFields = gql`
  fragment ChannelFields on Channel {
    id
    videos {
      id
      videoStateBloatBond
    }
    language {
      id
      iso
    }
    ownerMember {
      id
      controllerAccount
    }
    totalVideosCreated
  }
`
export const VideoFields = gql`
  fragment VideoFields on Video {
    id
    ytVideoId
    entryApp {
      id
      name
    }
  }
`
export const MemberMetadataFields = gql`
  fragment MemberMetadataFields on MemberMetadata {
    name
    about
  }
`
export const MembershipFields = gql`
  fragment MembershipFields on Membership {
    id
    handle
    controllerAccount
    rootAccount
    metadata {
      ...MemberMetadataFields
    }
  }
  ${MemberMetadataFields}
`
export const StorageNodeInfo = gql`
  fragment StorageNodeInfo on StorageBucket {
    id
    dataObjectsSize
    dataObjectsSizeLimit
    dataObjectsCount
    dataObjectCountLimit
    operatorMetadata {
      nodeEndpoint
    }
  }
`
export const DistributionBucketFamilyFields = gql`
  fragment DistributionBucketFamilyFields on DistributionBucketFamily {
    id
    buckets {
      id
      bucketIndex
    }
  }
`
export const DataObjectInfo = gql`
  fragment DataObjectInfo on StorageDataObject {
    id
    size
    stateBloatBond
    type {
      __typename
      ... on DataObjectTypeVideoMedia {
        video {
          id
        }
      }
      ... on DataObjectTypeVideoThumbnail {
        video {
          id
        }
      }
      ... on DataObjectTypeVideoSubtitle {
        video {
          id
        }
        subtitle {
          id
        }
      }
      ... on DataObjectTypeChannelAvatar {
        channel {
          id
        }
      }
      ... on DataObjectTypeChannelCoverPhoto {
        channel {
          id
        }
      }
    }
    storageBagId
  }
`
export const QueryNodeStateFields = gql`
  fragment QueryNodeStateFields on ProcessorState {
    chainHead
    lastCompleteBlock
  }
`
export const GetAppById = gql`
  query getAppById($id: ID!) {
    appByUniqueInput(where: { id: $id }) {
      ...AppFields
    }
  }
  ${AppFields}
`
export const GetAppsByName = gql`
  query getAppsByName($name: String!) {
    apps(where: { name_eq: $name }) {
      ...AppFields
    }
  }
  ${AppFields}
`
export const GetChannelById = gql`
  query getChannelById($channelId: ID!) {
    channelByUniqueInput(where: { id: $channelId }) {
      ...ChannelFields
    }
  }
  ${ChannelFields}
`
export const GetVideoByYtResourceIdAndEntryAppName = gql`
  query getVideoByYtResourceIdAndEntryAppName($ytVideoId: String!, $entryAppName: String!) {
    videos(where: { ytVideoId_eq: $ytVideoId, entryApp: { name_eq: $entryAppName } }) {
      ...VideoFields
    }
  }
  ${VideoFields}
`
export const GetMembersByIds = gql`
  query getMembersByIds($ids: [ID!]) {
    memberships(where: { id_in: $ids }) {
      ...MembershipFields
    }
  }
  ${MembershipFields}
`
export const GetMemberById = gql`
  query getMemberById($id: ID!) {
    membershipByUniqueInput(where: { id: $id }) {
      ...MembershipFields
    }
  }
  ${MembershipFields}
`
export const GetStorageNodesInfoByBagId = gql`
  query getStorageNodesInfoByBagId($bagId: ID) {
    storageBuckets(
      where: {
        operatorStatus_json: { isTypeOf_eq: "StorageBucketOperatorStatusActive" }
        bags_some: { id_eq: $bagId }
        operatorMetadata: { nodeEndpoint_contains: "http" }
      }
    ) {
      ...StorageNodeInfo
    }
  }
  ${StorageNodeInfo}
`
export const GetStorageBuckets = gql`
  query getStorageBuckets($count: Int) {
    storageBuckets(where: { acceptingNewBags_eq: true }, limit: $count) {
      ...StorageNodeInfo
    }
  }
  ${StorageNodeInfo}
`
export const StorageBucketsCount = gql`
  query storageBucketsCount {
    storageBucketsConnection(where: { acceptingNewBags_eq: true }) {
      totalCount
    }
  }
`
export const GetDistributionFamiliesAndBuckets = gql`
  query getDistributionFamiliesAndBuckets {
    distributionBucketFamilies {
      ...DistributionBucketFamilyFields
    }
  }
  ${DistributionBucketFamilyFields}
`
export const GetDataObjectsByBagId = gql`
  query getDataObjectsByBagId($bagId: ID) {
    storageDataObjects(where: { storageBag: { id_eq: $bagId } }) {
      ...DataObjectInfo
    }
  }
  ${DataObjectInfo}
`
export const GetDataObjectsByChannelId = gql`
  query getDataObjectsByChannelId($channelId: ID) {
    storageDataObjects(where: { type_json: { channelId_eq: $channelId } }) {
      ...DataObjectInfo
    }
  }
  ${DataObjectInfo}
`
export const GetDataObjectsByVideoId = gql`
  query getDataObjectsByVideoId($videoId: ID) {
    storageDataObjects(where: { type_json: { videoId_eq: $videoId } }) {
      ...DataObjectInfo
    }
  }
  ${DataObjectInfo}
`
export const GetStorageBagInfoForAsset = gql`
  query getStorageBagInfoForAsset($assetId: ID!) {
    storageDataObjectByUniqueInput(where: { id: $assetId }) {
      ...DataObjectInfo
    }
  }
  ${DataObjectInfo}
`
export const QueryNodeState = gql`
  subscription queryNodeState {
    stateSubscription {
      ...QueryNodeStateFields
    }
  }
  ${QueryNodeStateFields}
`
