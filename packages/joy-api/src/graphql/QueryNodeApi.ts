import {
  ApolloClient,
  ApolloLink,
  DocumentNode,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core'
import { ErrorLink, onError } from '@apollo/client/link/error'
import { MemberId } from '@joystream/types/primitives'
import BN from 'bn.js'
import fetch from 'cross-fetch'
import { URL } from 'url'
import {
  ChannelFieldsFragment,
  DataObjectInfoFragment,
  DistributionBucketFamilyFieldsFragment,
  GetChannelById,
  GetChannelByIdQuery,
  GetChannelByIdQueryVariables,
  GetDataObjectsByBagId,
  GetDataObjectsByBagIdQuery,
  GetDataObjectsByBagIdQueryVariables,
  GetDataObjectsByChannelId,
  GetDataObjectsByChannelIdQuery,
  GetDataObjectsByChannelIdQueryVariables,
  GetDataObjectsByVideoId,
  GetDataObjectsByVideoIdQuery,
  GetDataObjectsByVideoIdQueryVariables,
  GetDistributionFamiliesAndBuckets,
  GetDistributionFamiliesAndBucketsQuery,
  GetDistributionFamiliesAndBucketsQueryVariables,
  GetMemberById,
  GetMemberByIdQuery,
  GetMemberByIdQueryVariables,
  GetMembersByIds,
  GetMembersByIdsQuery,
  GetMembersByIdsQueryVariables,
  GetStorageBuckets,
  GetStorageBucketsQuery,
  GetStorageBucketsQueryVariables,
  GetStorageNodesInfoByBagId,
  GetStorageNodesInfoByBagIdQuery,
  GetStorageNodesInfoByBagIdQueryVariables,
  MembershipFieldsFragment,
  StorageBucketsCount,
  StorageBucketsCountQuery,
  StorageBucketsCountQueryVariables,
  StorageNodeInfoFragment,
} from './generated/queries'
import { Maybe } from './generated/schema'
import { StorageNodeInfo } from '../types'

export default class QueryNodeApi {
  private _qnClient: ApolloClient<NormalizedCacheObject>

  public constructor(uri?: string, errorHandler?: ErrorLink.ErrorHandler) {
    const links: ApolloLink[] = []
    if (errorHandler) {
      links.push(onError(errorHandler))
    }
    links.push(new HttpLink({ uri, fetch }))
    this._qnClient = new ApolloClient({
      link: from(links),
      cache: new InMemoryCache({ addTypename: false }),
      defaultOptions: { query: { fetchPolicy: 'no-cache', errorPolicy: 'all' } },
    })
  }

  // Get entity by unique input
  protected async uniqueEntityQuery<
    QueryT extends { [k: string]: Maybe<Record<string, unknown>> | undefined },
    VariablesT extends Record<string, unknown>
  >(
    query: DocumentNode,
    variables: VariablesT,
    resultKey: keyof QueryT
  ): Promise<Required<QueryT>[keyof QueryT] | null> {
    return (await this._qnClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey] || null
  }

  // Get entities by "non-unique" input and return first result
  protected async firstEntityQuery<
    QueryT extends { [k: string]: unknown[] },
    VariablesT extends Record<string, unknown>
  >(query: DocumentNode, variables: VariablesT, resultKey: keyof QueryT): Promise<QueryT[keyof QueryT][number] | null> {
    return (await this._qnClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey][0] || null
  }

  // Get multiple entities
  protected async multipleEntitiesQuery<
    QueryT extends { [k: string]: unknown[] },
    VariablesT extends Record<string, unknown>
  >(query: DocumentNode, variables: VariablesT, resultKey: keyof QueryT): Promise<QueryT[keyof QueryT]> {
    return (await this._qnClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey]
  }

  async dataObjectsByBagId(bagId: string): Promise<DataObjectInfoFragment[]> {
    return this.multipleEntitiesQuery<GetDataObjectsByBagIdQuery, GetDataObjectsByBagIdQueryVariables>(
      GetDataObjectsByBagId,
      { bagId },
      'storageDataObjects'
    )
  }

  async dataObjectsByVideoId(videoId: string): Promise<DataObjectInfoFragment[]> {
    return this.multipleEntitiesQuery<GetDataObjectsByVideoIdQuery, GetDataObjectsByVideoIdQueryVariables>(
      GetDataObjectsByVideoId,
      { videoId },
      'storageDataObjects'
    )
  }

  async dataObjectsByChannelId(channelId: string): Promise<DataObjectInfoFragment[]> {
    return this.multipleEntitiesQuery<GetDataObjectsByChannelIdQuery, GetDataObjectsByChannelIdQueryVariables>(
      GetDataObjectsByChannelId,
      { channelId },
      'storageDataObjects'
    )
  }

  async getChannelById(channelId: string): Promise<ChannelFieldsFragment | null> {
    return this.uniqueEntityQuery<GetChannelByIdQuery, GetChannelByIdQueryVariables>(
      GetChannelById,
      { channelId },
      'channelByUniqueInput'
    )
  }

  async storageNodesInfoByBagId(bagId: string): Promise<StorageNodeInfo[]> {
    const result = await this.multipleEntitiesQuery<
      GetStorageNodesInfoByBagIdQuery,
      GetStorageNodesInfoByBagIdQueryVariables
    >(GetStorageNodesInfoByBagId, { bagId }, 'storageBuckets')

    const validNodesInfo: StorageNodeInfo[] = []
    for (const { operatorMetadata, id } of result) {
      if (operatorMetadata?.nodeEndpoint) {
        try {
          const rootEndpoint = operatorMetadata.nodeEndpoint
          const apiEndpoint = new URL(
            'api/v1',
            rootEndpoint.endsWith('/') ? rootEndpoint : rootEndpoint + '/'
          ).toString()
          validNodesInfo.push({
            apiEndpoint,
            bucketId: parseInt(id),
          })
        } catch (e) {
          continue
        }
      }
    }
    return validNodesInfo
  }

  async storageBucketsForNewChannel(): Promise<StorageNodeInfoFragment[]> {
    const countQueryResult = await this.uniqueEntityQuery<StorageBucketsCountQuery, StorageBucketsCountQueryVariables>(
      StorageBucketsCount,
      {},
      'storageBucketsConnection'
    )
    if (!countQueryResult) {
      throw Error('Invalid query. Could not fetch storage buckets count information')
    }

    const buckets = await this.multipleEntitiesQuery<GetStorageBucketsQuery, GetStorageBucketsQueryVariables>(
      GetStorageBuckets,
      { count: countQueryResult.totalCount },
      'storageBuckets'
    )

    // sorting buckets based on available size, if two buckets have same
    // available size then sort the two based on available dataObjects count
    return buckets.sort(
      (x, y) =>
        new BN(y.dataObjectsSizeLimit)
          .sub(new BN(y.dataObjectsSize))
          .cmp(new BN(x.dataObjectsSizeLimit).sub(new BN(x.dataObjectsSize))) ||
        new BN(y.dataObjectCountLimit)
          .sub(new BN(y.dataObjectsCount))
          .cmp(new BN(x.dataObjectCountLimit).sub(new BN(x.dataObjectsCount)))
    )
  }

  async distributionBucketsForNewChannel(): Promise<DistributionBucketFamilyFieldsFragment[]> {
    return this.multipleEntitiesQuery<
      GetDistributionFamiliesAndBucketsQuery,
      GetDistributionFamiliesAndBucketsQueryVariables
    >(GetDistributionFamiliesAndBuckets, {}, 'distributionBucketFamilies')
  }

  async membersByIds(ids: MemberId[] | string[]): Promise<MembershipFieldsFragment[]> {
    return this.multipleEntitiesQuery<GetMembersByIdsQuery, GetMembersByIdsQueryVariables>(
      GetMembersByIds,
      {
        ids: ids.map((id) => id.toString()),
      },
      'memberships'
    )
  }

  async memberById(id: MemberId | string): Promise<MembershipFieldsFragment> {
    return this.uniqueEntityQuery<GetMemberByIdQuery, GetMemberByIdQueryVariables>(
      GetMemberById,
      {
        id: id.toString(),
      },
      'membershipByUniqueInput'
    )
  }
}
