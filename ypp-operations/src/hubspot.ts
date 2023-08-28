import { Client } from '@hubspot/api-client'
import axios, { AxiosResponse, isAxiosError } from 'axios'
import _ from 'lodash'
import { loadConfig as config } from './config'
import { HubspotYPPContact, PayableContact, YtChannel, payableContactProps } from './types'

export const hubspotClient: Client = new Client({ accessToken: config('HUBSPOT_API_KEY') })

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
    yppRewardStatus: string
    dateSignedUpToYpp: string
    sign_up_reward_in_usd: number
    latest_referral_reward_in_usd: number
    videos_sync_reward_in_usd: number
    gleev_channel_id: number
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
        properties: [
          'email',
          'channel_url',
          'gleev_channel_id',
          'total_subscribers',
          'latest_ypp_period_wc',
          'latest_ypp_reward_status',
          'date_signed_up_to_ypp',
          'sign_up_reward_in_usd',
          'latest_referral_reward_in_usd',
          'videos_sync_reward',
        ],
        limit: 50,
        after: nextPage,
      })
      contacts.push(
        ...response.results.map((contact) => ({
          contactId: contact.id,
          email: contact.properties.email,
          channelId: contact.properties.channel_url.split('/')[1],
          latestDateChecked: contact.properties.latest_ypp_period_wc,
          yppRewardStatus: contact.properties.latest_ypp_reward_status,
          dateSignedUpToYpp: contact.properties.date_signed_up_to_ypp,
          sign_up_reward_in_usd: parseInt(contact.properties.sign_up_reward_in_usd || '0'),
          latest_referral_reward_in_usd: parseInt(contact.properties.latest_referral_reward_in_usd || '0'),
          videos_sync_reward_in_usd: parseInt(contact.properties.videos_sync_reward || '0'),
          gleev_channel_id: parseInt(contact.properties.gleev_channel_id || '0'),
          tier:
            parseInt(contact.properties.total_subscribers) < 5000
              ? 1
              : parseInt(contact.properties.total_subscribers) < 50000
              ? 2
              : 3,
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
      properties: payableContactProps as unknown as string[],
      limit: 50,
      after: 0,
    })
    const contacts = response.results.map((contact) => ({
      contactId: contact.id,
      email: contact.properties.email,
      channel_url: contact.properties.channel_url.split('/')[1],
      gleev_channel_id: contact.properties.gleev_channel_id,
      sign_up_reward_in_usd: contact.properties.sign_up_reward_in_usd,
      latest_referral_reward_in_usd: contact.properties.latest_referral_reward_in_usd,
      videos_sync_reward: contact.properties.videos_sync_reward,
      latest_ypp_reward: contact.properties.latest_ypp_reward,
      total_ypp_rewards: contact.properties.total_ypp_rewards,
    }))
    return contacts[0]
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
        properties: payableContactProps as unknown as string[],
        limit: 50,
        after: nextPage,
      })
      contacts.push(
        ...response.results.map((contact) => ({
          contactId: contact.id,
          email: contact.properties.email,
          channel_url: contact.properties.channel_url.split('/')[1],
          gleev_channel_id: contact.properties.gleev_channel_id,
          sign_up_reward_in_usd: contact.properties.sign_up_reward_in_usd,
          latest_referral_reward_in_usd: contact.properties.latest_referral_reward_in_usd,
          videos_sync_reward: contact.properties.videos_sync_reward,
          latest_ypp_reward: contact.properties.latest_ypp_reward,
          total_ypp_rewards: contact.properties.total_ypp_rewards,
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
    await hubspotClient.crm.contacts.basicApi.update(contactId, { properties })
  } catch (err) {
    console.error(err)
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
    console.log('Error: Failed to update contacts in Hubspot', err)
    throw err
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
  try {
    if (contactId) {
      return await updateYppContact(contactId, mapDynamoItemToContactFields(item))
    } else {
      return await createYppContact(mapDynamoItemToContactFields(item))
    }
  } catch (error) {
    console.error(error)
  }
}

function mapDynamoItemToContactFields(item: YtChannel): Partial<HubspotYPPContact> {
  return {
    channel_title: item.title,
    channel_url: `channel/${item.id}`,
    email: item.email,
    total_subscribers: item.statistics.subscriberCount.toString(),
    gleev_channel_id: item.joystreamChannelId.toString(),
    lifecyclestage: 'customer',
    hs_lead_status: 'CONNECTED', // Lead Status
    date_signed_up_to_ypp: new Date(item.createdAt).setUTCHours(0, 0, 0, 0).toString(), // Date Signed up to YPP
  }
}
