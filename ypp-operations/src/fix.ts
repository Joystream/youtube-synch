import BN from 'bn.js'
import { getContactsPaid, updateYppContact } from './hubspot'

const wasChannelPaid = async (channelId: number): Promise<boolean> => {
  // Define the GraphQL query
  const graphqlQuery = {
    query: `
        query {
          channelPaymentMadeEvents(where: {payeeChannel: {id_eq: ${channelId}}, createdAt_gt: "2024-04-11"} orderBy: createdAt_DESC, limit: 1) {
            createdAt
            amount
            rationale
          }
        }
      `,
  }

  // Define the URL of the GraphQL API
  const graphqlUrl = 'https://query.joystream.org/graphql'

  try {
    // Make a POST request with the query
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphqlQuery),
    })

    // Parse the JSON response
    const jsonResponse = await response.json()

    // Check if channelPaymentMadeEvents array length is greater than 0
    return jsonResponse.data && jsonResponse.data.channelPaymentMadeEvents.length > 0
  } catch (error) {
    console.error('Error fetching GraphQL data:', error)
    throw error
  }
}

async function fix() {
  let notPaidCount = 0
  const contacts = await getContactsPaid()
  console.log('contacts', contacts.length)

  for (const c of contacts) {
    const wasPaid = await wasChannelPaid(Number(c.gleev_channel_id))

    if (!wasPaid) {
      console.log('channel was not paid', c.gleev_channel_id)
      notPaidCount++

      // update hubspot

      await updateYppContact(c.contactId, {
        latest_ypp_reward_status: 'To Pay',
        total_ypp_rewards: new BN(c.total_ypp_rewards || 0).subn(Number(c.latest_ypp_reward)).toString(),
      })
    }
  }
  console.log('Total unpaid channels', notPaidCount)
}

fix()

// to pay
// latest reward in joy -> same
// total ypp rewards -> total ypp rewards - latest reward in joy
