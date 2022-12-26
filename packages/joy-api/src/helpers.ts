import { ContentMetadata, IVideoMetadata } from '@joystream/metadata-protobuf'
import { createType } from '@joystream/types'
import { DataObjectId } from '@joystream/types/primitives'
import { ApiPromise as PolkadotApi } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { Bytes } from '@polkadot//types'
import { KeyringPair } from '@polkadot/keyring/types'
import { BTreeSet, GenericEvent } from '@polkadot/types'
import { Hash } from '@polkadot/types/interfaces'
import { DispatchError, Event, EventRecord } from '@polkadot/types/interfaces/system'
import { PalletContentStorageAssetsRecord } from '@polkadot/types/lookup'
import { Registry } from '@polkadot/types/types'
import ffmpeg from 'fluent-ffmpeg'
import { Readable } from 'stream'
import {
  ChannelAssets,
  ChannelAssetsIds,
  ChannelInputAssets,
  DataObjectMetadata,
  ExtractChannelResultsAssetsIdsFn,
  ExtractVideoResultsAssetsIdsFn,
  ExtrinsicStatus,
  ExtrinsicStatusCallbackFn,
  VideoAssets,
  VideoAssetsIds,
  VideoFFProbeMetadata,
  VideoFileMetadata,
  VideoInputAssets,
} from './'
import { JoystreamLibError } from './errors'
import { Logger } from './logger'
import { metadataToBytes } from './serialization'

export async function prepareAssetsForExtrinsic(api: PolkadotApi, dataObjectsMetadata: DataObjectMetadata[]) {
  if (!dataObjectsMetadata.length) {
    return undefined
  }

  const feePerMB = await api.query.storage.dataObjectPerMegabyteFee()

  const objectCreationList = dataObjectsMetadata.map((metadata) => ({
    size_: metadata.size,
    ipfsContentId: metadata.ipfsHash,
  }))

  return createType('PalletContentStorageAssetsRecord', {
    expectedDataSizeFee: feePerMB,
    objectCreationList: objectCreationList,
  })
}

async function getVideoFFProbeMetadata(stream: Readable): Promise<VideoFFProbeMetadata> {
  return new Promise<VideoFFProbeMetadata>((resolve, reject) => {
    ffmpeg(stream).ffprobe((err, data) => {
      if (err) {
        console.log('ffprobe error', err)
        reject(err)
        return
      }
      const videoStream = data.streams.find((s) => s.codec_type === 'video')
      console.log('videoStream', data.streams)
      if (videoStream) {
        resolve({
          width: videoStream.width,
          height: videoStream.height,
          codecName: videoStream.codec_name,
          codecFullName: videoStream.codec_long_name,
          duration: videoStream.duration !== undefined ? Math.ceil(Number(videoStream.duration)) || 0 : undefined,
        })
      } else {
        reject(new Error('No video stream found in file'))
      }
    })
  })
}

export async function getVideoFileMetadata(videoStream: Readable): Promise<VideoFileMetadata> {
  let ffProbeMetadata: VideoFFProbeMetadata = {}
  try {
    ffProbeMetadata = await getVideoFFProbeMetadata(videoStream)
  } catch (e) {
    const message = e instanceof Error ? e.message : e
    console.log(`Failed to get video metadata via ffprobe (${message})`)
  }

  return {
    ...ffProbeMetadata,
  }
}

export async function parseVideoExtrinsicInput(
  api: PolkadotApi,
  videoMetadata: IVideoMetadata,
  inputAssets: VideoInputAssets
): Promise<readonly [Bytes, PalletContentStorageAssetsRecord | undefined]> {
  // prepare data objects and assign proper indexes in metadata
  const videoDataObjectsMetadata: DataObjectMetadata[] = [
    ...(inputAssets.video ? [inputAssets.video] : []),
    ...(inputAssets.thumbnailPhoto ? [inputAssets.thumbnailPhoto] : []),
  ]
  const videoStorageAssets = await prepareAssetsForExtrinsic(api, videoDataObjectsMetadata)
  if (inputAssets.video) {
    videoMetadata.video = 0
  }
  if (inputAssets.thumbnailPhoto) {
    videoMetadata.thumbnailPhoto = inputAssets.video ? 1 : 0
  }

  const videoMetadataBytes = metadataToBytes(ContentMetadata, { videoMetadata })
  return [videoMetadataBytes, videoStorageAssets] as const
}

export function parseExtrinsicEvents(registry: Registry, eventRecords: EventRecord[]): Event[] {
  const events = eventRecords.map((record) => record.event)
  const systemEvents = events.filter((event) => event.section === 'system')

  for (const event of systemEvents) {
    if (event.method === 'ExtrinsicFailed') {
      const errorMsg = extractExtrinsicErrorMsg(registry, event)
      if (errorMsg.includes('VoucherSizeLimitExceeded')) {
        throw new JoystreamLibError({
          name: 'VoucherLimitError',
          message: errorMsg,
        })
      } else {
        throw new JoystreamLibError({
          name: 'FailedError',
          message: errorMsg,
        })
      }
    } else if (event.method === 'ExtrinsicSuccess') {
      return events
    } else {
      Logger.log('Unknown extrinsic event', {
        event: { method: event.method },
      })
    }
  }

  throw new JoystreamLibError({
    name: 'UnknownError',
    message: "Finalized extrinsic didn't fail or succeed",
    details: events,
  })
}

const extractExtrinsicErrorMsg = (registry: Registry, event: Event) => {
  const dispatchError = event.data[0] as DispatchError
  let errorMsg = dispatchError.toString()
  if (dispatchError.isModule) {
    try {
      const { name, docs } = registry.findMetaError(dispatchError.asModule)
      errorMsg = `${name} (${docs.join(', ')})`
    } catch (e) {
      // This probably means we don't have this error in the metadata
      // In this case - continue (we'll just display dispatchError.toString())
    }
  }
  return errorMsg
}

type RawExtrinsicResult = {
  events: GenericEvent[]
  blockHash: Hash
}

export const sendExtrinsicAndParseEvents = (
  tx: SubmittableExtrinsic<'promise'>,
  accountId: KeyringPair,
  registry: Registry,
  cb?: ExtrinsicStatusCallbackFn
) =>
  new Promise<RawExtrinsicResult>((resolve, reject) => {
    let unsub: () => void
    tx.signAndSend(accountId, (result) => {
      const { status, isError, events: rawEvents } = result

      if (isError) {
        unsub()

        reject(
          new JoystreamLibError({
            name: 'UnknownError',
            message: 'Unknown extrinsic error!',
          })
        )
        return
      }

      if (status.isFinalized) {
        unsub()

        try {
          const events = parseExtrinsicEvents(registry, rawEvents)
          resolve({ events, blockHash: status.asFinalized })
        } catch (error) {
          reject(error)
        }
      }
    })
      .then((unsubFn) => {
        // if signAndSend succeeded, report back to the caller with the update
        cb?.(ExtrinsicStatus.Signed)
        unsub = unsubFn
      })
      .catch((e) => {
        reject(e)
      })
  })

export const getInputDataObjectsIds = (assets: VideoInputAssets | ChannelInputAssets) =>
  Object.values(assets)
    .filter((asset): asset is Required<DataObjectMetadata> => !!asset.replacedDataObjectId)
    .map((asset) => asset.replacedDataObjectId)

const getResultVideoDataObjectsIds = (
  assets: VideoAssets<unknown>,
  dataObjectsIds: BTreeSet<DataObjectId>
): VideoAssetsIds => {
  const ids = [...dataObjectsIds].map((dataObjectsId) => dataObjectsId.toString())

  const hasMedia = !!assets.video
  const hasThumbnail = !!assets.thumbnailPhoto

  return {
    ...(hasMedia ? { media: ids[0] } : {}),
    ...(hasThumbnail ? { thumbnailPhoto: ids[hasMedia ? 1 : 0] } : {}),
  }
}

const getResultChannelDataObjectsIds = (
  assets: ChannelAssets<unknown>,
  dataObjectsIds: BTreeSet<DataObjectId>
): ChannelAssetsIds => {
  const ids = [...dataObjectsIds].map((dataObjectsId) => dataObjectsId.toString())

  const hasAvatar = !!assets.avatarPhoto
  const hasCover = !!assets.coverPhoto

  return {
    ...(hasAvatar ? { avatarPhoto: ids[0] } : {}),
    ...(hasCover ? { coverPhoto: ids[hasAvatar ? 1 : 0] } : {}),
  }
}

export const extractChannelResultAssetsIds: ExtractChannelResultsAssetsIdsFn = (inputAssets, getEventData) => {
  const anyAssetsChanged = !!Object.values(inputAssets).find((asset) => !!asset)
  try {
    const [dataObjectsIds] = getEventData('storage', 'DataObjectsUploaded')
    return getResultChannelDataObjectsIds(inputAssets, dataObjectsIds)
  } catch (error) {
    // If no assets were changed as part of this extrinsic, let's catch the missing error and ignore it. In any other case, we re-throw
    if ((error as JoystreamLibError).name === 'MissingRequiredEventError' && !anyAssetsChanged) {
      return {}
    }
    throw error
  }
}

export const extractVideoResultAssetsIds: ExtractVideoResultsAssetsIdsFn = (inputAssets, getEventData) => {
  const anyAssetsChanged = !!Object.values(inputAssets).find((asset) => !!asset)
  try {
    const [dataObjectsIds] = getEventData('storage', 'DataObjectsUploaded')
    return getResultVideoDataObjectsIds(inputAssets, dataObjectsIds)
  } catch (error) {
    // If no assets were changed as part of this extrinsic, let's catch the missing error and ignore it. In any other case, we re-throw
    if ((error as JoystreamLibError).name === 'MissingRequiredEventError' && !anyAssetsChanged) {
      return {}
    }
    throw error
  }
}
