## channelCollaborator Type

`object` ([Joystream channel collaborator used for syncing the content](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content.md))

# channelCollaborator Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                                                     |
| :-------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [memberId](#memberid) | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-memberid.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator/properties/memberId") |
| [account](#account)   | `array`  | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator/properties/account")   |

## memberId



`memberId`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-memberid.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator/properties/memberId")

### memberId Type

`string`

## account

Specifies the available application auth keys.

`account`

*   is required

*   Type: an array of merged types ([Details](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account-items.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator/properties/account")

### account Type

an array of merged types ([Details](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account-items.md))

### account Constraints

**minimum number of items**: the minimum number of items for this array is: `1`
