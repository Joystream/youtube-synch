import { ApiPromise } from "@polkadot/api";
import { StorageObjectOwner } from "@joystream/types/storage";
import { Voucher } from "@joystream/types/augment";

import { User } from "../types";

const calculateUsersRemainingStorageSpace = async (joyApi: ApiPromise, user: User) => {
  const storageObjectOwner = new StorageObjectOwner(joyApi.registry, {
    Channel: user.joystreamChannelId
  });
  const userStorageVoucher = (await joyApi.query.dataDirectory.vouchers(
    storageObjectOwner
  )) as Voucher;
  const remainingSpaceInBytes =
    userStorageVoucher.size_limit.toNumber() - userStorageVoucher.size_used.toNumber();

  return remainingSpaceInBytes;
};

export default calculateUsersRemainingStorageSpace;
