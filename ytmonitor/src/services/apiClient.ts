import axios, { AxiosResponse } from 'axios';

export const executeHttp = async (method, config) => {
    method = method.toLowerCase();
    try{
        const response: AxiosResponse = await axios[method](config.url, config.config);
        return response;
    }catch (e){
        throw e;
    }
}

