## elastic Type

`object` ([Elasticsearch logging options](definition-properties-logs-properties-elasticsearch-logging-options.md))

# elastic Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                         |
| :-------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [level](#level)       | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-logs-properties-file-logging-options-properties-level.md "https://joystream.org/schemas/youtube-synch/config#/properties/logs/properties/elastic/properties/level")                                        |
| [endpoint](#endpoint) | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-logs-properties-elasticsearch-logging-options-properties-endpoint.md "https://joystream.org/schemas/youtube-synch/config#/properties/logs/properties/elastic/properties/endpoint")                         |
| [auth](#auth)         | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-logs-properties-elasticsearch-logging-options-properties-elasticsearch-authentication-options.md "https://joystream.org/schemas/youtube-synch/config#/properties/logs/properties/elastic/properties/auth") |

## level

Minimum level of logs sent to this output

`level`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-logs-properties-file-logging-options-properties-level.md "https://joystream.org/schemas/youtube-synch/config#/properties/logs/properties/elastic/properties/level")

### level Type

`string`

### level Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"error"`   |             |
| `"warn"`    |             |
| `"info"`    |             |
| `"http"`    |             |
| `"verbose"` |             |
| `"debug"`   |             |
| `"silly"`   |             |

## endpoint

Elasticsearch endpoint to push the logs to (for example: <http://localhost:9200>)

`endpoint`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-logs-properties-elasticsearch-logging-options-properties-endpoint.md "https://joystream.org/schemas/youtube-synch/config#/properties/logs/properties/elastic/properties/endpoint")

### endpoint Type

`string`

## auth



`auth`

*   is required

*   Type: `object` ([Elasticsearch authentication options](definition-properties-logs-properties-elasticsearch-logging-options-properties-elasticsearch-authentication-options.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-logs-properties-elasticsearch-logging-options-properties-elasticsearch-authentication-options.md "https://joystream.org/schemas/youtube-synch/config#/properties/logs/properties/elastic/properties/auth")

### auth Type

`object` ([Elasticsearch authentication options](definition-properties-logs-properties-elasticsearch-logging-options-properties-elasticsearch-authentication-options.md))
