import youtubedl from 'youtube-dl-exec';
import { uploadFile } from './aws';

const executeDownload = () => {
    console.log('ARGUMENTS:', process.argv);
    if (process.argv.length<3){
        console.log('ERROR: VIDEO URL NOT PROVIDED!');
        return
    }

    const videoUrl = process.argv[2];
    console.log('DOWNLOADING VIDEO:', videoUrl);

    const dl = youtubedl(videoUrl, {
//     dumpSingleJson: true,
//     noWarnings: true,
//     noCallHome: true,
//     noCheckCertificate: true,
//     preferFreeFormats: true,
//     youtubeSkipDashManifest: true,
//     referer: 'https://www.youtube.com/'
    }).then(async output => {
        console.log(output);
        await uploadFile('FILE_NAME_HERE');
    })
}

executeDownload();

