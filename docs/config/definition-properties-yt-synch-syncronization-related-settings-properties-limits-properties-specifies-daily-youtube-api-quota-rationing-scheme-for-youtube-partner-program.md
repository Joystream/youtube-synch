## dailyApiQuota Type

`object` ([Specifies daily Youtube API quota rationing scheme for Youtube Partner Program](definition-properties-yt-synch-syncronization-related-settings-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program.md))

# dailyApiQuota Properties

| Property          | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                                                                                                                            |
| :---------------- | :------- | :------- | :------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sync](#sync)     | `number` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program-properties-sync.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/limits/properties/dailyApiQuota/properties/sync")     |
| [signup](#signup) | `number` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program-properties-signup.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/limits/properties/dailyApiQuota/properties/signup") |

## sync



`sync`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program-properties-sync.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/limits/properties/dailyApiQuota/properties/sync")

### sync Type

`number`

### sync Default Value

The default value is:

```json
9500
```

## signup



`signup`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-yt-synch-syncronization-related-settings-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program-properties-signup.md "https://joystream.org/schemas/youtube-synch/config#/properties/sync/properties/limits/properties/dailyApiQuota/properties/signup")

### signup Type

`number`

### signup Default Value

The default value is:

```json
500
```
