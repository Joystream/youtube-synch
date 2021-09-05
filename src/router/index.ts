// library imports
import { Router } from "express";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";

// controllers
import getAllUsers from "../controllers/getAllUsers";
import createUser from "../controllers/createUser";
import addVideoToUser from "../controllers/addVideoToUser";

const routerWrapper = (
  dynamoDB: DocumentClient,
  dynamoDBTableName: string,
  youtubeApi: youtube_v3.Youtube
) => {
  const router = Router();

  router.get("/users", getAllUsers(dynamoDB, dynamoDBTableName));

  router.post("/user", createUser(dynamoDB, dynamoDBTableName, youtubeApi));

  // The hub will make a request to this endpoint and we need to echo the random hub-generated
  // string (hub.challenge) to confirm that we did indeed make the subscription request.
  // Source: http://pubsubhubbub.github.io/PubSubHubbub/pubsubhubbub-core-0.4.html#verifysub
  router.get("/youtube-api-subscription", (req, res) => res.send(req.query["hub.challenge"]));

  router.post("/youtube-api-subscription", addVideoToUser(dynamoDB, dynamoDBTableName, youtubeApi));

  router.get("*", (_, res) => res.sendStatus(404));

  return router;
};

export default routerWrapper;
