import 'reflect-metadata';

import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import { getChannels } from '../../services/youTube';

import { User } from 'db';

const monitor: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const user = new User();
    const channels = await getChannels(event.body.username);
    return formatJSONResponse({
        channels
    });
}

export const main = middyfy(monitor);
