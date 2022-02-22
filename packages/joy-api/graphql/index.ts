import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
export * from './__generated__/baseTypes.generated'
import fetch from 'cross-fetch'

export const createGraphqlClient = (orionUrl: string) => {  
      const orionLink = new HttpLink({ uri: orionUrl, fetch  })    
      return new ApolloClient({ cache: new InMemoryCache(), link: orionLink })
}


