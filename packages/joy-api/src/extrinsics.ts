import { ApiPromise as PolkadotApi } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { BTreeSet, Option, GenericAccountId as RuntimeAccountId } from '@polkadot/types'

import { ConsoleLogger } from './logger'

import { JoystreamLibError } from './errors'
import {
  extractChannelResultAssetsIds,
  extractVideoResultAssetsIds,
  getInputDataObjectsIds,
  sendExtrinsicAndParseEvents,
} from './helpers'
import { parseChannelExtrinsicInput, parseVideoExtrinsicInput } from './metadata'
import {
  ChannelExtrinsicResult,
  ChannelInputAssets,
  ChannelInputMetadata,
  GetEventDataFn,
  SendExtrinsicResult,
  VideoExtrinsicResult,
  VideoInputAssets,
  VideoInputMetadata,
} from './types'
import { DomainError, Result } from '@youtube-sync/domain'
import { KeyringPair } from '@polkadot/keyring/types'
import { InstancePublicPorts } from '@pulumi/aws/lightsail'
import { createType } from '@joystream/types'
import { ChannelId, MemberId } from '@joystream/types/primitives'

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

  async createChannel(
    accountId: KeyringPair,
    memberId: MemberId,
    inputMetadata: ChannelInputMetadata,
    inputAssets: ChannelInputAssets
  ): Promise<Result<ChannelExtrinsicResult, DomainError>> {
    await this.ensureApi()
    const [channelMetadata, channelAssets] = await parseChannelExtrinsicInput(this.api, inputMetadata, inputAssets)
    const creationParameters = createType('PalletContentChannelCreationParametersRecord', {
      meta: channelMetadata,
      assets: channelAssets,
      collaborators: [],
      storageBuckets: [],
      distributionBuckets: [],
      expectedChannelStateBloatBond: 0,
      expectedDataObjectStateBloatBond: 0,
    })

    const tx = this.api.tx.content.createChannel(
      {
        Member: memberId,
      },
      creationParameters
    )
    const { block, getEventData } = await this.sendExtrinsic(accountId, tx)

    const channelId = getEventData('content', 'ChannelCreated')[0]

    return Result.Success({
      channelId,
      block,
      assetsIds: extractChannelResultAssetsIds(inputAssets, getEventData),
    })
  }

  async createVideo(
    accountId: KeyringPair,
    memberId: MemberId,
    channelId: ChannelId,
    inputMetadata: VideoInputMetadata,
    inputAssets: VideoInputAssets
  ): Promise<Result<VideoExtrinsicResult, DomainError>> {
    await this.ensureApi()
    const [videoMetadata, videoAssets] = await parseVideoExtrinsicInput(this.api, inputMetadata, inputAssets)
    const creationParameters = createType('PalletContentVideoCreationParametersRecord', {
      meta: videoMetadata,
      assets: videoAssets,
      expectedDataObjectStateBloatBond: 0,
      expectedVideoStateBloatBond: 0,
      autoIssueNft: null,
    })

    const tx = this.api.tx.content.createVideo({ Member: memberId }, channelId, creationParameters)
    const { block, getEventData } = await this.sendExtrinsic(accountId, tx)

    const videoId = getEventData('content', 'VideoCreated')[2]

    return Result.Success({
      videoId,
      block,
      assetsIds: extractVideoResultAssetsIds(inputAssets, getEventData),
    })
  }
}
