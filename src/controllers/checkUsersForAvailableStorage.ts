import { StorageObjectOwner } from "@joystream/types/storage";
import { Voucher } from "@joystream/types/augment";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { ApiPromise } from "@polkadot/api";

import completeDBScan from "../util/completeDBScan";

import { User } from "../types";

const checkUsersForAvailableStorage = async (
  joyApi: ApiPromise,
  dynamoDB: DocumentClient,
  dynamoDBTableName: string
) => {
  let users: User[] = [];

  try {
    users = (await completeDBScan(dynamoDB, dynamoDBTableName)) as User[];
  } catch (e) {
    console.log(e);
  }

  for (let index = 0; index < users.length; index++) {
    const storageObjectOwner = new StorageObjectOwner(joyApi.registry, {
      Channel: users[index].joystreamChannelId
    });
    const userStorageVoucher = (await joyApi.query.dataDirectory.vouchers(
      storageObjectOwner
    )) as Voucher;
    const remainingSpaceInBytes =
      userStorageVoucher.size_limit.toNumber() - userStorageVoucher.size_used.toNumber();

    console.log(
      `User with channelId ${users[index].joystreamChannelId} has ${
        remainingSpaceInBytes / 1_000_000_000
      } GB of remaining space.`
    );
  }

  // TODO:
  // Check if there is enough space to upload the following video.
  // If yes, start synching process. If not, move on.
};

export default checkUsersForAvailableStorage;
