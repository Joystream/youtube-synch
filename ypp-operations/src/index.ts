import { loadConfig } from './config'
import { startStreamProcessing } from './dynamoHook'
import { recheck } from './recheckVideoState'

export * from './config'
export * from './dynamoHook'
export * from './hubspot'

// Start processing the DynamoDB stream
loadConfig()
startStreamProcessing()

// getVideosSyncedAfter('UC4VK0tvNdIhFRw-nOh3K5Hg', '2023-06-20')
recheck()
