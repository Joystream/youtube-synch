import { Client } from '@hubspot/api-client'
import axios, { AxiosResponse, isAxiosError } from 'axios'
import { randomBytes } from 'crypto'
import _ from 'lodash'
import { loadConfig as config } from './config'
import { HubspotYPPContact, PayableContact, YtChannel, payableContactProps } from './types'

export const hubspotClient: Client = new Client({
  accessToken: config('HUBSPOT_API_KEY'),
  limiterOptions: {
    minTime: 1000, // Add rate-limiting to avoid "secondly limit reached error"
    // (https://community.hubspot.com/t5/APIs-Integrations/Error-You-have-reached-your-secondly-limit/m-p/269485)
  },
})

export async function getYppContactByEmail(email: string): Promise<string | undefined> {
  const token = config('HUBSPOT_API_KEY')
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
    } else if (isAxiosError(error) && error.code === 'ECONNRESET') {
      console.log('Failed to get contact from Hubspot. Retrying...')
      return getYppContactByEmail(email)
    }
    throw error
  }
}

export async function getAllYppContacts(lifecyclestage: ('customer' | 'lead')[] = ['customer']): Promise<
  (Omit<
    PayableContact,
    | 'gleev_channel_id'
    | 'sign_up_reward_in_usd'
    | 'latest_referral_reward_in_usd'
    | 'videos_sync_reward'
    | 'latest_ypp_reward'
    | 'total_ypp_rewards'
  > & {
    gleev_channel_id: number
    sign_up_reward_in_usd: number
    latest_referral_reward_in_usd: number
    videos_sync_reward: number
  })[]
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
                operator: 'IN',
                values: lifecyclestage,
              },
            ],
          },
        ],
        sorts: [],
        properties: [...payableContactProps, 'lifecyclestage'],
        limit: 100,
        after: nextPage,
      })

      contacts.push(
        ...response.results.map((contact) => ({
          contactId: contact.id,
          email: contact.properties.email,
          ...(contact.properties.lifecyclestage === 'customer'
            ? {
                channel_url: contact.properties.channel_url?.split('/')[1],
                gleev_channel_id: parseInt(contact.properties.gleev_channel_id || '0'),
                latest_ypp_period_wc: contact.properties.latest_ypp_period_wc,
                latest_ypp_reward_status: contact.properties.latest_ypp_reward_status,
                date_signed_up_to_ypp: contact.properties.date_signed_up_to_ypp,
                sign_up_reward_in_usd: parseInt(contact.properties.sign_up_reward_in_usd || '0'),
                latest_referral_reward_in_usd: parseInt(contact.properties.latest_referral_reward_in_usd || '0'),
                videos_sync_reward: parseInt(contact.properties.videos_sync_reward || '0'),
                yppstatus: contact.properties.yppstatus,
              }
            : {}),
        }))
      )
      nextPage = Number(response.paging?.next?.after)
    } while (nextPage)
    return contacts as any
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function getContactToPay(gleevChannelId: string): Promise<PayableContact | undefined> {
  try {
    const response = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'lifecyclestage',
              operator: 'EQ',
              value: 'customer',
            },
            {
              propertyName: 'latest_ypp_reward_status',
              operator: 'EQ',
              value: 'To Pay',
            },
            {
              propertyName: 'gleev_channel_id',
              operator: 'EQ',
              value: gleevChannelId,
            },
          ],
        },
      ],
      sorts: [],
      properties: [...payableContactProps],
      limit: 50,
      after: 0,
    })
    const contacts = response.results.map((contact) => ({
      contactId: contact.id,
      email: contact.properties.email,
      channel_url: contact.properties.channel_url?.split('/')[1],
      gleev_channel_id: contact.properties.gleev_channel_id,
      sign_up_reward_in_usd: contact.properties.sign_up_reward_in_usd,
      latest_referral_reward_in_usd: contact.properties.latest_referral_reward_in_usd,
      videos_sync_reward: contact.properties.videos_sync_reward,
      latest_ypp_reward: contact.properties.latest_ypp_reward,
      total_ypp_rewards: contact.properties.total_ypp_rewards,
      date_signed_up_to_ypp: contact.properties.date_signed_up_to_ypp,
      latest_ypp_period_wc: contact.properties.latest_ypp_period_wc,
      latest_ypp_reward_status: contact.properties.latest_ypp_reward_status,
      yppstatus: contact.properties.yppstatus,
    }))
    return contacts[0] as PayableContact
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function getContactsToPay(): Promise<PayableContact[]> {
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
              {
                propertyName: 'latest_ypp_reward_status',
                operator: 'EQ',
                value: 'To Pay',
              },
            ],
          },
        ],
        sorts: [],
        properties: [...payableContactProps],
        limit: 50,
        after: nextPage,
      })
      contacts.push(
        ...response.results.map((contact) => ({
          contactId: contact.id,
          email: contact.properties.email,
          channel_url: contact.properties.channel_url?.split('/')[1],
          gleev_channel_id: contact.properties.gleev_channel_id,
          sign_up_reward_in_usd: contact.properties.sign_up_reward_in_usd,
          latest_referral_reward_in_usd: contact.properties.latest_referral_reward_in_usd,
          videos_sync_reward: contact.properties.videos_sync_reward,
          latest_ypp_reward: contact.properties.latest_ypp_reward,
          total_ypp_rewards: contact.properties.total_ypp_rewards,
          date_signed_up_to_ypp: contact.properties.date_signed_up_to_ypp,
          latest_ypp_period_wc: contact.properties.latest_ypp_period_wc,
          latest_ypp_reward_status: contact.properties.latest_ypp_reward_status,
          yppstatus: contact.properties.yppstatus,
        }))
      )
      nextPage = Number(response.paging?.next?.after)
    } while (nextPage)
    return contacts as PayableContact[]
  } catch (err) {
    console.error(err)
    throw err
  }
}

// Function to update a Hubspot YPP contact
export async function updateYppContact(contactId: string, properties: Partial<HubspotYPPContact>): Promise<void> {
  try {
    await hubspotClient.crm.contacts.basicApi.update(contactId, { properties })
  } catch (err) {
    if (isAxiosError(err) && err.code === 'ECONNRESET') {
      console.log('Failed to update contact in Hubspot. Retrying...')
      return updateYppContact(contactId, properties)
    }
    throw err
  }
}

// Function to update multiple Hubspot YPP contacts
export async function updateYppContacts(
  updateInputs: Array<{ id: string; properties: Partial<HubspotYPPContact> }>
): Promise<void> {
  const batchedInputs = _.chunk(updateInputs, 100)
  try {
    for (const inputs of batchedInputs) {
      await hubspotClient.crm.contacts.batchApi.update({ inputs })
    }
  } catch (err) {
    if (isAxiosError(err) && err.code === 'ECONNRESET') {
      console.log('Failed to update contacts in Hubspot. Retrying...')
      return updateYppContacts(updateInputs)
    }
    throw err
  }
}

// Function to create a Hubspot YPP contact
export async function createYppContact(properties: Partial<HubspotYPPContact>): Promise<void> {
  try {
    await hubspotClient.crm.contacts.basicApi.create({ properties, associations: [] })
  } catch (err) {
    if (isAxiosError(err) && err.code === 'ECONNRESET') {
      console.log('Failed to create contacts in Hubspot. Retrying...')
      return createYppContact(properties)
    }
    throw err
  }
}

// Function to create multiple Hubspot YPP contacts
export async function createYppContacts(
  createInputs: Array<{ properties: Partial<HubspotYPPContact> }>
): Promise<void> {
  // Set default associations if not provided
  const enrichedInputs = createInputs.map((input) => ({
    ...input,
    associations: [],
  }))

  const batchedInputs = _.chunk(enrichedInputs, 100)
  try {
    for (const inputs of batchedInputs) {
      await hubspotClient.crm.contacts.batchApi.create({ inputs })
    }
  } catch (err) {
    if (isAxiosError(err) && err.code === 'ECONNRESET') {
      console.log('Failed to create contacts in Hubspot. Retrying...')
      return createYppContacts(createInputs)
    }
    throw err
  }
}

export async function addOrUpdateYppContact(item: YtChannel, contactId?: string): Promise<void> {
  if (contactId) {
    return await updateYppContact(contactId, mapDynamoItemToContactFields(item))
  } else {
    return await createYppContact(mapDynamoItemToContactFields(item))
  }
}

export function mapDynamoItemToContactFields(item: YtChannel): Partial<HubspotYPPContact> {
  return {
    channel_title: item.title,
    channel_url: `channel/${item.id}`,
    email: item.email,
    total_subscribers: item.statistics.subscriberCount.toString(),
    gleev_channel_id: item.joystreamChannelId.toString(),
    lifecyclestage: 'customer',
    hs_lead_status: 'CONNECTED', // Lead Status
    date_signed_up_to_ypp: new Date(item.createdAt).setUTCHours(0, 0, 0, 0).toString(), // Date Signed up to YPP
    yppstatus: item.yppStatus, // YPP Status
    referredby: item.referrerChannelId ? String(item.referrerChannelId) : undefined, // Referred By
    videocategoryid: item.videoCategoryId,
    synccategoryname: categoryById[item.videoCategoryId],
  }
}

export function mapReferrerToContactFields(joystreamChannelId: number): Partial<HubspotYPPContact> {
  return {
    email: `email.unknown.${randomBytes(8).toString('hex')}@email.com`,
    gleev_channel_id: joystreamChannelId.toString(),
    lifecyclestage: 'customer',
    hs_lead_status: 'REFERRER', // Lead Status
  }
}

// Mapping of category names to IDs
const categoryById: { [key: string]: string } = {
  '4209396-2': 'Art',
  '4209546-2': 'Animation and Film',
  '4209572-2': 'Autos and Vehicles',
  '4209583-2': 'Business and Finance',
  '4209591-2': 'Crypto',
  '4209595-2': 'DIY',
  '4209603-2': 'Education',
  '4209609-2': 'Entertainment',
  '4209637-2': 'Lifestyle',
  '4209643-2': 'Memes and Humor',
  '4209650-2': 'Music and Music Videos',
  '4209658-2': 'Nature',
  '4209664-2': 'News and Current Affairs',
  '4209674-2': 'People and Blogs',
  '4209679-2': 'Pets and Animals',
  '4209685-2': 'Sports',
  '4209691-2': 'Technology',
  '4209700-2': 'Travel',
  '4209707-2': 'Unboxing',
  '4209721-2': 'Video Games',
}
