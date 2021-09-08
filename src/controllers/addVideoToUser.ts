import { NextFunction, Request, Response } from "express";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";

import { selectHighestQualityThumbnail } from "../util/formatVideoData";

import { User } from "../types";
import HTTPException from "../exceptions/HTTPException";

const addVideoToUser = (
  dynamoDB: DocumentClient,
  dynamoDBTableName: string,
  youtubeApi: youtube_v3.Youtube
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const notificationData = req.body?.feed?.entry?.[0];

    const videoId = notificationData?.["yt:videoid"]?.[0];
    const channelId = notificationData?.["yt:channelid"]?.[0];
    let user: User;
    let video: youtube_v3.Schema$Video;

    try {
      const { Item } = await dynamoDB
        .get({
          TableName: dynamoDBTableName,
          Key: {
            youtubeChannelId: channelId
          }
        })
        .promise();
      user = Item as User;
    } catch (error) {
      return next(
        new HTTPException(500, `Error while trying to find user with id: ${channelId}`, error)
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

    const formattedVideo = {
      videoId: video?.id ?? "",
      title: video?.snippet?.title ?? "",
      description: video?.snippet?.description ?? "",
      publishedAt: video?.snippet?.publishedAt ?? "",
      thumbnail: selectHighestQualityThumbnail(video?.snippet?.thumbnails)
    };

    const videoAlreadyExists = !!user.videos.find(
      dbVideo => dbVideo.videoId === formattedVideo.videoId
    );

    if (videoAlreadyExists) {
      return next(new HTTPException(303, "Video already exists!"));
    }

    try {
      await dynamoDB
        .update({
          TableName: dynamoDBTableName,
          Key: { youtubeChannelId: channelId },
          UpdateExpression:
            "set #videos = list_append(if_not_exists(#videos, :empty_list), :value)",
          ExpressionAttributeNames: {
            "#videos": "videos"
          },
          ExpressionAttributeValues: {
            ":value": [formattedVideo],
            ":empty_list": []
          }
        })
        .promise();
    } catch (error) {
      return next(
        new HTTPException(
          500,
          `Error while trying to add video(${formattedVideo.videoId}) to user(${channelId})`,
          error
        )
      );
    }

    console.log(`Video with id ${formattedVideo.videoId} succesfully added!`);

    res.status(200);
    res.send({
      text: `Video with id ${formattedVideo.videoId} succesfully added!`
    });
  };
};

export default addVideoToUser;
