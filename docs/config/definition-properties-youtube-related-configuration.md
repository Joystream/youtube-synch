## youtube Type

`object` ([Youtube related configuration](definition-properties-youtube-related-configuration.md))

# youtube Properties

| Property                          | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                                                         |
| :-------------------------------- | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [apiMode](#apimode)               | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-related-configuration-properties-apimode.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/apiMode")                                                                                           |
| [api](#api)                       | `object` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-related-configuration-properties-youtube-api-configuration.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/api")                                                                             |
| [operationalApi](#operationalapi) | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-youtube-related-configuration-properties-youtube-operational-api-httpsgithubcombenjamin-loisonyoutube-operational-api-configuration.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/operationalApi") |

## apiMode



`apiMode`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-related-configuration-properties-apimode.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/apiMode")

### apiMode Type

`string`

### apiMode Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value        | Explanation |
| :----------- | :---------- |
| `"api-free"` |             |
| `"api"`      |             |
| `"both"`     |             |

### apiMode Default Value

The default value is:

```json
"both"
```

## api

Youtube API configuration

`api`

*   is optional

*   Type: `object` ([Youtube API configuration](definition-properties-youtube-related-configuration-properties-youtube-api-configuration.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-related-configuration-properties-youtube-api-configuration.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/api")

### api Type

`object` ([Youtube API configuration](definition-properties-youtube-related-configuration-properties-youtube-api-configuration.md))

## operationalApi

Youtube Operational API (<https://github.com/Benjamin-Loison/YouTube-operational-API>) configuration

`operationalApi`

*   is required

*   Type: `object` ([Youtube Operational API (https://github.com/Benjamin-Loison/YouTube-operational-API) configuration](definition-properties-youtube-related-configuration-properties-youtube-operational-api-httpsgithubcombenjamin-loisonyoutube-operational-api-configuration.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-youtube-related-configuration-properties-youtube-operational-api-httpsgithubcombenjamin-loisonyoutube-operational-api-configuration.md "https://joystream.org/schemas/youtube-synch/config#/properties/youtube/properties/operationalApi")

### operationalApi Type

`object` ([Youtube Operational API (https://github.com/Benjamin-Loison/YouTube-operational-API) configuration](definition-properties-youtube-related-configuration-properties-youtube-operational-api-httpsgithubcombenjamin-loisonyoutube-operational-api-configuration.md))
