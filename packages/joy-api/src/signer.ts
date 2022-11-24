import Keyring from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'
import { DomainError, Result } from '@youtube-sync/domain'
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto'
import { AccountId } from '@polkadot/types/interfaces'
import { JOYSTREAM_ADDRESS_PREFIX } from '@joystream/types'

export type Account = {
  address: string
  secret: string
}
export class AccountsUtil {
  private keyring: Keyring
  constructor() {
    cryptoWaitReady().then(() => {
      this.keyring = new Keyring({ type: 'sr25519', ss58Format: JOYSTREAM_ADDRESS_PREFIX })
      process.env.JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT_SEED
        ? this.keyring.addFromUri(process.env.JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT_SEED)
        : console.log('JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT_SEED not set')
    })
  }

  getPair(accountId: string): KeyringPair {
    const pair = this.keyring.getPairs().find((p) => p.address == accountId)
    if (!pair) {
      throw new Error(`Account ${accountId} not found`)
    }
    return pair
  }

  getOrAddPair(secret: string, address?: string): KeyringPair {
    let pair = this.keyring.getPairs().find((p) => p.address == address)
    if (!pair) {
      pair = this.keyring.addFromUri(secret)
    }
    return pair
  }

  createAccount(key: string): Result<Account, DomainError> {
    const mnemonic = mnemonicGenerate()
    const secretString = `${mnemonic}//${key}`
    const pair = this.keyring.addFromUri(secretString)
    return Result.Success({ address: pair.address, secret: secretString })
  }

  addKnownAccount(uri: string): Result<AccountId, DomainError> {
    const pair = this.keyring.addFromUri(uri)
    return Result.Success(pair.address as unknown as AccountId)
  }
}
