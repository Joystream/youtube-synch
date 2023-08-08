## sync Type

`object` ([YT-synch syncronization related settings](definition-properties-yt-synch-syncronization-related-settings.md))

# sync Properties

| Property                      | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                                 |
| :---------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [enable](#enable)             | `boolean` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-enable.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/enable")             |
| [downloadsDir](#downloadsdir) | `string`  | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-downloadsdir.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/downloadsDir") |
| [intervals](#intervals)       | `object`  | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-intervals.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/intervals")       |
| [limits](#limits)             | `object`  | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-limits.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/limits")             |

## enable

Option to enable/disable syncing while starting the service

`enable`

*   is required

*   Type: `boolean`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-enable.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/enable")

### enable Type

`boolean`

### enable Default Value

The default value is:

```json
true
```

## downloadsDir

Path to a directory where all the downloaded assets will be stored

`downloadsDir`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-downloadsdir.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/downloadsDir")

### downloadsDir Type

`string`

## intervals

Specifies how often periodic tasks (for example youtube state polling) are executed.

`intervals`

*   is optional

*   Type: `object` ([Details](definition-properties-yt-synch-syncronization-related-settings-properties-intervals.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-intervals.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/intervals")

### intervals Type

`object` ([Details](definition-properties-yt-synch-syncronization-related-settings-properties-intervals.md))

## limits

Specifies youtube-synch service limits.

`limits`

*   is optional

*   Type: `object` ([Details](definition-properties-yt-synch-syncronization-related-settings-properties-limits.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-limits.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/limits")

### limits Type

`object` ([Details](definition-properties-yt-synch-syncronization-related-settings-properties-limits.md))
