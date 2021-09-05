import { Request, Response } from "express";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";
import { youtube_v3 } from 'googleapis/build/src/apis/youtube/v3';

import getAllPublicYoutubeVideos from '../util/getAllPublicYoutubeVideos';
import formatVideoData from '../util/formatVideoData';

type requestUserData = {
  youtubeChannelId?: string;
  youtubeUploadsPlaylistId?: string;
};

const createUser = (dynamoDB: DocumentClient, dynamoDBTableName: string, youtubeApi: youtube_v3.Youtube) => {
  return async (req: Request, res: Response) => {
    const { youtubeChannelId, youtubeUploadsPlaylistId }: requestUserData = req.body;

    const videos: youtube_v3.Schema$PlaylistItem[] = [];

    if (!(youtubeChannelId && youtubeUploadsPlaylistId)) {
      res.status(400);
      res.send({
        text:
          "Data missing. Make sure to include all of the necessary data in the json body.",
      });
      return;
    }

    try {
      const userPublicYoutubeVideos = await getAllPublicYoutubeVideos(
        youtubeApi,
        youtubeUploadsPlaylistId
      );

      videos.push(...userPublicYoutubeVideos);
    } catch (error) {
      console.log(error);
      res.status(500);
      res.send({
        text:
          "There's been a problem while trying to retrieve videos from youtube's API.",
        youtubeAPIError: error,
      });
      return;
    }

    try {
      await dynamoDB
        .put({
          TableName: dynamoDBTableName,
          Item: {
            youtubeChannelId,
            youtubeUploadsPlaylistId,
            videos: formatVideoData(videos),
          },
          ConditionExpression: "attribute_not_exists(youtubeChannelId)",
        })
        .promise();
    } catch (error) {
      console.log(error);
      res.status(500);
      res.send(error);
      return;
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
        videos,
      },
    });
  };
};

export default createUser;
