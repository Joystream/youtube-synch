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
  platforms?: Types.Maybe<Array<Types.Maybe<string>>>
  ownerMember: { id: string }
}

export type GetAppByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['String']
}>

export type GetAppByIdQuery = { appByUniqueInput?: Types.Maybe<AppFieldsFragment> }

export type GetAppsByNameQueryVariables = Types.Exact<{
  name: Types.Scalars['String']
}>

export type GetAppsByNameQuery = { apps: Array<AppFieldsFragment> }

export type ChannelFieldsFragment = {
  id: string
  language?: Types.Maybe<string>
  totalVideosCreated: number
  videos: Array<{ id: string; videoStateBloatBond: any }>
  ownerMember?: Types.Maybe<{ id: string; controllerAccount: string }>
}

export type GetChannelByIdQueryVariables = Types.Exact<{
  channelId: Types.Scalars['String']
}>

export type GetChannelByIdQuery = { channelByUniqueInput?: Types.Maybe<ChannelFieldsFragment> }

export type VideoFieldsFragment = {
  id: string
  ytVideoId?: Types.Maybe<string>
  entryApp?: Types.Maybe<{ id: string; name: string }>
  media?: Types.Maybe<{ id: string; isAccepted: boolean }>
  thumbnailPhoto?: Types.Maybe<{ id: string; isAccepted: boolean }>
}

export type GetVideoByYtResourceIdAndEntryAppNameQueryVariables = Types.Exact<{
  ytVideoId: Types.Scalars['String']
  entryAppName: Types.Scalars['String']
}>

export type GetVideoByYtResourceIdAndEntryAppNameQuery = { videos: Array<VideoFieldsFragment> }

export type GetVideoByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['String']
}>

export type GetVideoByIdQuery = { videoByUniqueInput?: Types.Maybe<VideoFieldsFragment> }

export type MemberMetadataFieldsFragment = { name?: Types.Maybe<string>; about?: Types.Maybe<string> }

export type MembershipFieldsFragment = {
  id: string
  handle: string
  controllerAccount: string
  metadata?: Types.Maybe<MemberMetadataFieldsFragment>
}

export type GetMemberByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['String']
}>

export type GetMemberByIdQuery = { membershipByUniqueInput?: Types.Maybe<MembershipFieldsFragment> }

export type QueryNodeStateFieldsFragment = { lastProcessedBlock: number }

export type QueryNodeStateSubscriptionVariables = Types.Exact<{ [key: string]: never }>

export type QueryNodeStateSubscription = { processorState: QueryNodeStateFieldsFragment }

export type StorageNodeInfoFragment = {
  id: string
  dataObjectsSize: any
  dataObjectsSizeLimit: any
  dataObjectsCount: any
  dataObjectCountLimit: any
  operatorMetadata?: Types.Maybe<{ nodeEndpoint?: Types.Maybe<string> }>
}

export type GetStorageNodesInfoByBagIdQueryVariables = Types.Exact<{
  bagId: Types.Scalars['String']
}>

export type GetStorageNodesInfoByBagIdQuery = { storageBuckets: Array<StorageNodeInfoFragment> }

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
    language
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
    media {
      id
      isAccepted
    }
    thumbnailPhoto {
      id
      isAccepted
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
    metadata {
      ...MemberMetadataFields
    }
  }
  ${MemberMetadataFields}
`
export const QueryNodeStateFields = gql`
  fragment QueryNodeStateFields on ProcessorState {
    lastProcessedBlock
  }
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
export const GetAppById = gql`
  query getAppById($id: String!) {
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
  query getChannelById($channelId: String!) {
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
export const GetVideoById = gql`
  query getVideoById($id: String!) {
    videoByUniqueInput(where: { id: $id }) {
      ...VideoFields
    }
  }
  ${VideoFields}
`
export const GetMemberById = gql`
  query getMemberById($id: String!) {
    membershipByUniqueInput(where: { id: $id }) {
      ...MembershipFields
    }
  }
  ${MembershipFields}
`
export const QueryNodeState = gql`
  subscription queryNodeState {
    processorState {
      ...QueryNodeStateFields
    }
  }
  ${QueryNodeStateFields}
`
export const GetStorageNodesInfoByBagId = gql`
  query getStorageNodesInfoByBagId($bagId: String!) {
    storageBuckets(
      where: {
        operatorStatus: { isTypeOf_eq: "StorageBucketOperatorStatusActive" }
        bags_some: { bag: { id_eq: $bagId } }
        operatorMetadata: { nodeEndpoint_contains: "http" }
      }
    ) {
      ...StorageNodeInfo
    }
  }
  ${StorageNodeInfo}
`
