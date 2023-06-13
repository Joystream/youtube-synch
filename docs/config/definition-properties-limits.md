## limits Type

`object` ([Details](definition-properties-limits.md))

# limits Properties

| Property                                          | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                    |
| :------------------------------------------------ | :------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [dailyApiQuota](#dailyapiquota)                   | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program.md "https://joystream.org/schemas/youtube-synch/config#/properties/limits/properties/dailyApiQuota") |
| [maxConcurrentDownloads](#maxconcurrentdownloads) | `number` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-limits-properties-maxconcurrentdownloads.md "https://joystream.org/schemas/youtube-synch/config#/properties/limits/properties/maxConcurrentDownloads")                                                |
| [maxConcurrentUploads](#maxconcurrentuploads)     | `number` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-limits-properties-maxconcurrentuploads.md "https://joystream.org/schemas/youtube-synch/config#/properties/limits/properties/maxConcurrentUploads")                                                    |
| [storage](#storage)                               | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-limits-properties-storage.md "https://joystream.org/schemas/youtube-synch/config#/properties/limits/properties/storage")                                                                              |

## dailyApiQuota

Specifies daily Youtube API quota rationing scheme for Youtube Partner Program

`dailyApiQuota`

*   is required

*   Type: `object` ([Specifies daily Youtube API quota rationing scheme for Youtube Partner Program](definition-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program.md "https://joystream.org/schemas/youtube-synch/config#/properties/limits/properties/dailyApiQuota")

### dailyApiQuota Type

`object` ([Specifies daily Youtube API quota rationing scheme for Youtube Partner Program](definition-properties-limits-properties-specifies-daily-youtube-api-quota-rationing-scheme-for-youtube-partner-program.md))

## maxConcurrentDownloads

Max no. of videos that should be concurrently downloaded from Youtube to be prepared for upload to Joystream

`maxConcurrentDownloads`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-limits-properties-maxconcurrentdownloads.md "https://joystream.org/schemas/youtube-synch/config#/properties/limits/properties/maxConcurrentDownloads")

### maxConcurrentDownloads Type

`number`

### maxConcurrentDownloads Default Value

The default value is:

```json
50
```

## maxConcurrentUploads

Max no. of videos that should be concurrently uploaded to Joystream's storage node

`maxConcurrentUploads`

*   is required

*   Type: `number`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-limits-properties-maxconcurrentuploads.md "https://joystream.org/schemas/youtube-synch/config#/properties/limits/properties/maxConcurrentUploads")

### maxConcurrentUploads Type

`number`

### maxConcurrentUploads Default Value

The default value is:

```json
50
```

## storage

Maximum total size of all downloaded assets stored in `directories.assets`

`storage`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-limits-properties-storage.md "https://joystream.org/schemas/youtube-synch/config#/properties/limits/properties/storage")

### storage Type

`string`

### storage Constraints

**pattern**: the string must match the following regular expression: 

```regexp
^[0-9]+(B|K|M|G|T)$
```

[try pattern](https://regexr.com/?expression=%5E%5B0-9%5D%2B\(B%7CK%7CM%7CG%7CT\)%24 "try regular expression with regexr.com")
