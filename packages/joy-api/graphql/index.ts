import { ApolloClient, HttpLink, split } from '@apollo/client'
import { BatchHttpLink } from '@apollo/client/link/batch-http'
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'

export * from './__generated__/baseTypes.generated'


