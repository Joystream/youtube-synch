import { Channel, Video } from '@youtube-sync/domain'
import axios from 'axios'
import FormData from 'form-data'
import _ from 'lodash'
import QueryNodeApi from '../src/graphql/QueryNodeApi'
import { AssetUploadInput, StorageNodeInfo } from '../src/types'

export type OperatorInfo = { id: string; endpoint: string }
export type OperatorsMapping = Record<string, OperatorInfo>
export type VideoUploadResponse = { id: string; video: Video }

export class Uploader {
  private client: QueryNodeApi
  constructor(client: QueryNodeApi) {
    this.client = client
  }

  async upload(assets: AssetUploadInput[], channel: Channel) {
    const bagId = `dynamic:channel:${channel.joystreamChannelId}`
    const operator = await this.getRandomActiveStorageNodeInfo(bagId)

    try {
      for (const { dataObjectId, file } of assets) {
        const formData = new FormData()
        formData.append('file', file, 'video.mp4')
        await axios.post<VideoUploadResponse>(`${operator.apiEndpoint}/files`, formData, {
          params: {
            dataObjectId: dataObjectId.toString(),
            storageBucketId: operator.bucketId,
            bagId,
          },
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          headers: {
            'content-type': 'multipart/form-data',
            ...formData.getHeaders(),
          },
        })
      }
    } catch (error) {
      console.log('error: ', error)
      throw error
    }
  }

  async getRandomActiveStorageNodeInfo(bagId: string, retryTime = 6, retryCount = 5): Promise<StorageNodeInfo | null> {
    for (let i = 0; i <= retryCount; ++i) {
      const nodesInfo = _.shuffle(await this.client.storageNodesInfoByBagId(bagId))
      for (const info of nodesInfo) {
        try {
          await axios.get(info.apiEndpoint + '/version', {
            headers: {
              connection: 'close',
            },
          })
          return info
        } catch (err) {
          continue
        }
      }
      if (i !== retryCount) {
        console.log(
          `No storage provider can serve the request yet, retrying in ${retryTime}s (${i + 1}/${retryCount})...`
        )
        await new Promise((resolve) => setTimeout(resolve, retryTime * 1000))
      }
    }

    return null
  }
}
