import { calculateMissedRewards } from '../src/recheckVideoState'
import contactsWithStatusHistory from './contacts_with_status_history_02_12_2024.json'

calculateMissedRewards(contactsWithStatusHistory as any[])
    .then(rewards => console.log(JSON.stringify(rewards)))
    .catch(console.error)
