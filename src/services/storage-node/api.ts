import { createType } from '@joystream/types'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import BN from 'bn.js'
import FormData from 'form-data'
import _ from 'lodash'
import { Logger } from 'winston'
import ytdl from 'ytdl-core'
import { ExitCodes, StorageApiError } from '../../types/errors'
import { YtVideo } from '../../types/youtube'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { getThumbnailAsset } from '../runtime/client'
import { AssetUploadInput, StorageNodeInfo } from '../runtime/types'

export type OperatorInfo = { id: string; endpoint: string }
export type OperatorsMapping = Record<string, OperatorInfo>
export type VideoUploadResponse = {
  id: string // hash of dataObject uploaded
}

export class StorageNodeApi {
  private logger: Logger
  private queryNodeApi: QueryNodeApi

  public constructor(logging: LoggingService, queryNodeApi: QueryNodeApi) {
    this.queryNodeApi = queryNodeApi
    this.logger = logging.createLogger('StorageNodeApi')
  }

  // Adds timeout for the request which can additionally take into account response processing time.
  private reqConfigWithTimeout(options: AxiosRequestConfig, timeoutMs: number): [AxiosRequestConfig, NodeJS.Timeout] {
    const source = axios.CancelToken.source()
    const timeout = setTimeout(() => {
      this.logger.error(`Request timeout of ${timeoutMs}ms reached`, { timeoutMs })
      source.cancel('Request timeout')
    }, timeoutMs)
    return [
      {
        ...options,
        cancelToken: source.token,
      },
      timeout,
    ]
  }

  // public async isObjectAvailable(objectId: string): Promise<boolean> {
  //   const [options, timeout] = this.reqConfigWithTimeout({}, this.config.limits.outboundRequestsTimeoutMs)
  //   this.logger.debug('Checking object availibility', { objectId })
  //   try {
  //     await this.filesApi.filesApiGetFileHeaders(objectId, options)
  //     this.logger.debug('Data object available', { objectId })
  //     return true
  //   } catch (err) {
  //     if (axios.isAxiosError(err)) {
  //       this.logger.debug('Data object not available', { objectId, err: parseAxiosError(err) })
  //       return false
  //     }
  //     this.logger.error('Unexpected error while requesting data object', { objectId, err })
  //     throw err
  //   } finally {
  //     clearTimeout(timeout)
  //   }
  // }

  async uploadVideo(video: YtVideo): Promise<void> {
    const assetsInput: AssetUploadInput[] = [
      {
        dataObjectId: createType('u64', new BN(video.joystreamVideo.assetIds[0])),
        file: ytdl(video.url, { quality: 'highest' }),
      },
      {
        dataObjectId: createType('u64', new BN(video.joystreamVideo.assetIds[1])),
        file: await getThumbnailAsset(video.thumbnails),
      },
    ]
    return this.upload(assetsInput)
  }

  private async upload(assets: AssetUploadInput[]) {
    // Since both assets belong to the same bag, we can use any asset ID to get bag info
    const bagId = await this.queryNodeApi.getStorageBagInfoForAsset(assets[0].dataObjectId.toString())
    const operator = await this.getRandomActiveStorageNodeInfo(bagId)
    if (!operator) {
      throw new StorageApiError(ExitCodes.StorageApi.NO_ACTIVE_STORAGE_PROVIDER, 'No active storage node found')
    }

    for (const { dataObjectId, file } of assets) {
      try {
        this.logger.verbose('Uploading asset', { dataObjectId: dataObjectId.toString() })

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
      } catch (error) {
        const msg: string = (error as AxiosError).response?.data?.message
        this.logger.error(msg)
        if (msg.includes(`Data object ${dataObjectId} has already been accepted by storage node`)) {
          // No need to throw an error, we can continue with the next asset
          continue
        }

        throw error
      }
    }
  }

  private async getRandomActiveStorageNodeInfo(
    bagId: string,
    retryTime = 6,
    retryCount = 5
  ): Promise<StorageNodeInfo | null> {
    for (let i = 0; i <= retryCount; ++i) {
      const nodesInfo = _.shuffle(await this.queryNodeApi.storageNodesInfoByBagId(bagId))
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
        this.logger.warn(
          `No storage provider can serve the request yet, retrying in ${retryTime}s (${i + 1}/${retryCount})...`
        )
        await new Promise((resolve) => setTimeout(resolve, retryTime * 1000))
      }
    }

    return null
  }
}
