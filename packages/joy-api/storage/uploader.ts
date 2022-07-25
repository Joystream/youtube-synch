import { Channel, DomainError, Result, Video } from '@youtube-sync/domain'
import ytdl from 'ytdl-core'
import { groupBy, flatten } from 'lodash'
import FormData from 'form-data'
import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client'
import {
  createGraphqlClient,
  GetStorageBucketsQuery,
  GetStorageBucketsQueryVariables,
} from '../graphql'
import axios from 'axios'

export type OperatorInfo = { id: string; endpoint: string }
export type OperatorsMapping = Record<string, OperatorInfo>
export type VideoUploadResponse = { id: string; video: Video }

export class Uploader {
  private client: ApolloClient<NormalizedCacheObject>
  constructor(orionUrl: string) {
    this.client = createGraphqlClient(orionUrl)
  }

  async upload(
    dataObjectId: string,
    channel: Channel,
    video: Video
  ): Promise<Result<VideoUploadResponse, DomainError>> {
    const bag = `dynamic:channel:${channel.chainMetadata.id}`
    const operator = await this.getRandomOperator(bag)
    const videoInfo = await ytdl.getBasicInfo(video.url)
    console.log(videoInfo)
    const formData = new FormData()
    formData.append('dataObjectId', dataObjectId)
    formData.append('storageBucketId', operator.info.id)
    formData.append('bagId', bag)
    formData.append(
      'file',
      ytdl(video.url, { quality: 'highest' }),
      'video.mp4'
    )
    const response = await axios
      .post<VideoUploadResponse>(
        `${operator.info.endpoint}api/v1/files`,
        formData,
        {
          headers: formData.getHeaders(),
        }
      )
      .then((resp) => Result.Success(resp.data))
      .catch((err) => {
        console.log(err)
        return Result.Error<VideoUploadResponse, DomainError>(
          new DomainError(err.message)
        )
      })
    return response
  }

  async getRandomOperator(bagId: string) {
    const bags = await this.getBags()
    const operators = bags[bagId]
    return operators[getRandomIntInclusive(0, operators.length - 1)]
  }

  private async getBags() {
    const response = await this.client.query<
      GetStorageBucketsQuery,
      GetStorageBucketsQueryVariables
    >({
      query: gql`
        query GetStorageBuckets {
          storageBuckets(
            limit: 50
            where: {
              operatorStatus_json: {
                isTypeOf_eq: "StorageBucketOperatorStatusActive"
              }
              operatorMetadata: { nodeEndpoint_contains: "http" }
            }
          ) {
            id
            operatorMetadata {
              nodeEndpoint
            }
            bags {
              id
            }
          }
        }
      `,
      fetchPolicy: 'network-only',
    })
    const bags = response.data.storageBuckets.map((bucket) =>
      bucket.bags.map((bag) => ({
        id: bag.id,
        info: {
          id: bucket.id,
          endpoint: bucket.operatorMetadata.nodeEndpoint,
        } as OperatorInfo,
      }))
    )
    return groupBy(flatten(bags), (b) => b.id)
  }
}

const getRandomIntInclusive = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
