import cron from 'node-cron'
import { updateContactsInHubspot } from './recheckVideoState'

const CHECK_INTERVAL_IN_HOURS = 2
cron.schedule(`0 0 */${CHECK_INTERVAL_IN_HOURS} * * *`, async () => {
  console.log(`Running a task every ${CHECK_INTERVAL_IN_HOURS} hours`)
  const start = Date.now()
  await updateContactsInHubspot()

  const end = Date.now()
  const duration = (end - start) / 1000 // Convert to seconds
  console.log(`Task completed. Execution time: ${duration} seconds.\n`)
})
