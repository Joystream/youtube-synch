import Keyring from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'
import { mnemonicGenerate, cryptoWaitReady } from '@polkadot/util-crypto'
import { AccountId } from '@polkadot/types/interfaces'
import { JOYSTREAM_ADDRESS_PREFIX } from '@joystream/types'
import { getConfig } from '@youtube-sync/domain'

export type Account = {
  address: string
  secret: string
}

export class AccountsUtil {
  private keyring: Keyring
  constructor() {
    cryptoWaitReady().then(() => {
      this.keyring = new Keyring({ type: 'sr25519', ss58Format: JOYSTREAM_ADDRESS_PREFIX })
      const seed = getConfig().JOYSTREAM_CHANNEL_COLLABORATOR_ACCOUNT_SEED
      seed && this.keyring.addFromUri(seed)
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

  createAccount(key: string): Account {
    const mnemonic = mnemonicGenerate()
    const secretString = `${mnemonic}//${key}`
    const pair = this.keyring.addFromUri(secretString)
    return { address: pair.address, secret: secretString }
  }

  addKnownAccount(uri: string): AccountId {
    const pair = this.keyring.addFromUri(uri)
    return pair.address as unknown as AccountId
  }
}
