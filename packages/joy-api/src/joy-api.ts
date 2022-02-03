import {mnemonicGenerate} from '@polkadot/util-crypto'
import {User, Channel} from '@youtube-sync/domain'
import {Keyring} from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'
import { Membership, Mnemonic } from './types'
import { map, Result } from './results'
import { Faucet, RegistrationError } from './faucet'


export class JoystreamClient{
  constructor(private faucet: Faucet) {
  }
  async registerUser(user: User) : Promise<Result<Membership, RegistrationError>>{
    const [account, mnemonic] = createPolkadotAccount(user.googleId, user.youtubeUsername)
    const membershipResponse = await this.faucet.register(user.youtubeUsername, account.address);
    return map(membershipResponse, member => {
      return {accountAddress: account.address, accountMnemonic: mnemonic, memberId: member.memberId}
    })
  }
}

// creates polkadot account
const createPolkadotAccount = (googleId: string, youtubeUsername?: string) : [KeyringPair, Mnemonic]  => {
  const mnemonic = mnemonicGenerate();
  const keyring = new Keyring({type:'sr25519'});
  const newPair = keyring.addFromUri(mnemonic, {name: youtubeUsername || googleId });
  return [newPair, mnemonic]
}

