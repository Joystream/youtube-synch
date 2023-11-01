import { generateAppActionCommitment } from '@joystream/js/utils'
import { AppAction } from '@joystream/metadata-protobuf'
import { Option } from '@polkadot/types/'
import { PalletContentStorageAssetsRecord } from '@polkadot/types/lookup'
import { ed25519Sign } from '@polkadot/util-crypto'
import { Keypair } from '@polkadot/util-crypto/types'
import { createHash } from 'blake3'
import { encode as encodeHash, toB58String } from 'multihashes'
import { Readable } from 'stream'

export type FileHash = { hash: string; size: number }

export async function computeFileHashAndSize(file: Readable): Promise<FileHash> {
  const hash = createHash()

  let finalSize = 0
  for await (const chunk of file) {
    hash.update(chunk)
    finalSize += chunk.length
  }

  const digest = hash.digest()
  const computedHash = toB58String(encodeHash(digest, 'blake3'))
  return { hash: computedHash, size: finalSize }
}

export interface AppActionSignatureInput {
  nonce: number
  creatorId: string
  assets: Option<PalletContentStorageAssetsRecord>
  rawAction: Uint8Array
  appActionMetadata: Uint8Array
}

export async function signAppActionCommitmentForVideo(
  { appActionMetadata, rawAction, assets, creatorId, nonce }: AppActionSignatureInput,
  keypair: Keypair
) {
  const appCommitment = generateAppActionCommitment(
    nonce,
    creatorId,
    AppAction.ActionType.CREATE_VIDEO,
    AppAction.CreatorType.CHANNEL,
    assets.toU8a(),
    rawAction,
    appActionMetadata
  )
  return ed25519Sign(appCommitment, keypair)
}
