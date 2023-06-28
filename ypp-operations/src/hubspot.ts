import { Client } from '@hubspot/api-client'
import axios, { AxiosResponse, isAxiosError } from 'axios'
import { loadConfig as config } from './config'
import { HubspotYPPContact, YtChannel } from './types'

const hubspotClient: Client = new Client({ accessToken: config().HUBSPOT_API_KEY })

export async function getYppContactByEmail(email: string): Promise<string | undefined> {
  const token = config().HUBSPOT_API_KEY
  const baseUrl: string = 'https://api.hubapi.com'
  const endpoint: string = `/contacts/v1/contact/email/${email}/profile`

  try {
    const response: AxiosResponse<{ vid: string }> = await axios.get(`${baseUrl}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    return response.data.vid
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      console.log(`Contact with email ${email} not found`)
      return
    }
    throw error
  }
}

export async function getAllContacts(): Promise<
  {
    contactId: string
    email: string
    channelId: string
    latestDateChecked: string
    tier: number
  }[]
> {
  const contacts = []

  let nextPage: number | undefined = 0

  try {
    do {
      const response = await hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'lifecyclestage',
                operator: 'EQ',
                value: 'customer',
              },
            ],
          },
        ],
        sorts: [],
        properties: ['email', 'channel_url', 'total_subscribers', 'latest_ypp_period_wc'],
        limit: 50,
        after: nextPage,
      })
      contacts.push(
        ...response.results.map((contact) => ({
          contactId: contact.id,
          email: contact.properties.email,
          channelId: contact.properties.channel_url.split('/')[1],
          latestDateChecked: contact.properties.latest_ypp_period_wc,
          tier:
            contact.properties.total_subscribers < '5000' ? 1 : contact.properties.total_subscribers < '50000' ? 2 : 3,
        }))
      )
      nextPage = Number(response.paging?.next?.after)
    } while (nextPage)
    return contacts
  } catch (err) {
    console.error(err)
    throw err
  }
}

// Function to update a Hubspot YPP contact
export async function updateYppContact(contactId: string, properties: Partial<HubspotYPPContact>): Promise<void> {
  try {
    await hubspotClient.crm.contacts.basicApi.update(contactId, { properties: properties })
  } catch (err) {
    console.error(err)
  }
}

// Function to create a Hubspot YPP contact
export async function createYppContact(properties: Partial<HubspotYPPContact>): Promise<void> {
  try {
    await hubspotClient.crm.contacts.basicApi.create({ properties, associations: [] })
  } catch (err) {
    console.error(err)
  }
}

export async function addOrUpdateYppContact(item: YtChannel, contactId?: string): Promise<void> {
  if (contactId) {
    return await updateYppContact(contactId, dynamoItemToContact(item))
  } else {
    return await createYppContact(dynamoItemToContact(item))
  }
}

function dynamoItemToContact(item: YtChannel): Partial<HubspotYPPContact> {
  return {
    channel_title: item.title,
    channel_url: `channel/${item.id}`,
    email: item.email,
    total_subscribers: item.statistics.subscriberCount.toString(),
    gleev_channel_id: item.joystreamChannelId.toString(),
    lifecyclestage: 'customer',
    hs_lead_status: 'CONNECTED', // Lead Status
    // latest_ypp_reward_status: 'Not calculated',
    date_signed_up_to_ypp: new Date(item.createdAt).setUTCHours(0, 0, 0, 0).toString(), // Date Signed up to YPP
  }
}
