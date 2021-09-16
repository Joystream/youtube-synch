import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

// TODO:
// The usage of this function should be removed as scans are to be avoided when
// working with dynamo. A better solution needs to be found. Works fine with less data.
const completeDBScan = async (dynamoDB: DocumentClient, dynamoDBTableName: string) => {
  let result = [];
  let nextPageKey: DocumentClient.Key | undefined;

  while (true) {
    const { Items, LastEvaluatedKey } = await dynamoDB
      .scan({ TableName: dynamoDBTableName, ExclusiveStartKey: nextPageKey })
      .promise();

    if (Items) {
      result.push(...Items);
    }

    if (!LastEvaluatedKey) {
      break;
    }

    nextPageKey = LastEvaluatedKey;
  }

  return result;
};

export default completeDBScan;
