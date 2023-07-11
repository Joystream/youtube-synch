import { loadConfig } from './config'
import { countChannelsReferredAfter, recheck } from './recheckVideoState'

export * from './config'
export * from './dynamoHook'
export * from './hubspot'

// Start processing the DynamoDB stream
loadConfig()
// startStreamProcessing()

// getAllVerifiedChannels()
countChannelsReferredAfter(25948, '2023-06-20').then(console.log)
recheck()
