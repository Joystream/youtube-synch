import { NextFunction, Request, Response } from "express";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";

import { selectHighestQualityThumbnail } from "../util/general/formatVideoData";

import { DBVideo, User } from "../types";
import HTTPException from "../exceptions/HTTPException";

const addVideoToUser = (
  dynamoDB: DocumentClient,
  dynamoDBTableName: string,
  youtubeApi: youtube_v3.Youtube
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const notificationData = req.body?.feed?.entry?.[0];

    const videoId = notificationData?.["yt:videoid"]?.[0];
    const youtubeChannelId = notificationData?.["yt:channelid"]?.[0];
    let user: User;
    let video: youtube_v3.Schema$Video;

    try {
      const { Item } = await dynamoDB
        .get({
          TableName: dynamoDBTableName,
          Key: {
            youtubeChannelId: youtubeChannelId,
            SK: "profile"
          }
        })
        .promise();
      user = Item as User;
    } catch (error) {
      return next(
        new HTTPException(
          500,
          `Error while trying to find user with id: ${youtubeChannelId}`,
          error
        )
      );
    }

    try {
      const { data } = await youtubeApi.videos.list({
        id: videoId,
        part: ["snippet"]
      });

      video = data?.items?.[0] as youtube_v3.Schema$Video;
    } catch (error) {
      return next(
        new HTTPException(500, `Error while trying to find video with id: ${videoId}`, error)
      );
    }

    const formattedVideo: DBVideo = {
      youtubeChannelId,
      SK: video?.id ?? "",
      title: video?.snippet?.title ?? "",
      description: video?.snippet?.description ?? "",
      publishedAt: video?.snippet?.publishedAt ?? "",
      thumbnail: selectHighestQualityThumbnail(video?.snippet?.thumbnails),
      isSynched: false
    };

    try {
      await dynamoDB
        .put({
          TableName: dynamoDBTableName,
          Item: formattedVideo,
          ConditionExpression: "attribute_not_exists(youtubeChannelId)"
        })
        .promise();
    } catch (error) {
      return next(
        new HTTPException(
          500,
          `Error while trying to add video(${formattedVideo.SK}) to user(${youtubeChannelId})`,
          error
        )
      );
    }

    console.log(`Video with id ${formattedVideo.SK} succesfully added!`);

    res.status(200);
    res.send({
      text: `Video with id ${formattedVideo.SK} succesfully added!`
    });
  };
};

export default addVideoToUser;
