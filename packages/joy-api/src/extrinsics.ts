import { ApiPromise as PolkadotApi } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'

import { Logger } from './logger'

import { IVideoMetadata } from '@joystream/metadata-protobuf'
import { createType } from '@joystream/types'
import { ChannelId, MemberId } from '@joystream/types/primitives'
import { KeyringPair } from '@polkadot/keyring/types'
import { JoystreamLibError } from './errors'
import { parseVideoExtrinsicInput, sendExtrinsicAndParseEvents } from './helpers'
import { GetEventDataFn, SendExtrinsicResult, VideoExtrinsicResult, VideoInputAssets } from './types'

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
      if ((error as Error).message === 'Cancelled') {
        throw new JoystreamLibError({ name: 'SignCancelledError' })
      }
      throw error
    }
  }

  private async ensureApi() {
    try {
      await this.api.isReady
    } catch (e) {
      Logger.error('Failed to initialize Polkadot API', e)
      throw new JoystreamLibError({ name: 'ApiNotConnectedError' })
    }
  }

  async createVideo(
    accountId: KeyringPair,
    memberId: MemberId,
    channelId: ChannelId,
    videoMetadata: IVideoMetadata,
    inputAssets: VideoInputAssets
  ): Promise<VideoExtrinsicResult> {
    await this.ensureApi()

    const channelBag = await this.api.query.storage.bags(
      createType('PalletStorageBagIdType', { Dynamic: { Channel: channelId } })
    )

    const [meta, assets] = await parseVideoExtrinsicInput(this.api, videoMetadata, inputAssets)
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

    if (assetsIds.size !== (assets?.objectCreationList.length || 0)) {
      throw new Error('Unexpected number of video assets in VideoCreated event!')
    }

    return {
      videoId,
      block,
      assetsIds: [...assetsIds],
    }
  }
}
