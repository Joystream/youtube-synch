import { JOYSTREAM_ADDRESS_PREFIX } from '@joystream/types'
import Keyring from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'
import { AccountId } from '@polkadot/types/interfaces'
import { u8aToHex } from '@polkadot/util'
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto'
import { ReadonlyConfig } from '../../types'

export type Account = {
  address: string
  secret: string
}

export class AccountsUtil {
  private keyring: Keyring
  private config: ReadonlyConfig['joystream']

  constructor(config: ReadonlyConfig['joystream']) {
    this.config = config
    cryptoWaitReady().then(() => {
      this.initKeyring()
    })
  }

  private initKeyring(): void {
    this.keyring = new Keyring({ type: 'sr25519', ss58Format: JOYSTREAM_ADDRESS_PREFIX })
    this.config.app.account?.forEach((keyData) => {
      if ('suri' in keyData) {
        this.keyring.addFromUri(keyData.suri, undefined, keyData.type)
      }
      if ('mnemonic' in keyData) {
        this.keyring.addFromMnemonic(keyData.mnemonic, { name: 'app-auth-key' }, 'ed25519')
      }
    })

    this.config.channelCollaborator.account?.forEach((keyData) => {
      if ('suri' in keyData) {
        this.keyring.addFromUri(keyData.suri)
      }
      if ('mnemonic' in keyData) {
        this.keyring.addFromMnemonic(keyData.mnemonic)
      }
    })
  }

  getPair(addressOrPublicKey: string): KeyringPair {
    const pair = this.keyring
      .getPairs()
      .find((p) => p.address == addressOrPublicKey || u8aToHex(p.publicKey) == addressOrPublicKey)
    if (!pair) {
      throw new Error(
        `Account ${addressOrPublicKey} not found. Following accounts are available in the keyring: ${this.keyring
          .getPairs()
          .map((p) =>
            JSON.stringify({
              name: p.meta.name,
              address: p.address,
              publicKey: u8aToHex(p.publicKey),
            })
          )}`
      )
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
