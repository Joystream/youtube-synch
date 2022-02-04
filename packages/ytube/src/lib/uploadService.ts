import { IYoutubeClient } from './youtubeClient';
import * as stream from 'stream';
import { Video } from '@youtube-sync/domain';
import { videoRepository } from './database';
import { S3 } from 'aws-sdk';
import { mapTo } from '..';

export interface IUploadService {
  uploadVideo(channelId: string, videoId: string): Promise<Video>;
}

export class S3UploadService implements IUploadService {
  constructor(private youtubeClient: IYoutubeClient) {}
  async uploadVideo(channelId: string, videoId: string): Promise<Video> {
    const repo = videoRepository();
    const videoDoc = await repo.get({ channelId, id: videoId });
    const video: Video = mapTo<Video>(videoDoc);
    await repo.update({
      id: video.id,
      channelId: video.channelId,
      state: 'uploadToJoystreamStarted',
    });
    const passThroughStream = new stream.PassThrough();
    this.youtubeClient.downloadVideo(video.url).pipe(passThroughStream);
    // TODO: this is for demo purposes only, will be replaces by the upload to joystream network
    const s3 = new S3();
    const exists = await this.bucketExists(s3, channelId.toLowerCase());
    console.log('Bucket exists:', exists);
    if (!exists) {
      console.log('Creating bucket', channelId.toLowerCase());
      await s3
        .createBucket({
          Bucket: channelId.toLowerCase(),
          ACL: 'public-read-write',
        })
        .promise();
    }

    const upload = new S3.ManagedUpload({
      params: {
        Bucket: channelId.toLowerCase(),
        Key: video.title ?? video.id,
        Body: passThroughStream,
      },
    });
    return await upload
      .promise()
      .then((up) =>
        repo.update({
          id: video.id,
          channelId: video.channelId,
          state: 'uploadToJoystreamSucceded',
          destinationUrl: up.Location,
        })
      )
      .catch((err) => {
        console.log(err);
        return repo.update({
          id: video.id,
          channelId: video.channelId,
          state: 'uploadToJoystreamFailed',
        });
      })
      .then((doc) => doc.toJSON() as Video);
  }
  private async bucketExists(s3: S3, channelId: string) {
    try {
      await s3
        .headBucket({
          Bucket: channelId.toLowerCase(),
        })
        .promise();
      return true;
    } catch (err : any) {
      if (err.statusCode === 404) return false;
      throw err;
    }
  }
}

export class JoystreamUploadService implements IUploadService {
  uploadVideo(channelId: string, videoId: string): Promise<Video> {
    throw new Error('Method not implemented.');
  }
}
