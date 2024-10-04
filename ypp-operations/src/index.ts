import cron from 'node-cron'
import { updateContactsInHubspot } from './recheckVideoState'

// Schedule the task to run every day at 11:00 AM UTC (which is midday CET)
cron.schedule('0 11 * * *', async () => {
  console.log('Running a task every day at midday CET')
  const start = Date.now()
  await updateContactsInHubspot()

  const end = Date.now()
  const duration = (end - start) / 1000 // Convert to seconds
  console.log(`Task completed. Execution time: ${duration} seconds.\n`)
})
