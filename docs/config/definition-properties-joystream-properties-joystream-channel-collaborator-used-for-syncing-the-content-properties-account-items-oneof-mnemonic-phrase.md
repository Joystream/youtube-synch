## 1 Type

`object` ([Mnemonic phrase](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account-items-oneof-mnemonic-phrase.md))

# 1 Properties

| Property              | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                                                                                                                                     |
| :-------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [type](#type)         | `string` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account-items-oneof-mnemonic-phrase-properties-type.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator/properties/account/items/oneOf/1/properties/type")         |
| [mnemonic](#mnemonic) | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account-items-oneof-mnemonic-phrase-properties-mnemonic.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator/properties/account/items/oneOf/1/properties/mnemonic") |

## type



`type`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account-items-oneof-mnemonic-phrase-properties-type.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator/properties/account/items/oneOf/1/properties/type")

### type Type

`string`

### type Constraints

**enum**: the value of this property must be equal to one of the following values:

| Value       | Explanation |
| :---------- | :---------- |
| `"ed25519"` |             |
| `"sr25519"` |             |
| `"ecdsa"`   |             |

### type Default Value

The default value is:

```json
"sr25519"
```

## mnemonic



`mnemonic`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content-properties-account-items-oneof-mnemonic-phrase-properties-mnemonic.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator/properties/account/items/oneOf/1/properties/mnemonic")

### mnemonic Type

`string`
