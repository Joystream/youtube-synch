import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client';
import { ChannelsRepository, UsersRepository, VideosRepository } from '@joystream/ytube';
import { Body, Controller, Get, HttpException, Inject, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Channel, DomainError, Result, Video, User } from '@youtube-sync/domain';
import { JoystreamClient } from '@youtube-sync/joy-api';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { GetMembershipsQuery, GetMembershipsQueryVariables, GetStorageBucketsQuery, GetStorageBucketsQueryVariables } from 'packages/joy-api/graphql';
import R from 'ramda'
import {groupBy, flatten, uniqBy, result} from 'lodash'
import { ChannelDto, UserDto, VideoDto } from '../dtos';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { OperatorInfo } from 'packages/joy-api/storage/uploader';
;

export class CreateMembershipDto{
   @ApiProperty() userId: string
}
export class CreateJoystreamChannelDto{
    @ApiProperty() channelId: string
    @ApiProperty() userId: string
}
export class CreateJoystreamVideoDto{
    @ApiProperty() channelId: string
    @ApiProperty() userId: string
    @ApiProperty() videoId: string
}

export class UploadVideoDto{
    @ApiProperty() videoId: string
}
@Controller('network')
@ApiTags('network')
export class NetworkController {
    constructor(
        private usersRepository: UsersRepository,
        private channelsRepository: ChannelsRepository,
        private videosRepository: VideosRepository,
        private joystreamClient: JoystreamClient,
        @Inject('orion') private orionClient: ApolloClient<NormalizedCacheObject> ) {
    }
    @ApiOperation({description: 'Create joystream network membership for existing user in the system'})
    @ApiResponse({type: UserDto})
    @Post('memberships')
    async createMembership(@Body() body: CreateMembershipDto){
        const result = await R.pipe(
            (id: string) => this.usersRepository.get('users', id),
            R.andThen(user => Result.ensure(user, u => !u.membership, u => new DomainError('User already has assigned memberhip'))),
            R.andThen(user => Result.concat(user, u => this.joystreamClient.createMembership(u))),
            R.andThen(userAndMembership => Result.bindAsync(userAndMembership, ([user, membership]) => this.usersRepository.save({...user, membership: membership}, 'users')))
        )(body.userId)
        if(result.isSuccess)
            return new UserDto(result.value)
        throw new HttpException(`Failed to create membership ${result.error}`, 500)
    }

    @Post('channels')
    async createChannel(@Body() body: CreateJoystreamChannelDto){
        const finalResult = await R.pipe(
            (userId: string, channelId: string) => this.channelsRepository.get(userId, channelId),
            R.andThen(c => Result.concat(c, c => this.usersRepository.get('users', c.userId))),
            R.andThen(result => Result.bindAsync(result, ([c, u]) => this.joystreamClient.createChannel(u.membership, c))),
            R.andThen(result => Result.bindAsync(result, ([networkId, channel]) => this.channelsRepository.save({...channel, chainMetadata: {id: networkId}}, body.userId)))
        )(body.userId, body.channelId)
        if(finalResult.isSuccess)
            return new ChannelDto(finalResult.value)
        throw new HttpException(`Failed to create membership ${finalResult.error}`, 500)
    }
    @Post('videos')
    async createVideo(@Body() body: CreateJoystreamVideoDto) : Promise<VideoDto>{
        const finalResult = await R.pipe(
            (userId: string, channelId: string) => this.channelsRepository.get(userId, channelId),
            R.andThen(c => Result.concat(c, c => this.usersRepository.get('users', c.userId))),
            R.andThen(c => Result.concat(c, ([channel, user]) => this.videosRepository.get(channel.id, body.videoId))),
            R.andThen(r => r.map(([[c, u], v]) => [c, u, v] as [Channel, User, Video])),
            R.andThen(result => Result.bindAsync(result, ([c, u, v]) => this.joystreamClient.uploadVideo(u.membership, c, v))),
            R.andThen(result => Result.bindAsync(result, r => this.videosRepository.save({...r[1], state: 'uploadToJoystreamSucceded'}, body.channelId)))
        )(body.userId, body.channelId)
        if(finalResult.isSuccess)
            return finalResult.value;
        throw new HttpException(`Failed to create membership ${finalResult.error}`, 500)
    }
    @Get('buckets')
    async getBuckets(){
        const response = await this.orionClient.query<GetStorageBucketsQuery, GetStorageBucketsQueryVariables>({
            query: gql`
                query GetStorageBuckets {
                    storageBuckets(
                    limit: 50
                    where: {
                        operatorStatus_json: { isTypeOf_eq: "StorageBucketOperatorStatusActive" }
                        operatorMetadata: { nodeEndpoint_contains: "http" }
                    }
                    ) {
                    id
                    operatorMetadata {
                        nodeEndpoint
                    }
                    bags {
                        id
                    }
                    }
                }
            `,
            fetchPolicy: 'network-only'
        });
        const bags = response.data.storageBuckets.map(bucket => bucket.bags.map(bag => ({id: bag.id, info: {id: bucket.id, endpoint: bucket.operatorMetadata.nodeEndpoint} as OperatorInfo})));
        return groupBy(flatten(bags), b => b.id);
    }
    @Get('memberships')
    async getMemberships(){
        const response = await this.orionClient.query<GetMembershipsQuery, GetMembershipsQueryVariables>({
            query: gql`
                query GetMembershipsQuery {
                    memberships(
                    limit: 50
                    ) {
                        id,
                        handle,
                        avatarUri,
                        controllerAccount,
                        rootAccount,
                        createdAt
                    }
                }
            `,
            fetchPolicy: 'network-only'
        });
        return [response.data];
    }

}