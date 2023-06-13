## youtube Type

`object` ([Youtube Oauth2 Client configuration](definition-properties-youtube-oauth2-client-configuration.md))

# youtube Properties

| Property                                                              | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                       |
| :-------------------------------------------------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [clientId](#clientid)                                                 | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration-properties-clientid.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/clientId")                                                 |
| [clientSecret](#clientsecret)                                         | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration-properties-clientsecret.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/clientSecret")                                         |
| [maxAllowedQuotaUsageInPercentage](#maxallowedquotausageinpercentage) | `number` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration-properties-maxallowedquotausageinpercentage.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/maxAllowedQuotaUsageInPercentage") |
| [adcKeyFilePath](#adckeyfilepath)                                     | `string` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration-properties-adckeyfilepath.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/adcKeyFilePath")                                     |

## clientId

Youtube Oauth2 Client Id

`clientId`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration-properties-clientid.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/clientId")

### clientId Type

`string`

## clientSecret

Youtube Oauth2 Client Secret

`clientSecret`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration-properties-clientsecret.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/clientSecret")

### clientSecret Type

`string`

## maxAllowedQuotaUsageInPercentage

Maximum percentage of daily Youtube API quota that can be used by the Periodic polling service. Once this limit is reached the service will stop polling for new videos until the next day(when Quota resets). All the remaining quota (100 - maxAllowedQuotaUsageInPercentage) will be used for potential channel's signups.

`maxAllowedQuotaUsageInPercentage`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration-properties-maxallowedquotausageinpercentage.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/maxAllowedQuotaUsageInPercentage")

### maxAllowedQuotaUsageInPercentage Type

`number`

## adcKeyFilePath

Path to the Google Cloud's Application Default Credentials (ADC) key file. It is required to periodically monitor the Youtube API quota usage.

`adcKeyFilePath`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-oauth2-client-configuration-properties-adckeyfilepath.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/adcKeyFilePath")

### adcKeyFilePath Type

`string`
