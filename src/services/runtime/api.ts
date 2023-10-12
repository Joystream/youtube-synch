import { createType } from '@joystream/types'
import { Bytes, Option } from '@polkadot//types'
import { ApiPromise, SubmittableResult, WsProvider } from '@polkadot/api'
import { AugmentedEvent, SubmittableExtrinsic } from '@polkadot/api/types'
import { KeyringPair } from '@polkadot/keyring/types'
import { Balance } from '@polkadot/types/interfaces'
import { DispatchError } from '@polkadot/types/interfaces/system'
import { PalletContentStorageAssetsRecord, SpRuntimeDispatchError } from '@polkadot/types/lookup'
import type { ISubmittableResult } from '@polkadot/types/types'
import { IEvent } from '@polkadot/types/types'
import BN from 'bn.js'
import { Logger } from 'winston'
import { ExitCodes, RuntimeApiError } from '../../types/errors'
import { LoggingService } from '../logging'

export class ExtrinsicFailedError extends Error {}
export type CreateVideoExtrinsicDefaults = {
  storageBucketsNumWitness: number
  expectedDataObjectStateBloatBond: BN
  expectedVideoStateBloatBond: BN
  perMegabyteFee: BN
}

export class RuntimeApi {
  private api: ApiPromise
  private logger: Logger

  public isDevelopment = false

  // if needed these could become some kind of event emitter
  public onNodeConnectionUpdate?: (connected: boolean) => unknown

  /* Lifecycle */
  constructor(endpoint: string, logging: LoggingService) {
    this.logger = logging.createLogger('RuntimeApi')
    const provider = new WsProvider(endpoint)
    provider.on('connected', () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.logConnectionData(endpoint)
      this.onNodeConnectionUpdate?.(true)
    })
    provider.on('disconnected', () => {
      this.onNodeConnectionUpdate?.(false)
    })
    provider.on('error', () => {
      this.onNodeConnectionUpdate?.(false)
    })

    this.api = new ApiPromise({ provider })
    this.api.isReadyOrError.catch((error) => error)
  }

  private async logConnectionData(endpoint: string) {
    await this.ensureApi()
    const chain = await this.api.rpc.system.chain()
    this.logger.info(`[JoystreamLib] Connected to chain "${chain}" via "${endpoint}"`)
  }

  public get query(): ApiPromise['query'] {
    return this.api.query
  }

  public get tx(): ApiPromise['tx'] {
    return this.api.tx
  }

  public get rpc(): ApiPromise['rpc'] {
    return this.api.rpc
  }

  public get consts(): ApiPromise['consts'] {
    return this.api.consts
  }

  public get derive(): ApiPromise['derive'] {
    return this.api.derive
  }

  public get createType(): ApiPromise['createType'] {
    return this.api.createType.bind(this.api)
  }

  public sudo(tx: SubmittableExtrinsic<'promise'>): SubmittableExtrinsic<'promise'> {
    return this.api.tx.sudo.sudo(tx)
  }

  public async estimateFee(account: KeyringPair, tx: SubmittableExtrinsic<'promise'>): Promise<Balance> {
    const paymentInfo = await tx.paymentInfo(account)
    return paymentInfo.partialFee
  }

  public filterRecords<
    S extends keyof ApiPromise['events'] & string,
    M extends keyof ApiPromise['events'][S] & string,
    EventType = ApiPromise['events'][S][M] extends AugmentedEvent<'promise', infer T> ? IEvent<T> : never
  >(result: SubmittableResult, section: S, method: M): EventType[] {
    return result.filterRecords(section, method).map((record) => record.event as unknown as EventType)
  }

  public getEvents<
    S extends keyof ApiPromise['events'] & string,
    M extends keyof ApiPromise['events'][S] & string,
    EventType = ApiPromise['events'][S][M] extends AugmentedEvent<'promise', infer T> ? IEvent<T> : never
  >(result: SubmittableResult, section: S, method: M): EventType[] {
    const event = this.filterRecords(result, section, method)
    if (!event.length) {
      throw new Error(`Cannot find expected ${section}.${method} events in result: ${result.toHuman()}`)
    }
    return event as unknown as EventType[]
  }

  private formatDispatchError(err: DispatchError | SpRuntimeDispatchError): string {
    try {
      const { name, docs } = this.api.registry.findMetaError(err.asModule)
      return `${name} (${docs.join(', ')})`
    } catch (e) {
      return err.toString()
    }
  }

  sendExtrinsic(keyPair: KeyringPair, tx: SubmittableExtrinsic<'promise'>): Promise<SubmittableResult> {
    return new Promise((resolve, reject) => {
      let unsubscribe: () => void
      tx.signAndSend(keyPair, {}, (result) => {
        if (!result || !result.status) {
          return
        }

        if (result.status.isInBlock || result.status.isFinalized) {
          unsubscribe()
          result.events
            .filter(({ event }) => event.section === 'system')
            .forEach(({ event }) => {
              if (event.method === 'ExtrinsicFailed') {
                const dispatchError = event.data[0] as DispatchError
                reject(
                  new ExtrinsicFailedError(`Extrinsic execution error: ${this.formatDispatchError(dispatchError)}`)
                )
              } else if (event.method === 'ExtrinsicSuccess') {
                resolve(result)
              }
            })
        } else if (result.isError) {
          reject(new ExtrinsicFailedError('Extrinsic execution error!'))
        }
      })
        .then((unsubFunc) => (unsubscribe = unsubFunc))
        .catch((e) =>
          reject(new ExtrinsicFailedError(`Cannot send the extrinsic: ${e.message ? e.message : JSON.stringify(e)}`))
        )
    })
  }

  async ensureApi() {
    try {
      await this.api.isReady
    } catch (err) {
      this.logger.error('Failed to initialize Polkadot API', { err })
      throw new RuntimeApiError(ExitCodes.RuntimeApi.API_NOT_CONNECTED, 'Failed to initialize Polkadot API')
    }
  }

  async createVideoExtrinsicDefaults(channelId: number): Promise<CreateVideoExtrinsicDefaults> {
    const channelBag = await this.api.query.storage.bags(
      createType('PalletStorageBagIdType', { Dynamic: { Channel: channelId } })
    )
    return {
      storageBucketsNumWitness: channelBag.storedBy.size,
      expectedDataObjectStateBloatBond: await this.api.query.storage.dataObjectStateBloatBondValue(),
      expectedVideoStateBloatBond: await this.api.query.content.videoStateBloatBondValue(),
      perMegabyteFee: await this.api.query.storage.dataObjectPerMegabyteFee(),
    }
  }

  prepareCreateVideoTx(
    memberId: string,
    channelId: number,
    extrinsicDefaults: CreateVideoExtrinsicDefaults,
    meta: Bytes | undefined,
    assets: Option<PalletContentStorageAssetsRecord>
  ): SubmittableExtrinsic<'promise', ISubmittableResult> {
    const creationParameters = createType('PalletContentVideoCreationParametersRecord', {
      meta,
      assets,
      storageBucketsNumWitness: extrinsicDefaults.storageBucketsNumWitness,
      expectedDataObjectStateBloatBond: extrinsicDefaults.expectedDataObjectStateBloatBond,
      expectedVideoStateBloatBond: extrinsicDefaults.expectedVideoStateBloatBond,
      autoIssueNft: null,
    })

    const tx = this.api.tx.content.createVideo({ Member: memberId }, channelId, creationParameters)
    return tx
  }
}
