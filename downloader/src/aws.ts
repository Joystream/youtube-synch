import AWS from 'aws-sdk';
import fs from 'fs';
import {config, s3Config} from './awsConfig';
import path from "path";
AWS.config.update(config);

export const uploadFile = async (fileName: string) =>{
    const s3 = new AWS.S3();
    const fileStream = fs.createReadStream(fileName);

    fileStream.on('error', function(err) {
        throw err;
    });

    const uploadParams = {
        Bucket: s3Config.bucket,
        Key: path.basename(fileName),
        Body: fileStream
    }

    console.log('READY TO UPLOAD', uploadParams);

    // const uploadResult = await s3.upload(uploadParams);
    // console.log("Upload: ", uploadResult);
}
