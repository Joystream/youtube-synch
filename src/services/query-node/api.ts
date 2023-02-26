import {
  ApolloClient,
  DocumentNode,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  defaultDataIdFromObject,
  from,
} from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'
import fetch from 'cross-fetch'
import { Logger } from 'winston'
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
  GetStorageBagInfoForAsset,
  GetStorageBagInfoForAssetQuery,
  GetStorageBagInfoForAssetQueryVariables,
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
import { MemberId } from '@joystream/types/primitives'
import BN from 'bn.js'
import { StorageNodeInfo } from '../runtime/types'
import { LoggingService } from '../logging'

const MAX_RESULTS_PER_QUERY = 1000

type PaginationQueryVariables = {
  limit: number
  lastCursor?: Maybe<string>
}

type PaginationQueryResult<T = unknown> = {
  edges: { node: T }[]
  pageInfo: {
    hasNextPage: boolean
    endCursor?: Maybe<string>
  }
}

export class QueryNodeApi {
  private apolloClient: ApolloClient<NormalizedCacheObject>
  private logger: Logger

  public constructor(endpoint: string, logging: LoggingService, exitOnError = false) {
    this.logger = logging.createLogger('QueryNodeApi')
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      const message = networkError?.message || 'Graphql syntax errors found'
      this.logger.error('Error when trying to execute a query!', { err: { message, graphQLErrors, networkError } })
      exitOnError && process.exit(-1)
    })

    const queryLink = from([errorLink, new HttpLink({ uri: endpoint, fetch })])
    this.apolloClient = new ApolloClient({
      link: queryLink,
      cache: new InMemoryCache({
        dataIdFromObject: (object) => {
          // setup cache object id for ProcessorState entity type
          if (object.__typename === 'ProcessorState') {
            return object.__typename
          }
          return defaultDataIdFromObject(object)
        },
      }),
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
    return (await this.apolloClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey] || null
  }

  // Get entities by "non-unique" input and return first result
  protected async firstEntityQuery<
    QueryT extends { [k: string]: unknown[] },
    VariablesT extends Record<string, unknown>
  >(query: DocumentNode, variables: VariablesT, resultKey: keyof QueryT): Promise<QueryT[keyof QueryT][number] | null> {
    return (await this.apolloClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey][0] || null
  }

  // Query-node: get multiple entities
  protected async multipleEntitiesQuery<
    QueryT extends { [k: string]: unknown[] },
    VariablesT extends Record<string, unknown>
  >(query: DocumentNode, variables: VariablesT, resultKey: keyof QueryT): Promise<QueryT[keyof QueryT]> {
    return (await this.apolloClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey]
  }

  protected async multipleEntitiesWithPagination<
    NodeT,
    QueryT extends { [k: string]: PaginationQueryResult<NodeT> },
    CustomVariablesT extends Record<string, unknown>
  >(
    query: DocumentNode,
    variables: CustomVariablesT,
    resultKey: keyof QueryT,
    itemsPerPage = MAX_RESULTS_PER_QUERY
  ): Promise<NodeT[]> {
    let hasNextPage = true
    let results: NodeT[] = []
    let lastCursor: string | undefined
    while (hasNextPage) {
      const paginationVariables = { limit: itemsPerPage, lastCursor }
      const queryVariables = { ...variables, ...paginationVariables }
      const page = (
        await this.apolloClient.query<QueryT, PaginationQueryVariables & CustomVariablesT>({
          query,
          variables: queryVariables,
        })
      ).data[resultKey]
      results = results.concat(page.edges.map((e) => e.node))
      hasNextPage = page.pageInfo.hasNextPage
      lastCursor = page.pageInfo.endCursor || undefined
    }
    return results
  }

  protected async uniqueEntitySubscription<
    SubscriptionT extends { [k: string]: Maybe<Record<string, unknown>> | undefined },
    VariablesT extends Record<string, unknown>
  >(
    query: DocumentNode,
    variables: VariablesT,
    resultKey: keyof SubscriptionT
  ): Promise<SubscriptionT[keyof SubscriptionT] | null> {
    return new Promise((resolve) => {
      this.apolloClient.subscribe<SubscriptionT, VariablesT>({ query, variables }).subscribe(({ data }) => {
        resolve(data ? data[resultKey] : null)
      })
    })
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

  async memberById(id: MemberId | string): Promise<MembershipFieldsFragment | null> {
    return this.uniqueEntityQuery<GetMemberByIdQuery, GetMemberByIdQueryVariables>(
      GetMemberById,
      {
        id: id.toString(),
      },
      'membershipByUniqueInput'
    )
  }

  async getStorageBagInfoForAsset(assetId: string): Promise<string> {
    const result = await this.uniqueEntityQuery<
      GetStorageBagInfoForAssetQuery,
      GetStorageBagInfoForAssetQueryVariables
    >(
      GetStorageBagInfoForAsset,
      {
        assetId,
      },
      'storageDataObjectByUniqueInput'
    )

    if (!result) {
      throw Error('Could not fetch storage bag information for asset with id: ' + assetId)
    }

    return result.storageBagId
  }
}
