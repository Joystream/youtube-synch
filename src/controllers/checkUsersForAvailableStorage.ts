import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { ApiPromise } from "@polkadot/api";

import completeDBScan from "../util/completeDBScan";
import findUsersWithFreeSpace from '../util/findUsersWithFreeSpace';

import { User } from "../types";

const checkUsersForAvailableStorage = async (
  joyApi: ApiPromise,
  dynamoDB: DocumentClient,
  dynamoDBTableName: string
) => {
  let allUsers: User[] = [];
  let usersWithFreeSpace: User[] = [];

  try {
    allUsers = (await completeDBScan(dynamoDB, dynamoDBTableName)) as User[];
  } catch (e) {
    console.log(e);
  }

  try {
    usersWithFreeSpace = await findUsersWithFreeSpace(joyApi, allUsers);
  } catch (e) {
    console.log(e);
  }

  // TODO:
  // Start synching process.
};

export default checkUsersForAvailableStorage;
