import { flags } from '@oclif/command'
import fs from 'fs'
import path from 'path'
import DefaultCommandBase from '../base/default'
import { LoggingService } from '../../services/logging'
import { YoutubeClient } from '../../services/youtube/api'
import { Socks5ProxyService } from '../../services/proxy/Socks5ProxyService'
import assert from 'assert'

export default class DownloadVideo extends DefaultCommandBase {
  static description = 'Perform a test video download.'

  static flags = {
    url: flags.string({
        multiple: true,
        description: 'YouTube video url(s) of the video(s) to be downloaded'
    }),
    skipProxy: flags.boolean({
        description: 'Skip proxy even if configured.',
        default: false,
    }),
    ...DefaultCommandBase.flags,
  }

  async run(): Promise<void> {
    const { url: videoUrls, skipProxy } = this.parse(DownloadVideo).flags

    const { downloadsDir } = this.appConfig.sync 
    assert(downloadsDir, "Download dir needs to be specified!")

    const logging = LoggingService.withCLIConfig()
    let proxyConfig = this.appConfig.proxy
    if (skipProxy) {
        proxyConfig = undefined
        this.log('Skipping proxy setup...')
    } else {
        this.log('Using proxy configuration:', proxyConfig)
    }
    const proxyService = proxyConfig ? new Socks5ProxyService(proxyConfig, logging) : undefined
    const youtubeClient = new YoutubeClient(this.appConfig, logging, proxyService)
    for (const videoUrl of videoUrls) {
        const proxy = await proxyService?.getProxy(videoUrl)
        if (proxy) {
            this.log(`Selected proxy: ${proxy}`)
        }
        const checkResp = await youtubeClient.checkVideo(videoUrl, proxy)
        this.log(`Downloading ${videoUrl}...`)
        this.log(`Selected format: ${checkResp.format}`)
        this.log(`Expected size: ${checkResp.filesize_approx}`)
        const downloadResp = await youtubeClient.downloadVideo(videoUrl, downloadsDir, proxy)
        assert(
            fs.existsSync(path.join(downloadsDir, `${downloadResp.id}.${downloadResp.ext}`)),
            'Download error: File not found'
        )
        proxyService?.unbindProxy(downloadResp.id)
    }
    this.log("All videos successfully downloaded!")
  }

  async finally(): Promise<void> {
    /* Do nothing */
  }
}