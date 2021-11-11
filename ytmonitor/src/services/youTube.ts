import { executeHttp } from './apiClient';
const baseUrl = process.env.YOUTUBE_API_URL;
const apiKey = process.env.YOUTUBE_API_KEY;

export const getChannels = async (username:string) =>{
    const url = `${baseUrl}/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=${username}&key=${apiKey}`;
    const requestParams = {
        url
    }
    return {getChannels:''}
    //return await executeHttp('get',requestParams);
}
