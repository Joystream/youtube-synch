import { Readable } from 'stream'
import { createHash } from 'blake3'
import { encode as encodeHash, toB58String } from 'multihashes'

type FileMetadata = { size: number; hash: string }

export async function computeFileHashAndSize(file: Readable): Promise<FileMetadata> {
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
