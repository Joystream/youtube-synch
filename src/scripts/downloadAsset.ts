import axios, { AxiosRequestConfig } from 'axios'
import assert from 'assert'
import { argv } from 'process'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { Readable, promises as streamPromise } from 'stream'
import path from 'path'
import { createWriteStream } from 'fs'

export const SCRIPT_PATH = __filename

function validateArgs() {
  try {
    const assetUrl = new URL(argv[2])
    assert(assetUrl.protocol === 'http:' || assetUrl.protocol === 'https:', `Invalid assetUrl protocol: ${assetUrl.protocol}`)

    const destPath = argv[3]
    if (!path.isAbsolute(destPath) || !path.extname(destPath)) {
      throw new Error('destPath must be an absolute path to a file!')
    }

    let proxyUrl: URL | undefined = undefined
    if (argv[4]) {
      proxyUrl = new URL(argv[4])
      assert(proxyUrl.protocol === 'socks5:', `Invalid proxyUrl protocol: ${proxyUrl.protocol}`)
    }

    return { assetUrl: assetUrl.toString(), destPath, proxyUrl: proxyUrl?.toString() }
  } catch (e: any) {
    throw new Error(`Invalid arguments: ${e.toString()}`)
  }
}

async function main() {
  const { assetUrl, destPath, proxyUrl } = validateArgs()
  const reqConfig: AxiosRequestConfig<any> = { responseType: 'stream' }
  if (proxyUrl) {
    const proxyAgent = new SocksProxyAgent(proxyUrl)
    reqConfig.httpAgent = proxyAgent
    reqConfig.httpsAgent = proxyAgent
  }
  const response = await axios.get<Readable>(assetUrl, reqConfig)
  const writeStream = createWriteStream(destPath)
  await streamPromise.pipeline([response.data, writeStream])
}

// Execute script only if the file was executed directly (not imported as module)
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(e => {
      console.error(e)
      process.exit(1)
    })
}