import { getAllYppContactsWithPropertyHistory } from '../src/hubspot'

getAllYppContactsWithPropertyHistory(['yppstatus']).then(contacts => {
    console.log(JSON.stringify(contacts, null, 2))
}).catch(e => console.error(e))