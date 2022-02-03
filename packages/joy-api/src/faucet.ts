import { Result } from './results';
import { MemberId } from './types';
import axios from 'axios'

export type RegisteredMember = {
  memberId: MemberId;
};
export type RegistrationError = {
  error: string;
};
export type RegistrationResponse = RegisteredMember | RegistrationError;
export class Faucet {
  constructor(private faucetNodeUri: string) {}
  async register(
    handle: string,
    address: string
  ): Promise<Result<RegisteredMember, RegistrationError>> {
    const response = await axios.post<RegisteredMember | RegistrationError>(
      this.faucetNodeUri,
      { account: address, handle }
    );
    if (response.status === 200)
      return Result.Success(response.data as RegisteredMember);
    return Result.Error(response.data as RegistrationError);
  }
}
