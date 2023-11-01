import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import {
  AppAction,
  AppActionMetadata,
  ContentMetadata,
  IAppAction,
  ILicense,
  IVideoMetadata,
  VideoMetadata,
} from '@joystream/metadata-protobuf'
import { createType } from '@joystream/types'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { Bytes } from '@polkadot/types'
import { Option } from '@polkadot/types/'
import { PalletContentStorageAssetsRecord } from '@polkadot/types/lookup'
import type { ISubmittableResult } from '@polkadot/types/types'
import axios from 'axios'
import BN from 'bn.js'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import mimeTypes from 'mime-types'
import path from 'path'
import { Readable } from 'stream'
import { Logger } from 'winston'
import { ReadonlyConfig } from '../../types'
import { ExitCodes, RuntimeApiError } from '../../types/errors'
import { Thumbnails, YtVideo, YtVideoWithJsChannelId } from '../../types/youtube'
import { AppActionSignatureInput, signAppActionCommitmentForVideo } from '../../utils/hasher'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { MembershipFieldsFragment as Membership } from '../query-node/generated/queries'
import { VideoMetadataAndHash } from '../syncProcessing/ContentMetadataService'
import { CreateVideoExtrinsicDefaults, RuntimeApi } from './api'
import { asValidatedMetadata, metadataToBytes } from './serialization'
import { AccountsUtil } from './signer'
import {
  DataObjectMetadata,
  VideoFFProbeMetadata,
  VideoFileMetadata,
  VideoInputAssets,
  VideoInputParameters,
} from './types'

ffmpeg.setFfprobePath(ffprobeInstaller.path)

export class JoystreamClient {
  private runtimeApi: RuntimeApi
  private accounts: AccountsUtil
  private qnApi: QueryNodeApi
  private config: ReadonlyConfig
  private logger: Logger

  constructor(config: ReadonlyConfig, runtimeApi: RuntimeApi, qnApi: QueryNodeApi, logging: LoggingService) {
    this.logger = logging.createLogger('JoystreamClient')
    this.qnApi = qnApi
    this.config = config
    this.runtimeApi = runtimeApi
    this.accounts = new AccountsUtil(this.config.joystream)
  }

  private get collaboratorId() {
    return this.config.joystream.channelCollaborator.memberId.toString()
  }

  async channelById(id: number) {
    return this.runtimeApi.query.content.channelById(id)
  }

  async hasQueryNodeProcessedBlock(blockNumber: number) {
    const qnState = await this.qnApi.getQueryNodeState()

    if (!qnState) {
      this.logger.error('Could not fetch connected Query Node state')
      return false
    }

    if (blockNumber > qnState.lastCompleteBlock) {
      return false
    }

    return true
  }

  async createVideoExtrinsicDefaults(channelId: number) {
    return this.runtimeApi.createVideoExtrinsicDefaults(channelId)
  }

  // Get Joystream video by by Youtube resource id/attribution synced by the app (if any)
  async getVideoByYtResourceId(ytVideoId: string) {
    const appName = this.config.joystream.app.name
    return this.qnApi.getVideoByYtResourceIdAndEntryAppName(ytVideoId, appName)
  }

  async totalVideosCreatedByChannel(channelId: number) {
    return (await this.qnApi.getChannelById(channelId.toString()))?.totalVideosCreated || 0
  }

  async getApp() {
    const appName = this.config.joystream.app.name
    const app = await this.qnApi.getAppByName(appName)
    if (!app || !app.authKey) {
      throw new RuntimeApiError(ExitCodes.RuntimeApi.APP_NOT_FOUND, `Either App(${appName}), or its authKey not found`)
    }
    return app
  }

  async getCollaboratorMember() {
    const member = await this.qnApi.memberById(this.collaboratorId)
    if (!member) {
      throw new RuntimeApiError(
        ExitCodes.RuntimeApi.COLLABORATOR_NOT_FOUND,
        `Joystream member with id ${this.collaboratorId} not found`
      )
    }
    return member
  }

  async doesChannelHaveCollaborator(channelId: number) {
    const { collaborators } = await this.channelById(channelId)
    const isCollaboratorSet = [...collaborators].some(
      ([member, permissions]) => member.toString() === this.collaboratorId && [...permissions].some((p) => p.isAddVideo)
    )

    return isCollaboratorSet
  }

  async sendBatchExtrinsic(account: string, txs: SubmittableExtrinsic<'promise', ISubmittableResult>[]) {
    const keyPair = this.accounts.getPair(account)
    const batchTx = this.runtimeApi.tx.utility.batchAll(txs)
    const result = await this.runtimeApi.sendExtrinsic(keyPair, batchTx)
    const blockHash = result.status.isInBlock ? result.status.asInBlock : result.status.asFinalized

    const events = this.runtimeApi.getEvents(result, 'content', 'VideoCreated')
    return {
      blockNumber: (await this.runtimeApi.rpc.chain.getHeader(blockHash)).number.toNumber(),
      result: events.map(({ data }) => ({
        joystreamVideo: {
          id: data[2].toString(),
          assetIds: [...data[4]].map((a) => a.toString()),
        },
      })),
    }
  }

  async createVideoTx(
    appId: string,
    nonce: number,
    collaborator: Membership,
    extrinsicDefaults: CreateVideoExtrinsicDefaults,
    video: YtVideoWithJsChannelId & { videoMetadata: VideoMetadataAndHash }
  ): Promise<SubmittableExtrinsic<'promise', ISubmittableResult>> {
    // Video metadata & assets
    const { meta: rawAction, assets } = this.prepareVideoInput(extrinsicDefaults, video, video.videoMetadata)

    const appActionMetadata = metadataToBytes(AppActionMetadata, { videoId: video.id })
    const appAction = await this.prepareAppActionInput(appId, {
      rawAction,
      assets,
      nonce,
      creatorId: video.joystreamChannelId.toString(),
      appActionMetadata,
    })

    const createdVideoTx = this.runtimeApi.prepareCreateVideoTx(
      collaborator.id,
      video.joystreamChannelId,
      extrinsicDefaults,
      appAction,
      assets
    )

    return createdVideoTx
  }

  private async prepareAppActionInput(appId: string, appActionSignatureInput: AppActionSignatureInput): Promise<Bytes> {
    const appActionSignature = await signAppActionCommitmentForVideo(appActionSignatureInput, this.accounts.appAuthKey)
    const appActionInput: IAppAction = {
      appId,
      rawAction: appActionSignatureInput.rawAction,
      signature: appActionSignature,
      metadata: appActionSignatureInput.appActionMetadata,
    }
    const appAction = metadataToBytes(AppAction, appActionInput)
    return appAction
  }

  private prepareVideoInput(
    { perMegabyteFee }: CreateVideoExtrinsicDefaults,
    video: YtVideo,
    { thumbnailHash, mediaHash, mediaMetadata }: VideoMetadataAndHash
  ): { meta: Bytes; assets: Option<PalletContentStorageAssetsRecord> } {
    const inputAssets: VideoInputAssets = {}
    inputAssets.video = { ipfsHash: mediaHash.hash, size: mediaHash.size }
    inputAssets.thumbnailPhoto = { ipfsHash: thumbnailHash.hash, size: thumbnailHash.size }

    const videoInputParameters: VideoInputParameters = {
      title: video.title,
      description: video.description,
      category: video.category,
      language: video.languageIso,
      isPublic: true,
      duration: video.duration,
      license: getVideoLicense(video),
      publishedBeforeJoystream: { isPublished: true, date: video.publishedAt },
    }
    let videoMetadata = asValidatedMetadata(VideoMetadata, videoInputParameters)
    videoMetadata = setVideoMetadataDefaults(videoMetadata, mediaMetadata)

    // prepare data objects and assign proper indexes in metadata
    const dataObjectsMetadata: DataObjectMetadata[] = [
      ...(inputAssets.video ? [inputAssets.video] : []),
      ...(inputAssets.thumbnailPhoto ? [inputAssets.thumbnailPhoto] : []),
    ]
    if (inputAssets.video) {
      videoMetadata.video = 0
    }
    if (inputAssets.thumbnailPhoto) {
      videoMetadata.thumbnailPhoto = inputAssets.video ? 1 : 0
    }

    const meta = metadataToBytes(ContentMetadata, { videoMetadata })
    const assets = prepareAssetsForExtrinsic(perMegabyteFee, dataObjectsMetadata)

    return { meta, assets }
  }
}

export async function getThumbnailAsset(thumbnails: Thumbnails) {
  try {
    // * We are using `medium` thumbnail because it has correct aspect ratio for Atlas (16/9)
    const response = await axios.get<Readable>(thumbnails.medium, { responseType: 'stream' })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.toJSON()
    }
    throw error
  }
}

function prepareAssetsForExtrinsic(
  perMegabyteFee: BN,
  dataObjectsMetadata: DataObjectMetadata[]
): Option<PalletContentStorageAssetsRecord> {
  const objectCreationList = dataObjectsMetadata.map((metadata) => ({
    size_: metadata.size,
    ipfsContentId: metadata.ipfsHash,
  }))

  return createType(
    'Option<PalletContentStorageAssetsRecord>',
    dataObjectsMetadata.length
      ? {
          expectedDataSizeFee: perMegabyteFee,
          objectCreationList: objectCreationList,
        }
      : null
  )
}

function setVideoMetadataDefaults(metadata: IVideoMetadata, videoFileMetadata: VideoFileMetadata): IVideoMetadata {
  return {
    duration: videoFileMetadata.duration,
    mediaPixelWidth: videoFileMetadata.width,
    mediaPixelHeight: videoFileMetadata.height,
    mediaType: {
      codecName: videoFileMetadata.codecName,
      container: videoFileMetadata.container,
      mimeMediaType: videoFileMetadata.mimeType,
    },
    ...metadata,
  }
}

function getVideoLicense(video: YtVideo): ILicense {
  // FROM https://github.com/Joystream/atlas/blob/master/packages/atlas/src/data/knownLicenses.json
  // `creativeCommon` license video gets `CCO` license on joystream (code 1002)
  if (video.license === 'creativeCommon') {
    return {
      code: 1002,
    }
  }

  // `youtube` license video gets `joystream` license on joystream (code 1009)
  return {
    code: 1009,
  }
}

function getVideoFFProbeMetadata(filePath: string): Promise<VideoFFProbeMetadata> {
  return new Promise<VideoFFProbeMetadata>((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      const videoStream = data.streams.find((s) => s.codec_type === 'video')
      if (videoStream) {
        resolve({
          width: videoStream.width,
          height: videoStream.height,
          codecName: videoStream.codec_name,
          codecFullName: videoStream.codec_long_name,
          duration: videoStream.duration !== undefined ? Math.ceil(Number(videoStream.duration)) || 0 : undefined,
        })
      } else {
        reject(new Error('NoVideoStreamInFile'))
      }
    })
  })
}

export async function getVideoFileMetadata(filePath: string): Promise<VideoFileMetadata> {
  const size = fs.statSync(filePath).size
  const container = path.extname(filePath).slice(1)
  const mimeType = mimeTypes.lookup(container) || `unknown`
  const ffProbeMetadata = await getVideoFFProbeMetadata(filePath)
  return {
    size,
    container,
    mimeType,
    ...ffProbeMetadata,
  }
}
