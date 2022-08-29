import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client'
import { ChannelsRepository, UsersRepository, VideosRepository } from '@joystream/ytube'
import { Controller, Get, Inject } from '@nestjs/common'
import { ApiProperty, ApiTags } from '@nestjs/swagger'
import { flatten, groupBy } from 'lodash'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  GetMembershipsQuery,
  GetMembershipsQueryVariables,
  GetStorageBucketsQuery,
  GetStorageBucketsQueryVariables,
} from 'packages/joy-api/graphql'

export class CreateMembershipDto {
  @ApiProperty() userId: string
}

export class CreateJoystreamChannelDto {
  @ApiProperty() channelId: string
  @ApiProperty() userId: string
}

export class CreateJoystreamVideoDto {
  @ApiProperty() channelId: string
  @ApiProperty() userId: string
  @ApiProperty() videoId: string
}

export class UploadVideoDto {
  @ApiProperty() videoId: string
}

@Controller('network')
@ApiTags('network')
export class NetworkController {
  constructor(
    @Inject('orion') private orionClient: ApolloClient<NormalizedCacheObject> // private uploader: Uploader
  ) {}

  @Get('buckets')
  async getBuckets() {
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
      fetchPolicy: 'network-only',
    })
    const bags = response.data.storageBuckets.map((bucket) =>
      bucket.bags.map((bag) => ({
        id: bag.id,
        info: {
          id: bucket.id,
          endpoint: bucket.operatorMetadata.nodeEndpoint,
        },
      }))
    )
    return groupBy(flatten(bags), (b) => b.id)
  }

  @Get('memberships')
  async getMemberships() {
    const response = await this.orionClient.query<GetMembershipsQuery, GetMembershipsQueryVariables>({
      query: gql`
        query GetMembershipsQuery {
          memberships(limit: 50) {
            id
            handle
            avatarUri
            controllerAccount
            rootAccount
            createdAt
          }
        }
      `,
      fetchPolicy: 'network-only',
    })
    return [response.data]
  }
}
