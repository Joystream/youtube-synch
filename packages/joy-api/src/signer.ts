import Keyring from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'
import { DomainError, Result } from '@youtube-sync/domain'
import { mnemonicGenerate } from '@polkadot/util-crypto'
import { AccountId } from '@polkadot/types/interfaces'
import { JOYSTREAM_ADDRESS_PREFIX } from '@joystream/types'

export type Account = {
  address: string
  secret: string
}
export class AccountsUtil {
  private keyring: Keyring
  constructor() {
    this.keyring = new Keyring({ type: 'sr25519', ss58Format: JOYSTREAM_ADDRESS_PREFIX })
  }

  getPair(accountId: string): Result<KeyringPair, DomainError> {
    const pair = this.keyring.getPairs().find((p) => p.address == accountId)
    return pair ? Result.Success(pair) : Result.Error(new DomainError('Pair not found'))
  }

  getOrAddPair(address: string, secret: string): Result<KeyringPair, DomainError> {
    let pair = this.keyring.getPairs().find((p) => p.address == address)
    if (!pair) pair = this.keyring.addFromUri(secret)
    return Result.Success(pair)
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
