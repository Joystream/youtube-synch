import { DomainError, Result } from '@youtube-sync/domain'
import { MemberId } from './types'
import axios from 'axios'
import { hexToNumber } from '@polkadot/util'

export type RegisteredMember = {
  memberId: MemberId
}
export class RegistrationError extends DomainError {}
export type RegistrationResponse = RegisteredMember | RegistrationError

export class Faucet {
  constructor(private faucetNodeUri: string) {}
  async register(
    handle: string,
    address: string
  ): Promise<Result<RegisteredMember, RegistrationError>> {
    try {
      const response = await axios.post<RegisteredMember | RegistrationError>(
        `${this.faucetNodeUri}/register`,
        { account: address, handle }
      )
      if (response.status === 200) {
        const member = response.data as RegisteredMember
        return Result.Success<RegisteredMember, RegistrationError>({
          memberId: hexToNumber(member.memberId).toString(),
        })
      }
      return Result.Error(response.data as RegistrationError)
    } catch (err) {
      return Result.Error(new RegistrationError(err.message))
    }
  }
}
