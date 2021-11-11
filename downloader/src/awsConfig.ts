export const config = {
    apiVersion: '2006-03-01',
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
}

export const bucket:string = process.env.AWS_BUCKET || 'yt-sync-dev';
