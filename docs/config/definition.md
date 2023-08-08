## Youtube Sync node configuration Type

`object` ([Youtube Sync node configuration](definition.md))

# Youtube Sync node configuration Properties

| Property                                                        | Type     | Required | Nullable       | Defined by                                                                                                                                                                                   |
| :-------------------------------------------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [joystream](#joystream)                                         | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream")                                             |
| [endpoints](#endpoints)                                         | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-endpoints.md "https://joystream.org/schemas/youtube-synch/config#/properties/endpoints")                                             |
| [logs](#logs)                                                   | `object` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-logs.md "https://joystream.org/schemas/youtube-synch/config#/properties/logs")                                                       |
| [youtube](#youtube)                                             | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube")                     |
| [aws](#aws)                                                     | `object` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance.md "https://joystream.org/schemas/youtube-synch/config#/properties/aws") |
| [creatorOnboardingRequirements](#creatoronboardingrequirements) | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-creatoronboardingrequirements.md "https://joystream.org/schemas/youtube-synch/config#/properties/creatorOnboardingRequirements")     |
| [httpApi](#httpapi)                                             | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-public-api-configuration.md "https://joystream.org/schemas/youtube-synch/config#/properties/httpApi")                                |
| [sync](#sync)                                                   | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync")                   |

## joystream

Joystream network related configuration

`joystream`

*   is required

*   Type: `object` ([Details](definition-properties-joystream.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream")

### joystream Type

`object` ([Details](definition-properties-joystream.md))

## endpoints

Specifies external endpoints that the distributor node will connect to

`endpoints`

*   is required

*   Type: `object` ([Details](definition-properties-endpoints.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-endpoints.md "https://joystream.org/schemas/youtube-synch/config#/properties/endpoints")

### endpoints Type

`object` ([Details](definition-properties-endpoints.md))

## logs

Specifies the logging configuration

`logs`

*   is optional

*   Type: `object` ([Details](definition-properties-logs.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-logs.md "https://joystream.org/schemas/youtube-synch/config#/properties/logs")

### logs Type

`object` ([Details](definition-properties-logs.md))

## youtube

Youtube Oauth2 Client configuration

`youtube`

*   is required

*   Type: `object` ([Youtube Oauth2 Client configuration](definition-properties-youtube-oauth2-client-configuration.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube")

### youtube Type

`object` ([Youtube Oauth2 Client configuration](definition-properties-youtube-oauth2-client-configuration.md))

## aws

AWS configurations needed to connect with DynamoDB instance

`aws`

*   is optional

*   Type: `object` ([AWS configurations needed to connect with DynamoDB instance](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance.md "https://joystream.org/schemas/youtube-synch/config#/properties/aws")

### aws Type

`object` ([AWS configurations needed to connect with DynamoDB instance](definition-properties-aws-configurations-needed-to-connect-with-dynamodb-instance.md))

## creatorOnboardingRequirements

Specifies creator onboarding requirements for Youtube Partner Program

`creatorOnboardingRequirements`

*   is required

*   Type: `object` ([Details](definition-properties-creatoronboardingrequirements.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-creatoronboardingrequirements.md "https://joystream.org/schemas/youtube-synch/config#/properties/creatorOnboardingRequirements")

### creatorOnboardingRequirements Type

`object` ([Details](definition-properties-creatoronboardingrequirements.md))

## httpApi

Public api configuration

`httpApi`

*   is required

*   Type: `object` ([Public api configuration](definition-properties-public-api-configuration.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-public-api-configuration.md "https://joystream.org/schemas/youtube-synch/config#/properties/httpApi")

### httpApi Type

`object` ([Public api configuration](definition-properties-public-api-configuration.md))

## sync

YT-synch's syncronization related settings

`sync`

*   is required

*   Type: `object` ([YT-synch syncronization related settings](definition-properties-yt-synch-syncronization-related-settings.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync")

### sync Type

`object` ([YT-synch syncronization related settings](definition-properties-yt-synch-syncronization-related-settings.md))
