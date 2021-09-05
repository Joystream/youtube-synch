import { NextFunction, Request, Response } from "express";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

import { HTTPException } from "../exceptions/HTTPException";

const getAllUsers = (dynamoDB: DocumentClient, dynamoDBTableName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let items: AWS.DynamoDB.DocumentClient.ItemList = [];

    // TODO:
    // Scanning data beyond 1MB requires more functionality. To be implemented as a utility function.
    try {
      const { Items } = await dynamoDB.scan({ TableName: dynamoDBTableName }).promise();
      items = Items ?? [];
    } catch (error) {
      return next(new HTTPException(500, "Error while retrieving users from the database", error));
    }

    res.status(200);
    res.send({
      data: items
    });
  };
};

export default getAllUsers;
