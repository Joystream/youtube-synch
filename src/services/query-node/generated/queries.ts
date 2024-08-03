import * as Types from './schema'

import gql from 'graphql-tag'
export type AppFieldsFragment = {
  id: string
  name: string
  websiteUrl?: string | null
  useUri?: string | null
  smallIcon?: string | null
  mediumIcon?: string | null
  bigIcon?: string | null
  oneLiner?: string | null
  description?: string | null
  termsOfService?: string | null
  category?: string | null
  authKey?: string | null
  platforms?: Array<string | null> | null
  ownerMember: { id: string }
}

export type GetAppByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input']
}>

export type GetAppByIdQuery = {
  appByUniqueInput?: {
    id: string
    name: string
    websiteUrl?: string | null
    useUri?: string | null
    smallIcon?: string | null
    mediumIcon?: string | null
    bigIcon?: string | null
    oneLiner?: string | null
    description?: string | null
    termsOfService?: string | null
    category?: string | null
    authKey?: string | null
    platforms?: Array<string | null> | null
    ownerMember: { id: string }
  } | null
}

export type GetAppsByNameQueryVariables = Types.Exact<{
  name: Types.Scalars['String']['input']
}>

export type GetAppsByNameQuery = {
  apps: Array<{
    id: string
    name: string
    websiteUrl?: string | null
    useUri?: string | null
    smallIcon?: string | null
    mediumIcon?: string | null
    bigIcon?: string | null
    oneLiner?: string | null
    description?: string | null
    termsOfService?: string | null
    category?: string | null
    authKey?: string | null
    platforms?: Array<string | null> | null
    ownerMember: { id: string }
  }>
}

export type ChannelFieldsFragment = {
  id: string
  language?: string | null
  totalVideosCreated: number
  videos: Array<{ id: string; videoStateBloatBond: any }>
  ownerMember?: { id: string; controllerAccount: { id: string } } | null
}

export type GetChannelByIdQueryVariables = Types.Exact<{
  channelId: Types.Scalars['String']['input']
}>

export type GetChannelByIdQuery = {
  channelByUniqueInput?: {
    id: string
    language?: string | null
    totalVideosCreated: number
    videos: Array<{ id: string; videoStateBloatBond: any }>
    ownerMember?: { id: string; controllerAccount: { id: string } } | null
  } | null
}

export type VideoFieldsFragment = {
  id: string
  ytVideoId?: string | null
  entryApp?: { id: string; name: string } | null
  media?: { id: string; isAccepted: boolean } | null
  thumbnailPhoto?: { id: string; isAccepted: boolean } | null
}

export type GetVideoByYtResourceIdAndEntryAppNameQueryVariables = Types.Exact<{
  ytVideoId: Types.Scalars['String']['input']
  entryAppName: Types.Scalars['String']['input']
}>

export type GetVideoByYtResourceIdAndEntryAppNameQuery = {
  videos: Array<{
    id: string
    ytVideoId?: string | null
    entryApp?: { id: string; name: string } | null
    media?: { id: string; isAccepted: boolean } | null
    thumbnailPhoto?: { id: string; isAccepted: boolean } | null
  }>
}

export type GetVideoByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input']
}>

export type GetVideoByIdQuery = {
  videoByUniqueInput?: {
    id: string
    ytVideoId?: string | null
    entryApp?: { id: string; name: string } | null
    media?: { id: string; isAccepted: boolean } | null
    thumbnailPhoto?: { id: string; isAccepted: boolean } | null
  } | null
}

export type MemberMetadataFieldsFragment = { name?: string | null; about?: string | null }

export type MembershipFieldsFragment = {
  id: string
  handle: string
  controllerAccount: { id: string }
  metadata?: { name?: string | null; about?: string | null } | null
}

export type GetMemberByIdQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input']
}>

export type GetMemberByIdQuery = {
  membershipByUniqueInput?: {
    id: string
    handle: string
    controllerAccount: { id: string }
    metadata?: { name?: string | null; about?: string | null } | null
  } | null
}

export type QueryNodeStateFieldsFragment = { lastProcessedBlock: number }

export type QueryNodeStateSubscriptionVariables = Types.Exact<{ [key: string]: never }>

export type QueryNodeStateSubscription = { processorState: { lastProcessedBlock: number } }

export type StorageNodeInfoFragment = {
  id: string
  dataObjectsSize: any
  dataObjectsSizeLimit: any
  dataObjectsCount: any
  dataObjectCountLimit: any
  operatorMetadata?: { nodeEndpoint?: string | null } | null
}

export type GetStorageNodesInfoByBagIdQueryVariables = Types.Exact<{
  bagId: Types.Scalars['String']['input']
}>

export type GetStorageNodesInfoByBagIdQuery = {
  storageBuckets: Array<{
    id: string
    dataObjectsSize: any
    dataObjectsSizeLimit: any
    dataObjectsCount: any
    dataObjectCountLimit: any
    operatorMetadata?: { nodeEndpoint?: string | null } | null
  }>
}

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
      controllerAccount {
        id
      }
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
    controllerAccount {
      id
    }
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
