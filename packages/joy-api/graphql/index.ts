import { ApolloClient, HttpLink, split } from '@apollo/client'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { getMainDefinition } from '@apollo/client/utilities'
import cache from './cache'
export * from './__generated__/baseTypes.generated'
import fetch from 'cross-fetch'

export const createGraphqlClient = (nodeUrl: string, orionUrl: string) => {  
      const orionLink = new HttpLink({ uri: orionUrl, fetch  })
      const batchedOrionLink = new BatchHttpLink({ uri: orionUrl, batchMax: 10, fetch })
    
      const orionSplitLink = split(
        ({ operationName }) => {
          return operationName === 'GetVideos' || operationName === 'GetVideoCount'
        },
        batchedOrionLink,
        orionLink
      )
    
      const operationSplitLink = split(
        ({ query }) => {
          const definition = getMainDefinition(query)
          return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
        },
        orionSplitLink
      )
    
      return new ApolloClient({cache, link: operationSplitLink })
}


