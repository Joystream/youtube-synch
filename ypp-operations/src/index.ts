import cron from 'node-cron'
import { addNewYppContactsToHubspot } from './recheckVideoState'

const CHECK_INTERVAL_IN_MINS = 30
cron.schedule(`*/${CHECK_INTERVAL_IN_MINS} * * * *`, async () => {
  console.log(`Running a task every ${CHECK_INTERVAL_IN_MINS} minutes`)
  const start = Date.now()
  await addNewYppContactsToHubspot()

  const end = Date.now()
  const duration = (end - start) / 1000 // Convert to seconds
  console.log(`Task completed. Execution time: ${duration} seconds.\n`)
})
