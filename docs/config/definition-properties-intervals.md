## intervals Type

`object` ([Details](definition-properties-intervals.md))

# intervals Properties

| Property                                | Type      | Required | Nullable       | Defined by                                                                                                                                                                                                 |
| :-------------------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [youtubePolling](#youtubepolling)       | `integer` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-intervals-properties-youtubepolling.md "https://joystream.org/schemas/youtube-synch/config#/properties/intervals/properties/youtubePolling")       |
| [contentProcessing](#contentprocessing) | `integer` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-intervals-properties-contentprocessing.md "https://joystream.org/schemas/youtube-synch/config#/properties/intervals/properties/contentProcessing") |

## youtubePolling

After how many minutes, the polling service should poll the Youtube api for channels state update

`youtubePolling`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-intervals-properties-youtubepolling.md "https://joystream.org/schemas/youtube-synch/config#/properties/intervals/properties/youtubePolling")

### youtubePolling Type

`integer`

### youtubePolling Constraints

**minimum**: the value of this number must greater than or equal to: `1`

## contentProcessing

After how many minutes, the service should scan the database for new content to start downloading, on-chain creation & uploading to storage node

`contentProcessing`

*   is required

*   Type: `integer`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-intervals-properties-contentprocessing.md "https://joystream.org/schemas/youtube-synch/config#/properties/intervals/properties/contentProcessing")

### contentProcessing Type

`integer`

### contentProcessing Constraints

**minimum**: the value of this number must greater than or equal to: `1`
