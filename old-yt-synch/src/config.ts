import AWS from "aws-sdk";
import { google } from "googleapis";
import * as dotenv from "dotenv";

dotenv.config();

if (process.env.NODE_ENV === "development") {
  AWS.config.credentials = new AWS.SharedIniFileCredentials({
    profile: process.env.AWS_PROFILE_NAME
  });
}

AWS.config.update({
  region: process.env.AWS_REGION
});

const port = process.env.PORT || "3000";
const dynamoDBTableName = process.env.AWS_DYNAMODB_TABLE_NAME ?? "";
const youtubeApiKey = process.env.YOUTUBE_API_KEY ?? "";

const youtubeApi = google.youtube({
  version: "v3",
  auth: youtubeApiKey
});
const dynamoDB = new AWS.DynamoDB.DocumentClient();

export { dynamoDB, port, dynamoDBTableName, youtubeApi };
