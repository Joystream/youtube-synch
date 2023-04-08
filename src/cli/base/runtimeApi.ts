import { EventMethod, EventSection, EventType } from '@joystream/cli/lib/Types'
import { createType, JOYSTREAM_ADDRESS_PREFIX } from '@joystream/types'
import { MemberId } from '@joystream/types/primitives'
import { CLIError } from '@oclif/errors'
import { Keyring, SubmittableResult } from '@polkadot/api'
import { SubmittableExtrinsic } from '@polkadot/api/types'
import { KeyringPair } from '@polkadot/keyring/types'
import { formatBalance } from '@polkadot/util'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { BN } from 'bn.js'
import chalk from 'chalk'
import { randomBytes } from 'crypto'
import { ExtrinsicFailedError, RuntimeApi } from '../../services/runtime/api'
import DefaultCommandBase from './default'
import ExitCodes from './ExitCodes'

/**
 * Abstract base class for commands that require access to the Joystream Runtime API.
 */
export default abstract class RuntimeApiCommandBase extends DefaultCommandBase {
  protected api!: RuntimeApi
  private keyring: Keyring
  private treasuryAccount: string

  async init(): Promise<void> {
    await super.init()
    await cryptoWaitReady()
    this.api = new RuntimeApi(this.appConfig.endpoints.joystreamNodeWs, this.logging)
    this.keyring = new Keyring({ type: 'sr25519', ss58Format: JOYSTREAM_ADDRESS_PREFIX })
    this.treasuryAccount = this.keyring.addFromUri('//Alice').address
    await this.api.ensureApi()
  }

  async prepareDevAccount(suriPath: string) {
    // (Advanced, development-only) add with an implied dev seed and hard derivation
    const uri = `//Alice//${suriPath}`
    const pair = this.keyring.createFromUri(uri)

    const tx = this.api.tx.balances.transfer(pair.address, new BN(1_000_000_000_000))
    await this.sendAndFollowTx(this.keyring.getPair(this.treasuryAccount), tx, false)
    return pair
  }

  async buyMembership(account: KeyringPair): Promise<MemberId> {
    // Buy a new membership
    const membershipParams = createType(
      'PalletMembershipBuyMembershipParameters',
      // The second parameter is automatically typesafe!
      {
        handle: randomBytes(4).toString('hex'),
        rootAccount: account.address,
        controllerAccount: account.address,
        referrerId: null,
        metadata: '0x',
      }
    )

    const tx = this.api.tx.members.buyMembership(membershipParams) // Api interface is automatically decorated!

    const result = await this.sendAndFollowTx(account, tx, false)

    const memberId: MemberId = this.getEvent(result, 'members', 'MembershipBought').data[0]
    return memberId
  }

  async sendAndFollowTx(
    account: KeyringPair,
    tx: SubmittableExtrinsic<'promise'>,
    confirm = true
  ): Promise<SubmittableResult> {
    // Calculate fee and ask for confirmation
    const fee = await this.api.estimateFee(account, tx)

    if (confirm) {
      await this.requireConfirmation(
        `Tx fee of ${chalk.cyan(formatBalance(fee))} will be deduced from you account, do you confirm the transfer?`
      )
    }

    try {
      const res = await this.api.sendExtrinsic(account, tx)
      return res
    } catch (e) {
      if (e instanceof ExtrinsicFailedError) {
        throw new CLIError(`Extrinsic failed! ${e.message}`, { exit: ExitCodes.RuntimeApiError })
      }
      throw e
    }
  }

  public findEvent<S extends EventSection, M extends EventMethod<S>, E = EventType<S, M>>(
    result: SubmittableResult,
    section: S,
    method: M
  ): E | undefined {
    return result.findRecord(section, method)?.event as E | undefined
  }

  public getEvent<S extends EventSection, M extends EventMethod<S>, E = EventType<S, M>>(
    result: SubmittableResult,
    section: S,
    method: M
  ): E {
    const event = this.findEvent<S, M, E>(result, section, method)
    if (!event) {
      throw new Error(`Event ${section}.${method} not found in tx result: ${JSON.stringify(result.toHuman())}`)
    }
    return event
  }
}
