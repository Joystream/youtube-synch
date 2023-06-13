## aws Type

`object` ([AWS configurations needed to connect with DynamoDB instance](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance.md))

# aws Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                     |
| :-------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [endpoint](#endpoint)       | `string` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance-properties-endpoint.md "https://joystream.org/schemas/youtube-synch/config#/properties/aws/properties/endpoint")           |
| [region](#region)           | `string` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance-properties-region.md "https://joystream.org/schemas/youtube-synch/config#/properties/aws/properties/region")               |
| [credentials](#credentials) | `object` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance-properties-aws-credentials.md "https://joystream.org/schemas/youtube-synch/config#/properties/aws/properties/credentials") |

## endpoint

DynamoDB endpoint to connect with the instance, only set if node is connecting to local DynamoDB instance

`endpoint`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance-properties-endpoint.md "https://joystream.org/schemas/youtube-synch/config#/properties/aws/properties/endpoint")

### endpoint Type

`string`

## region

DynamoDB endpoint to connect with the instance, only set if node is connecting to AWS DynamoDB instance

`region`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance-properties-region.md "https://joystream.org/schemas/youtube-synch/config#/properties/aws/properties/region")

### region Type

`string`

## credentials

Youtube Oauth2 Client configuration

`credentials`

*   is optional

*   Type: `object` ([AWS credentials](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance-properties-aws-credentials.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance-properties-aws-credentials.md "https://joystream.org/schemas/youtube-synch/config#/properties/aws/properties/credentials")

### credentials Type

`object` ([AWS credentials](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance-properties-aws-credentials.md))
