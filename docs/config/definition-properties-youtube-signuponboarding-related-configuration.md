## youtube Type

`object` ([Youtube Signup/Onboarding related configuration](definition-properties-youtube-signuponboarding-related-configuration.md))

# youtube Properties

| Property                                                              | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                                  |
| :-------------------------------------------------------------------- | :------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [signupMode](#signupmode)                                             | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-signupmode.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/signupMode")                                             |
| [clientId](#clientid)                                                 | `string` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-clientid.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/clientId")                                                 |
| [clientSecret](#clientsecret)                                         | `string` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-clientsecret.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/clientSecret")                                         |
| [maxAllowedQuotaUsageInPercentage](#maxallowedquotausageinpercentage) | `number` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-maxallowedquotausageinpercentage.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/maxAllowedQuotaUsageInPercentage") |
| [adcKeyFilePath](#adckeyfilepath)                                     | `string` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-adckeyfilepath.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/adcKeyFilePath")                                     |

## signupMode



`signupMode`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-signupmode.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/signupMode")

### signupMode Type

`string`

### signupMode Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"api-free"` |             |
| `"api"`      |             |
| `"both"`     |             |

### signupMode Default Value

The default value is:

```json
"both"
```

## clientId

Youtube Oauth2 Client Id

`clientId`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-clientid.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/clientId")

### clientId Type

`string`

## clientSecret

Youtube Oauth2 Client Secret

`clientSecret`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-clientsecret.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/clientSecret")

### clientSecret Type

`string`

## maxAllowedQuotaUsageInPercentage

Maximum percentage of daily Youtube API quota that can be used by the Periodic polling service. Once this limit is reached the service will stop polling for new videos until the next day(when Quota resets). All the remaining quota (100 - maxAllowedQuotaUsageInPercentage) will be used for potential channel's signups.

`maxAllowedQuotaUsageInPercentage`

*   is optional

*   Type: `number`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-maxallowedquotausageinpercentage.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/maxAllowedQuotaUsageInPercentage")

### maxAllowedQuotaUsageInPercentage Type

`number`

### maxAllowedQuotaUsageInPercentage Default Value

The default value is:

```json
95
```

## adcKeyFilePath

Path to the Google Cloud's Application Default Credentials (ADC) key file. It is required to periodically monitor the Youtube API quota usage.

`adcKeyFilePath`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-signuponboarding-related-configuration-properties-adckeyfilepath.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/adcKeyFilePath")

### adcKeyFilePath Type

`string`
