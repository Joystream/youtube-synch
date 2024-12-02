import { markOptedOutContacts } from '../src/recheckVideoState'
import { OptedOutContactData } from '../src/types'
import optedOutContacts from './opted_out_contacts.json'

markOptedOutContacts(optedOutContacts as OptedOutContactData[])