import { DocumentClient, WriteRequests } from "aws-sdk/clients/dynamodb";

import splitArrayByItem from "../general/splitArrayByItemNumber";

import { User, Video } from "../../types";

const formatVideosAsWriteRequests = (videos: Video[]) => {
  return videos.map(({ videoId, ...otherVideoData }) => ({
    PutRequest: {
      Item: {
        SK: videoId,
        ...otherVideoData
      }
    }
  })) as WriteRequests;
};

const addNewUserToDB = async (
  dynamoDB: DocumentClient,
  dynamoDBTableName: string,
  user: User,
  videos: Video[]
) => {
  await dynamoDB
    .put({
      TableName: dynamoDBTableName,
      Item: {
        ...user,
        SK: "profile"
      },
      ConditionExpression: "attribute_not_exists(youtubeChannelId)"
    })
    .promise();

  const videoBatches = splitArrayByItem(formatVideosAsWriteRequests(videos), 25);

  await Promise.all(
    videoBatches.map(async videoBatch =>
      dynamoDB.batchWrite({ RequestItems: { [dynamoDBTableName]: videoBatch } }).promise()
    )
  );
};

export default addNewUserToDB;
