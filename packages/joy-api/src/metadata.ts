import {
  ContentMetadata,
  License,
  MediaType,
  PublishedBeforeJoystream,
  VideoMetadata,
} from '@joystream/metadata-protobuf'
import { ApiPromise as PolkadotApi } from '@polkadot/api'
import { prepareAssetsForExtrinsic } from './helpers'
import { metadataToBytes } from './serialization'
import { DataObjectMetadata, VideoInputAssets, VideoInputMetadata } from './types'

export async function parseVideoExtrinsicInput(
  api: PolkadotApi,
  inputMetadata: VideoInputMetadata,
  inputAssets: VideoInputAssets
) {
  const videoMetadata = new VideoMetadata()

  // prepare data objects and assign proper indexes in metadata
  const videoDataObjectsMetadata: DataObjectMetadata[] = [
    ...(inputAssets.media ? [inputAssets.media] : []),
    ...(inputAssets.thumbnailPhoto ? [inputAssets.thumbnailPhoto] : []),
  ]
  const videoStorageAssets = await prepareAssetsForExtrinsic(api, videoDataObjectsMetadata)
  if (inputAssets.media) {
    videoMetadata.video = 0
  }
  if (inputAssets.thumbnailPhoto) {
    videoMetadata.thumbnailPhoto = inputAssets.media ? 1 : 0
  }

  if (inputMetadata.title != null) {
    videoMetadata.title = inputMetadata.title
  }
  if (inputMetadata.description != null) {
    videoMetadata.description = inputMetadata.description
  }
  if (inputMetadata.isPublic != null) {
    videoMetadata.isPublic = inputMetadata.isPublic
  }
  if (inputMetadata.language != null) {
    videoMetadata.language = inputMetadata.language
  }
  if (inputMetadata.isExplicit != null) {
    videoMetadata.isExplicit = inputMetadata.isExplicit
  }
  if (inputMetadata.category != null) {
    videoMetadata.category = inputMetadata.category
  }
  if (inputMetadata.duration != null) {
    videoMetadata.duration = inputMetadata.duration
  }
  if (inputMetadata.mediaPixelHeight != null) {
    videoMetadata.mediaPixelHeight = inputMetadata.mediaPixelHeight
  }
  if (inputMetadata.mediaPixelWidth != null) {
    videoMetadata.mediaPixelWidth = inputMetadata.mediaPixelWidth
  }
  if (inputMetadata.hasMarketing != null) {
    videoMetadata.hasMarketing = inputMetadata.hasMarketing
  }

  if (inputMetadata.license) {
    const videoLicenseMetadata = new License()
    if (inputMetadata.license.code != null) {
      videoLicenseMetadata.code = inputMetadata.license.code
    }
    if (inputMetadata.license.attribution != null) {
      videoLicenseMetadata.attribution = inputMetadata.license.attribution
    }
    if (inputMetadata.license.customText != null) {
      videoLicenseMetadata.customText = inputMetadata.license.customText
    }
    videoMetadata.license = videoLicenseMetadata
  }

  if (inputMetadata.mimeMediaType != null) {
    const videoMediaTypeMetadata = new MediaType()
    videoMediaTypeMetadata.mimeMediaType = inputMetadata.mimeMediaType
    videoMetadata.mediaType = videoMediaTypeMetadata
  }

  if (inputMetadata.publishedBeforeJoystream != null) {
    const protoPublishedBeforeJoystream = new PublishedBeforeJoystream()
    protoPublishedBeforeJoystream.isPublished = true
    protoPublishedBeforeJoystream.date = inputMetadata.publishedBeforeJoystream
    videoMetadata.publishedBeforeJoystream = protoPublishedBeforeJoystream
  }

  const videoMetadataBytes = metadataToBytes(ContentMetadata, { videoMetadata })

  return [videoMetadataBytes, videoStorageAssets] as const
}
