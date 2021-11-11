import AWS from 'aws-sdk';
import fs from 'fs';
import {config, bucket} from './awsConfig';
import path from "path";
const s3 = new AWS.S3(config);

console.log(config, bucket);

export const uploadFile = async (fileName: string):Promise<any> => {
    const fileStream = fs.createReadStream(fileName);
    fileStream.on('error', function(err) {
        throw err;
    });

    const uploadParams = {
        Bucket: bucket,
        Key: path.basename(fileName),
        Body: fileStream
    }

    return new Promise((resolve, reject) => {
        console.log('READY TO UPLOAD', uploadParams.Bucket, uploadParams.Key);
        const uploadResult = s3.upload(uploadParams, (err: any, data: unknown)=>{
            fileStream.destroy();
            if (err) {
                console.log("Upload failed: ", err);
                return reject(err);
            }
            console.log("Upload complete: ", data);
            return resolve(data);
        });
    });
}
