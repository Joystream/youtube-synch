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
import { Bytes } from '@polkadot/types'
import { Option } from '@polkadot/types/'
import { PalletContentStorageAssetsRecord } from '@polkadot/types/lookup'
import axios from 'axios'
import { Readable } from 'stream'
import { Logger } from 'winston'
import { ReadonlyConfig, VideoProcessingTask } from '../../types'
import { ExitCodes, RuntimeApiError } from '../../types/errors'
import { Thumbnails, YtVideo } from '../../types/youtube'
import { AppActionSignatureInput, computeFileHashAndSize, signAppActionCommitmentForVideo } from '../../utils/hasher'
import { LoggingService } from '../logging'
import { QueryNodeApi } from '../query-node/api'
import { IYoutubeApi } from '../youtube/api'
import { RuntimeApi } from './api'
import { asValidatedMetadata, metadataToBytes } from './serialization'
import { AccountsUtil } from './signer'
import { DataObjectMetadata, VideoFileMetadata, VideoInputAssets, VideoInputParameters } from './types'

export class JoystreamClient {
  private runtimeApi: RuntimeApi
  private accounts: AccountsUtil
  private qnApi: QueryNodeApi
  private youtubeApi: IYoutubeApi
  private config: ReadonlyConfig
  private logger: Logger

  constructor(config: ReadonlyConfig, youtubeApi: IYoutubeApi, qnApi: QueryNodeApi, logging: LoggingService) {
    this.logger = logging.createLogger('JoystreamClient')
    this.qnApi = qnApi
    this.config = config
    this.youtubeApi = youtubeApi
    this.runtimeApi = new RuntimeApi(this.config.endpoints.joystreamNodeWs, logging)
    this.accounts = new AccountsUtil(this.config.joystream)
  }

  async channelById(id: number) {
    return this.runtimeApi.query.content.channelById(id)
  }

  // Get Joystream video by by Youtube resource id/attribution synced by the app (if any)
  async getVideoByYtResourceId(ytVideoId: string) {
    const appName = this.config.joystream.app.name
    return this.qnApi.getVideoByYtResourceIdAndEntryAppName(ytVideoId, appName)
  }

  async ensureCollaboratorHasPermission(channelId: number) {
    const collaborator = this.config.joystream.channelCollaborator.memberId.toString()
    const member = await this.qnApi.memberById(collaborator)
    if (!member) {
      throw new Error(`Joystream member with id ${collaborator} not found`)
    }

    const { collaborators } = await this.channelById(channelId)
    const isCollaboratorSet = [...collaborators].some(
      ([member, permissions]) => member.toString() === collaborator && [...permissions].some((p) => p.isAddVideo)
    )

    if (!isCollaboratorSet) {
      throw new RuntimeApiError(
        ExitCodes.RuntimeApi.COLLABORATOR_NOT_FOUND,
        `Member ${collaborator} does not have permission to add videos to channel ${channelId}`
      )
    }

    return member
  }

  async createVideo(video: VideoProcessingTask): Promise<YtVideo> {
    const collaborator = await this.ensureCollaboratorHasPermission(video.joystreamChannelId)

    // Video metadata & assets
    const { meta: rawAction, assets } = await this.prepareVideoInput(this.runtimeApi, video)

    const creatorId = video.joystreamChannelId.toString()
    const nonce = (await this.qnApi.getChannelById(creatorId || ''))?.totalVideosCreated || 0
    const appActionMetadata = metadataToBytes(AppActionMetadata, { videoId: video.resourceId })
    const appAction = await this.prepareAppActionInput({
      rawAction,
      assets,
      nonce,
      creatorId,
      appActionMetadata,
    })

    const keyPair = this.accounts.getPair(collaborator.controllerAccount)
    const createdVideo = await this.runtimeApi.createVideo(
      keyPair,
      collaborator.id,
      video.joystreamChannelId,
      appAction,
      assets
    )

    return {
      ...video,
      joystreamVideo: {
        id: createdVideo.videoId.toString(),
        assetIds: createdVideo.assetsIds.map((a) => a.toString()),
      },
    }
  }

  private async prepareAppActionInput(appActionSignatureInput: AppActionSignatureInput): Promise<Bytes> {
    const appName = this.config.joystream.app.name
    const app = await this.qnApi.getAppByName(appName)
    if (!app || !app.authKey) {
      throw new RuntimeApiError(ExitCodes.RuntimeApi.APP_NOT_FOUND, `Either App(${appName}), or its authKey not found`)
    }
    const keyPair = this.accounts.getPair(app.authKey)
    const appActionSignature = await signAppActionCommitmentForVideo(appActionSignatureInput, keyPair)

    const appActionInput: IAppAction = {
      appId: app.id,
      rawAction: appActionSignatureInput.rawAction,
      signature: appActionSignature,
      metadata: appActionSignatureInput.appActionMetadata,
    }
    const appAction = metadataToBytes(AppAction, appActionInput)
    return appAction
  }

  private async prepareVideoInput(
    api: RuntimeApi,
    video: YtVideo
  ): Promise<{ meta: Bytes; assets: Option<PalletContentStorageAssetsRecord> }> {
    const inputAssets: VideoInputAssets = {}
    const videoHashStream = await this.youtubeApi.downloadVideo(video.url)
    const videoMetadataStream = await this.youtubeApi.downloadVideo(video.url)
    const { hash: videoHash, size: videoSize } = await computeFileHashAndSize(videoHashStream)
    const videoAssetMeta: DataObjectMetadata = {
      ipfsHash: videoHash,
      size: videoSize,
    }

    const thumbnailPhotoStream = await getThumbnailAsset(video.thumbnails)
    const { hash: thumbnailPhotoHash, size: thumbnailPhotoSize } = await computeFileHashAndSize(thumbnailPhotoStream)
    const thumbnailPhotoAssetMeta: DataObjectMetadata = {
      ipfsHash: thumbnailPhotoHash,
      size: thumbnailPhotoSize,
    }

    const videoInputParameters: VideoInputParameters = {
      title: video.title,
      description: video.description,
      category: video.category,
      language: video.language,
      isPublic: true,
      duration: video.duration,
      license: getVideoLicense(video),
    }
    let videoMetadata = asValidatedMetadata(VideoMetadata, videoInputParameters)

    // const videoFileMetadata = await getVideoFileMetadata(videoMetadataStream)
    // this.logger.info('Video media file parameters established:', videoFileMetadata)
    // videoMetadata = setVideoMetadataDefaults(videoMetadata, videoFileMetadata)

    inputAssets.video = videoAssetMeta
    inputAssets.thumbnailPhoto = thumbnailPhotoAssetMeta

    // prepare data objects and assign proper indexes in metadata
    const videoDataObjectsMetadata: DataObjectMetadata[] = [
      ...(inputAssets.video ? [inputAssets.video] : []),
      ...(inputAssets.thumbnailPhoto ? [inputAssets.thumbnailPhoto] : []),
    ]
    const assets = await prepareAssetsForExtrinsic(api, videoDataObjectsMetadata)
    if (inputAssets.video) {
      videoMetadata.video = 0
    }
    if (inputAssets.thumbnailPhoto) {
      videoMetadata.thumbnailPhoto = inputAssets.video ? 1 : 0
    }

    const meta = metadataToBytes(ContentMetadata, { videoMetadata })

    return { meta, assets }
  }
}

export async function getThumbnailAsset(thumbnails: Thumbnails) {
  // * We are using `medium` thumbnail because it has correct aspect ratio for Atlas (16/9)
  const response = await axios.get<Readable>(thumbnails.medium, { responseType: 'stream' })
  return response.data
}

async function prepareAssetsForExtrinsic(
  api: RuntimeApi,
  dataObjectsMetadata: DataObjectMetadata[]
): Promise<Option<PalletContentStorageAssetsRecord>> {
  const feePerMB = await api.query.storage.dataObjectPerMegabyteFee()

  const objectCreationList = dataObjectsMetadata.map((metadata) => ({
    size_: metadata.size,
    ipfsContentId: metadata.ipfsHash,
  }))

  return createType(
    'Option<PalletContentStorageAssetsRecord>',
    dataObjectsMetadata.length
      ? {
          expectedDataSizeFee: feePerMB,
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
