import loadBlake3 from 'blake3/browser-async'
import { readFileSync } from 'fs'
import { encode as encodeHash, toB58String } from 'multihashes'
import path from 'path'
import { Readable } from 'stream'

type FileMetadata = { size: number; hash: string }

type Blake3 = Awaited<ReturnType<typeof loadBlake3>>
let blake3: Blake3

const getBlake3 = async (): Promise<Blake3> => {
  if (blake3) {
    return blake3
  }

  const module = readFileSync(path.join(__dirname, 'blake3_js_bg.wasm'))
  blake3 = await loadBlake3(module)
  return blake3
}

export async function computeFileHashAndSize(file: Readable): Promise<FileMetadata> {
  const { createHash } = await getBlake3()
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
