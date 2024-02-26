import {
  ApolloClient,
  ApolloError,
  defaultDataIdFromObject,
  DocumentNode,
  from,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  split,
} from '@apollo/client/core'
import { onError } from '@apollo/client/link/error'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'
import { MemberId, VideoId } from '@joystream/types/primitives'
import fetch from 'cross-fetch'
import { Logger } from 'winston'
import ws from 'ws'
import { ExitCodes, QueryNodeApiError } from '../../types/errors'
import { LoggingService } from '../logging'
import { StorageNodeInfo } from '../runtime/types'
import {
  AppFieldsFragment,
  ChannelFieldsFragment,
  GetAppsByName,
  GetAppsByNameQuery,
  GetAppsByNameQueryVariables,
  GetChannelById,
  GetChannelByIdQuery,
  GetChannelByIdQueryVariables,
  GetMemberById,
  GetMemberByIdQuery,
  GetMemberByIdQueryVariables,
  GetStorageNodesInfoByBagId,
  GetStorageNodesInfoByBagIdQuery,
  GetStorageNodesInfoByBagIdQueryVariables,
  GetVideoById,
  GetVideoByIdQuery,
  GetVideoByIdQueryVariables,
  GetVideoByYtResourceIdAndEntryAppName,
  GetVideoByYtResourceIdAndEntryAppNameQuery,
  GetVideoByYtResourceIdAndEntryAppNameQueryVariables,
  MembershipFieldsFragment,
  QueryNodeState,
  QueryNodeStateFields,
  QueryNodeStateFieldsFragment,
  QueryNodeStateSubscription,
  QueryNodeStateSubscriptionVariables,
  VideoFieldsFragment,
} from './generated/queries'
import { Maybe } from './generated/schema'

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
    const wsLink = new WebSocketLink({
      uri: endpoint,
      options: {
        reconnect: true,
      },
      webSocketImpl: ws,
    })
    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
      },
      wsLink,
      queryLink
    )

    this.apolloClient = new ApolloClient({
      link: splitLink,
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
    try {
      return (await this.apolloClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey] || null
    } catch (error) {
      if (error instanceof ApolloError && (error.networkError as any).code === 'ECONNREFUSED') {
        throw new QueryNodeApiError(ExitCodes.QueryNodeApi.QUERY_NODE_NOT_CONNECTED, error.message)
      }
      throw error
    }
  }

  // Get entities by "non-unique" input and return first result
  protected async firstEntityQuery<
    QueryT extends { [k: string]: unknown[] },
    VariablesT extends Record<string, unknown>
  >(query: DocumentNode, variables: VariablesT, resultKey: keyof QueryT): Promise<QueryT[keyof QueryT][number] | null> {
    try {
      return (await this.apolloClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey][0] || null
    } catch (error) {
      if (error instanceof ApolloError && (error.networkError as any).code === 'ECONNREFUSED') {
        throw new QueryNodeApiError(ExitCodes.QueryNodeApi.QUERY_NODE_NOT_CONNECTED, error.message)
      }
      throw error
    }
  }

  // Query-node: get multiple entities
  protected async multipleEntitiesQuery<
    QueryT extends { [k: string]: unknown[] },
    VariablesT extends Record<string, unknown>
  >(query: DocumentNode, variables: VariablesT, resultKey: keyof QueryT): Promise<QueryT[keyof QueryT]> {
    try {
      return (await this.apolloClient.query<QueryT, VariablesT>({ query, variables })).data[resultKey]
    } catch (error) {
      if (error instanceof ApolloError && (error.networkError as any).code === 'ECONNREFUSED') {
        throw new QueryNodeApiError(ExitCodes.QueryNodeApi.QUERY_NODE_NOT_CONNECTED, error.message)
      }
      throw error
    }
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
    try {
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
    } catch (error) {
      if (error instanceof ApolloError && (error.networkError as any).code === 'ECONNREFUSED') {
        throw new QueryNodeApiError(ExitCodes.QueryNodeApi.QUERY_NODE_NOT_CONNECTED, error.message)
      }
      throw error
    }
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

  async memberById(id: MemberId | string): Promise<MembershipFieldsFragment | null> {
    return this.uniqueEntityQuery<GetMemberByIdQuery, GetMemberByIdQueryVariables>(
      GetMemberById,
      {
        id: id.toString(),
      },
      'membershipByUniqueInput'
    )
  }

  async videoById(id: VideoId | string): Promise<VideoFieldsFragment | null> {
    return this.uniqueEntityQuery<GetVideoByIdQuery, GetVideoByIdQueryVariables>(
      GetVideoById,
      {
        id: id.toString(),
      },
      'videoByUniqueInput'
    )
  }

  async getAppByName(name: string): Promise<AppFieldsFragment | null> {
    return this.firstEntityQuery<GetAppsByNameQuery, GetAppsByNameQueryVariables>(
      GetAppsByName,
      {
        name,
      },
      'apps'
    )
  }

  async getVideoByYtResourceIdAndEntryAppName(
    ytVideoId: string,
    entryAppName: string
  ): Promise<VideoFieldsFragment | null> {
    return this.firstEntityQuery<
      GetVideoByYtResourceIdAndEntryAppNameQuery,
      GetVideoByYtResourceIdAndEntryAppNameQueryVariables
    >(
      GetVideoByYtResourceIdAndEntryAppName,
      {
        ytVideoId,
        entryAppName,
      },
      'videos'
    )
  }

  public async getQueryNodeState(): Promise<QueryNodeStateFieldsFragment | null> {
    // fetch cached state
    const cachedState = this.apolloClient.readFragment<
      QueryNodeStateSubscription['processorState'],
      QueryNodeStateSubscriptionVariables
    >({
      id: 'ProcessorState',
      fragment: QueryNodeStateFields,
    })

    // If we have the state in cache, return it
    if (cachedState) {
      return cachedState
    }

    // Otherwise setup the subscription (which will periodically update the cache) and return for the first result
    return this.uniqueEntitySubscription<QueryNodeStateSubscription, QueryNodeStateSubscriptionVariables>(
      QueryNodeState,
      {},
      'processorState'
    )
  }
}
