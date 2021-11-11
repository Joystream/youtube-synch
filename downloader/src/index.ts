const dotenv = require('dotenv');
const env = process.env.ENV || 'local';
dotenv.config({path: `./${env}.env`});

import youtubedl from 'youtube-dl-exec';
import { uploadFile } from './aws';

const getFileName = (output: string):string => {
    const startMarker = '[download] Destination:';
    const endMarker = '[download]';
    const startInd = output.indexOf(startMarker) + startMarker.length;
    const endInd = output.indexOf(endMarker, startInd);
    if (0 < startInd && startInd < endInd){
        return output.substring(startInd, endInd).trim();
    }
    return '';
}

const executeDownload = () => {
    console.log('ARGUMENTS:', process.argv);
    if (process.argv.length<3){
        console.log('ERROR: VIDEO URL NOT PROVIDED!');
        return
    }

    const videoUrl = process.argv[2];
    console.log('DOWNLOADING VIDEO:', videoUrl);

    const dl = youtubedl(videoUrl, {}).then(async output => {
        console.log(output.toString());
        const fileName = getFileName(output.toString());
        await uploadFile(fileName);
    })
}

executeDownload();

