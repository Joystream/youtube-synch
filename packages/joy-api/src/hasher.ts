import { Readable } from "stream"
import { createHash} from 'blake3'
import { encode as encodeHash, toB58String } from 'multihashes'
import {finished} from 'stream/promises'
type FileMetadata = {size: number, hash: string}
export const computeFileHashAndSize = async (file: Readable): Promise<FileMetadata> => {
    const hash = createHash();
    let finalSize = 0;
    let digest;
    await finished(file
        .on('data', chunk => finalSize += chunk.length)
        .pipe(hash)
        .on('data', hash => digest = hash)
        .resume())
    
    const computedHash = toB58String(encodeHash(digest, 'blake3'));
    return {hash: computedHash, size: finalSize}
}