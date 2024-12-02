import { markOptedOutChannels } from '../src/dynamodb'
import { OptedOutContactData } from '../src/types'
import optedOutContacts from './opted_out_contacts.json'

markOptedOutChannels(optedOutContacts as OptedOutContactData[])