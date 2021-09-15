import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { ApiPromise } from "@polkadot/api";

import completeDBScan from "../util/db/completeDBScan";
import findUsersWithFreeSpace from "../util/general/findUsersWithFreeSpace";

import { User, DBUser } from "../types";

const checkUsersForAvailableStorage = async (
  joyApi: ApiPromise,
  dynamoDB: DocumentClient,
  dynamoDBTableName: string
) => {
  let allUsers: User[] = [];
  let usersWithFreeSpace: User[] = [];

  try {
    const dbItems = (await completeDBScan(dynamoDB, dynamoDBTableName)) as DBUser[];
    allUsers = dbItems.filter(item => item.SK === "profile");
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
