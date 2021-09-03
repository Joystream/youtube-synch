import { Request, Response } from 'express';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

const getAllUsers = (dynamoDB: DocumentClient, dynamoDBTableName: string) => {
  return async (req: Request, res: Response) => {
    let items: AWS.DynamoDB.DocumentClient.ItemList = [];

    // TODO:
    // Scanning data beyond 1MB requires more functionality. To be implemented as a utility function.

    try {
      const { Items } = await dynamoDB
        .scan({ TableName: dynamoDBTableName })
        .promise();
      items = Items ?? [];
    } catch (error) {
      // TODO:
      // Create a utility function for dealing with errors.

      res.status(500);
      res.send(error);
      return;
    }

    res.status(200);
    res.send({
      data: items,
    });
  }
};

export default getAllUsers;