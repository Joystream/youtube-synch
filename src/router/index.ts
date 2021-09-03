// library imports
import { Router } from "express";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { youtube_v3 } from 'googleapis/build/src/apis/youtube/v3';

// controllers
import getAllUsers from "../controllers/getAllUsers";
import createUser from "../controllers/createUser";

const routerWrapper = (dynamoDB: DocumentClient, dynamoDBTableName: string, youtubeApi: youtube_v3.Youtube) => {
  const router = Router();

  router.get("/users", getAllUsers(dynamoDB, dynamoDBTableName));

  router.post("/user", createUser(dynamoDB, dynamoDBTableName, youtubeApi));

  router.get("*", (_, res) => res.sendStatus(404));

  return router;
};

export default routerWrapper;
