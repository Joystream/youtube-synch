## endpoints Type

`object` ([Details](definition-properties-endpoints.md))

# endpoints Properties

| Property                            | Type     | Required | Nullable       | Defined by                                                                                                                                                                                             |
| :---------------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [queryNode](#querynode)             | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-endpoints-properties-querynode.md "https://joystream.org/schemas/youtube-synch/config#/properties/endpoints/properties/queryNode")             |
| [joystreamNodeWs](#joystreamnodews) | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-endpoints-properties-joystreamnodews.md "https://joystream.org/schemas/youtube-synch/config#/properties/endpoints/properties/joystreamNodeWs") |
| [redis](#redis)                     | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-endpoints-properties-redis.md "https://joystream.org/schemas/youtube-synch/config#/properties/endpoints/properties/redis")                     |

## queryNode

Query node graphql server uri (for example: <http://localhost:8081/graphql>)

`queryNode`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-endpoints-properties-querynode.md "https://joystream.org/schemas/youtube-synch/config#/properties/endpoints/properties/queryNode")

### queryNode Type

`string`

## joystreamNodeWs

Joystream node websocket api uri (for example: ws\://localhost:9944)

`joystreamNodeWs`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-endpoints-properties-joystreamnodews.md "https://joystream.org/schemas/youtube-synch/config#/properties/endpoints/properties/joystreamNodeWs")

### joystreamNodeWs Type

`string`

## redis

Redis server host and port, required by BullMQ

`redis`

*   is required

*   Type: `object` ([Details](definition-properties-endpoints-properties-redis.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-endpoints-properties-redis.md "https://joystream.org/schemas/youtube-synch/config#/properties/endpoints/properties/redis")

### redis Type

`object` ([Details](definition-properties-endpoints-properties-redis.md))
