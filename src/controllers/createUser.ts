import { NextFunction, Request, Response } from "express";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { youtube_v3 } from "googleapis/build/src/apis/youtube/v3";
import axios from "axios";

import getAllPublicYoutubeVideos from "../util/getAllPublicYoutubeVideos";
import { formatVideoData } from "../util/formatVideoData";

import { User } from "../types";
import HTTPException from "../exceptions/HTTPException";

const MAX_HUB_LEASE_SECONDS_VALUE = 828000;

const createUser = (
  dynamoDB: DocumentClient,
  dynamoDBTableName: string,
  youtubeApi: youtube_v3.Youtube
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const {
      youtubeChannelId,
      youtubeUploadsPlaylistId,
      joystreamChannelId
    }: Partial<User> = req.body;

    const videos: youtube_v3.Schema$PlaylistItem[] = [];

    if (!(youtubeChannelId && youtubeUploadsPlaylistId && joystreamChannelId)) {
      return next(
        new HTTPException(
          400,
          "Data missing. Make sure to include all of the necessary data in the json body.",
          { youtubeChannelId, youtubeUploadsPlaylistId, joystreamChannelId }
        )
      );
    }

    try {
      const userPublicYoutubeVideos = await getAllPublicYoutubeVideos(
        youtubeApi,
        youtubeUploadsPlaylistId
      );

      videos.push(...userPublicYoutubeVideos);
    } catch (error) {
      return next(
        new HTTPException(500, "Error while trying to retrieve videos from youtube's API.", error)
      );
    }

    try {
      // TODO:
      // 400KB is the max allowed amount per dynamoDB column, we need to find another way of uploading
      // more than this amount. Probably a different approach to table design would be best.
      await dynamoDB
        .put({
          TableName: dynamoDBTableName,
          Item: {
            youtubeChannelId,
            youtubeUploadsPlaylistId,
            joystreamChannelId,
            // After adding synching functionality this line will need to be changed!
            lastSynchedVideo: null,
            videos: formatVideoData(videos)
          },
          ConditionExpression: "attribute_not_exists(youtubeChannelId)"
        })
        .promise();
    } catch (error) {
      return next(
        new HTTPException(500, "Error while trying to add new user to the database.", error)
      );
    }

    const callbackEndpoint = req.protocol + "://" + req.get("host") + "/youtube-api-subscription";

    const params = {
      "hub.callback": callbackEndpoint,
      "hub.mode": "subscribe",
      "hub.topic": `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${youtubeChannelId}`,
      "hub.lease_seconds": `${MAX_HUB_LEASE_SECONDS_VALUE}`,
      "hub.secret": "",
      "hub.verify": "sync",
      "hub.verify_token": ""
    };

    const data = (Object.keys(params) as Array<keyof typeof params>)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");

    try {
      await axios({
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        data,
        url: "https://pubsubhubbub.appspot.com/subscribe"
      });
    } catch (error) {
      return next(
        new HTTPException(
          500,
          "Error while trying to setup youtube push notifications for this user",
          error
        )
      );
    }

    // TODO:
    // Start process of uploading videos to Atlas.

    res.status(200);
    res.send({
      response: 'Success! Created user based on data from the "data" object.',
      data: {
        youtubeChannelId,
        youtubeUploadsPlaylistId,
        numberOfVideos: videos.length,
        videos
      }
    });
  };
};

export default createUser;
