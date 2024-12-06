import assert from 'assert'
import { LoggingService }  from './services/logging'
import { YoutubeClient } from './services/youtube/api'
import { ConfigParserService } from './utils/configParser'
import path from 'path'

const configParser = new ConfigParserService(path.join(__dirname, '../config.yml'))
const config = configParser.parse()
const logging = LoggingService.withCLIConfig()
const youtubeClient = new YoutubeClient(config, logging)

async function main() {
  const { downloadsDir } = config.sync
  assert(downloadsDir)
  const videos = process.argv.slice(2)
  await Promise.all(videos.map(async (v) => {
    const checkResp = await youtubeClient.checkVideo(v)
    if (typeof checkResp === 'string') {
      console.log((checkResp as any).slice(0, 200))
    }
    assert(typeof checkResp === 'object', `Check: Expected object, got ${typeof checkResp}`)
    assert(checkResp.format, 'Check: Missing format')
    assert(checkResp.filesize_approx, 'Check: Missing filesize_approx')
    const downloadResp = await youtubeClient.downloadVideo(v, downloadsDir)
    assert(typeof downloadResp === 'object', `Download: Expected object, got ${typeof downloadResp}`)
    assert(checkResp.ext, 'Download: Missing ext')
    assert(checkResp.format, 'Download: Missing format')
  }))
  console.error("All videos successfully downloaded!")
}

main().catch(e => console.error(e))