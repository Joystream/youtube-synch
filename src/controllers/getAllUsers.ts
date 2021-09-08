import { NextFunction, Request, Response } from "express";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

import completeDBScan from "../util/completeDBScan";

import HTTPException from "../exceptions/HTTPException";

const getAllUsers = (dynamoDB: DocumentClient, dynamoDBTableName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let items: DocumentClient.ItemList = [];

    try {
      items = await completeDBScan(dynamoDB, dynamoDBTableName);
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
