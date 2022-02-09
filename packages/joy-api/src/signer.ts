import Keyring from '@polkadot/keyring'
import {KeyringPair} from '@polkadot/keyring/types'
import {DomainError, Result} from '@youtube-sync/domain'
import { mnemonicGenerate } from '@polkadot/util-crypto';
import { AccountId } from '.';

export type Account = {
    address: KeyringPair,
    secret: string
}
export class AccountsUtil {
    private keyring: Keyring
    constructor() {
        this.keyring = new Keyring({type: 'sr25519'})
    }

    getPair(accountId: string) : Result<KeyringPair, DomainError>{
        const pair = this.keyring.getPairs().find(p => p.address == accountId);
        return pair ? Result.Success(pair) : Result.Error(new DomainError('Pair not found'))
    }
    createAccount(key: string) : Result<Account, DomainError>{
        const mnemonic = mnemonicGenerate();
        const secretString = `${mnemonic}//${key}`;
        const pair = this.keyring.addFromUri(secretString);
        return Result.Success({address: pair, secret: secretString});
    }
    addKnownAccount(uri: string): Result<AccountId, DomainError>{
        const pair = this.keyring.addFromUri(uri);
        return Result.Success(pair.address)
    }
}