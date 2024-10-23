import { createType } from '@joystream/types'
import axios from 'axios'
import BN from 'bn.js'
import FormData from 'form-data'
import fs from 'fs'
import _ from 'lodash'
import { Logger } from 'winston'
import { ExitCodes, StorageApiError } from '../../types/errors'
import { YtVideo } from '../../types/youtube'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { getThumbnailAsset } from '../runtime/client'
import { AssetUploadInput, StorageNodeInfo } from '../runtime/types'
import { Readable } from 'stream'
import sleep from 'sleep-promise'

export type OperatorInfo = { id: string; endpoint: string }
export type OperatorsMapping = Record<string, OperatorInfo>
export type VideoUploadResponse = {
  id: string // hash of dataObject uploaded
}

const UPLOAD_MAX_ATTEMPTS = 3
const UPLOAD_RETRY_INTERVAL = 10

export class StorageNodeApi {
  private logger: Logger

  public constructor(logging: LoggingService, private queryNodeApi: QueryNodeApi) {
    this.logger = logging.createLogger('StorageNodeApi')
  }

  async uploadVideo(bagId: string, video: YtVideo, videoFilePath: string): Promise<void> {
    const assetsInput: AssetUploadInput[] = [
      {
        dataObjectId: createType('u64', new BN(video.joystreamVideo.assetIds[0])),
        file: async () => { return fs.createReadStream(videoFilePath) },
      },
      {
        dataObjectId: createType('u64', new BN(video.joystreamVideo.assetIds[1])),
        file: async () => { return getThumbnailAsset(video.thumbnails) },
      },
    ]
    return this.upload(bagId, assetsInput)
  }

  private async upload(bagId: string, assets: AssetUploadInput[]) {
    for (const { dataObjectId, file } of assets) {
      for (const attempt of _.range(1, UPLOAD_MAX_ATTEMPTS)) {
        // Randomly select one active storage node for given bag
        const operator = await this.getRandomActiveStorageNodeInfo(bagId)
        if (!operator) {
          throw new StorageApiError(
            ExitCodes.StorageApi.NO_ACTIVE_STORAGE_PROVIDER,
            `No active storage node found for bagId: ${bagId}`
          )
        }
        const fileStream = await file()
        try {
          await this.uploadAsset(operator, bagId, dataObjectId.toString(), fileStream)
          break // upload successfull, continue with next asset
        } catch (error) {
          fileStream.destroy()

          if (axios.isAxiosError(error) && error.response) {
            const storageNodeUrl = error.config?.url
            const { status, data } = error.response
            error = new Error(data?.message)

            this.logger.error(`${storageNodeUrl} - errorCode: ${status}, msg: ${data?.message}`)

            if (data?.message?.includes(`Data object ${dataObjectId} already exist`)) {
              // No need to throw an error, we can continue with the next asset
              break
            }

            if (data?.message?.includes(`Data object ${dataObjectId} doesn't exist in storage bag ${bagId}`)) {
              if (attempt < UPLOAD_MAX_ATTEMPTS) {
                this.logger.error(`Will retry upload of asset ${dataObjectId} in ${UPLOAD_RETRY_INTERVAL} seconds.`)
                await sleep(UPLOAD_RETRY_INTERVAL * 1000)
                continue // try again
              }
            }
          }

          throw error
        }
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
        this.logger.debug(
          `No storage provider can serve the request yet, retrying in ${retryTime}s (${i + 1}/${retryCount})...`
        )
        await sleep(retryTime * 1000)
      }
    }

    return null
  }

  async uploadAsset(operator: StorageNodeInfo, bagId: string, dataObjectId: string, file: Readable) {
    this.logger.debug('Uploading asset', { dataObjectId })

    const formData = new FormData()
    formData.append('file', file, 'video.mp4')
    await axios.post<VideoUploadResponse>(`${operator.apiEndpoint}/files`, formData, {
      params: {
        dataObjectId,
        storageBucketId: operator.bucketId,
        bagId,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      maxRedirects: 0,
      headers: {
        'content-type': 'multipart/form-data',
        ...formData.getHeaders(),
      },
    })
  }
}
