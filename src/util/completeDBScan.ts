import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

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
