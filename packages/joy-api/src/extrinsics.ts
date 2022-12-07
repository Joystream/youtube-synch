import { ApiPromise as PolkadotApi } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'

import { ConsoleLogger } from './logger'

import { createType } from '@joystream/types'
import { ChannelId, MemberId } from '@joystream/types/primitives'
import { KeyringPair } from '@polkadot/keyring/types'
import { JoystreamLibError } from './errors'
import { extractVideoResultAssetsIds, sendExtrinsicAndParseEvents } from './helpers'
import { parseVideoExtrinsicInput } from './metadata'
import {
  GetEventDataFn,
  SendExtrinsicResult,
  VideoExtrinsicResult,
  VideoInputAssets,
  VideoInputMetadata,
} from './types'

export class JoystreamLibExtrinsics {
  readonly api: PolkadotApi

  constructor(api: PolkadotApi) {
    this.api = api
  }

  private async sendExtrinsic(account: KeyringPair, tx: SubmittableExtrinsic<'promise'>): Promise<SendExtrinsicResult> {
    try {
      const { events, blockHash } = await sendExtrinsicAndParseEvents(tx, account, this.api.registry)

      const blockHeader = await this.api.rpc.chain.getHeader(blockHash)

      const getEventData: GetEventDataFn = (section, method) => {
        const event = events.find((event) => event.section === section && event.method === method)

        if (!event) {
          throw new JoystreamLibError({
            name: 'MissingRequiredEventError',
            message: `Required event ${section}.${String(method)} not found in extrinsic`,
          })
        }

        return event.data as ReturnType<GetEventDataFn>
      }

      return { events, block: blockHeader.number.toNumber(), getEventData }
    } catch (error) {
      if (error?.message === 'Cancelled') {
        throw new JoystreamLibError({ name: 'SignCancelledError' })
      }
      throw error
    }
  }

  private async ensureApi() {
    try {
      await this.api.isReady
    } catch (e) {
      ConsoleLogger.error('Failed to initialize Polkadot API', e)
      throw new JoystreamLibError({ name: 'ApiNotConnectedError' })
    }
  }

  async createVideo(
    accountId: KeyringPair,
    memberId: MemberId,
    channelId: ChannelId,
    inputMetadata: VideoInputMetadata,
    inputAssets: VideoInputAssets
  ): Promise<VideoExtrinsicResult> {
    await this.ensureApi()

    const channelBag = await this.api.query.storage.bags(
      createType('PalletStorageBagIdType', { Dynamic: { Channel: channelId } })
    )

    const [meta, assets] = await parseVideoExtrinsicInput(this.api, inputMetadata, inputAssets)
    const creationParameters = createType('PalletContentVideoCreationParametersRecord', {
      meta,
      assets,
      storageBucketsNumWitness: channelBag.storedBy.size,
      expectedDataObjectStateBloatBond: await this.api.query.storage.dataObjectStateBloatBondValue(),
      expectedVideoStateBloatBond: await this.api.query.content.videoStateBloatBondValue(),
      autoIssueNft: null,
    })

    const tx = this.api.tx.content.createVideo({ Member: memberId }, channelId, creationParameters)
    const { block, getEventData } = await this.sendExtrinsic(accountId, tx)

    const [, , videoId, , assetsIds] = getEventData('content', 'VideoCreated')

    return {
      videoId,
      block,
      assetsIds: [...assetsIds],
    }
  }
}
