import { Logger } from "winston"
import NodeCache from 'node-cache'
import fs from 'fs' 
import { LoggingService } from "../logging"
import sleep from "sleep-promise"
import AsyncLock from "async-lock"
import { ReadonlyConfig } from "../../types"

export class Socks5ProxyService {
  private readonly logger: Logger
  private proxyByJobIdCache: Map<string, string>
  private faulyProxiesCache: NodeCache
  private asyncLock: AsyncLock
  private _proxychainExec: string | undefined
  private readonly BIND_LOCK_ID = 'proxy_bind'

  constructor(
    private config: NonNullable<ReadonlyConfig['proxy']>,
    logging: LoggingService,
  ) {
    const proxiesNum = this.config.urls.length
    this.proxyByJobIdCache = new Map()
    this.faulyProxiesCache = new NodeCache({
      stdTTL: this.config.exclusionDuration,
      deleteOnExpire: true,
      maxKeys: proxiesNum
    })
    this.asyncLock = new AsyncLock({ maxPending: proxiesNum * 10 })
    this.logger = logging.createLogger('Socks5ProxyService')
    if (this.config.chain) {
      this.initProxychainsConfig(this.config.chain.url, this.config.chain.configPath)
      this._proxychainExec = [
        'proxychains',
        `-f ${this.config.chain.configPath}`
      ].join(' ')
    }
  }

  private initProxychainsConfig(proxyUrl: string, configPath: string) {
    let parsedUrl: URL
    try {
      parsedUrl = new URL(proxyUrl)
    } catch (e: any) {
      throw new Error(`Cannot parse config.proxy.chain.url as URL: ${e.toString()}`)
    }
    fs.writeFileSync(
      configPath,
      [
        'strict_chain',
        'quiet_mode',
        '',
        'tcp_read_time_out 15000',
        'tcp_connect_time_out 8000',
        '',
        '[ProxyList]',
        '',
        `socks5 ${parsedUrl.hostname} ${parsedUrl.port}`
      ].join("\n")
    )
  }

  private get availableProxies(): string[] {
    return this.config.urls.filter((url) => (
      !this.faulyProxiesCache.has(url) && !this.proxyByJobIdCache.has(url)
    ))
  }

  public get proxychainExec(): string | undefined {
    return this._proxychainExec
  }

  private async bindProxy(jobId: string): Promise<string> {
    return this.asyncLock.acquire(this.BIND_LOCK_ID, async () => {
      let [selectedProxy] = this.availableProxies
      while (!selectedProxy) {
        this.logger.debug(`No proxy endpoints available, waiting ${this.config.waitInterval}s...`, { jobId })
        await sleep(this.config.waitInterval * 1_000)
        selectedProxy = this.availableProxies[0]
      }
      this.proxyByJobIdCache.set(jobId, selectedProxy)
      this.logger.debug(`Proxy ${selectedProxy} bound to job`, { jobId })
      return selectedProxy
    })
  }

  public async getProxy(jobId: string): Promise<string> {
    const cachedProxy = this.proxyByJobIdCache.get(jobId)
    if (cachedProxy) {
      return cachedProxy
    }
    const proxyUrl = await this.bindProxy(jobId)
    return proxyUrl
  }

  public unbindProxy(jobId: string): string | undefined {
    const cachedProxy = this.proxyByJobIdCache.get(jobId)
    this.proxyByJobIdCache.delete(jobId)
    if (cachedProxy) {
      this.logger.debug(`Proxy ${cachedProxy} unbound`, { jobId })
    } else {
      this.logger.debug(`No proxy to unbind`, { jobId })
    }
    return cachedProxy
  }

  public reportFaultyProxy(url: string) {
    this.logger.warn(`Faulty proxy reported: ${url}`)
    this.faulyProxiesCache.set(url, true)
  }
}