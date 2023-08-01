## app Type

`object` ([Details](definition-properties-joystream-properties-app.md))

# app Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                   |
| :-------------------------- | :------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [name](#name)               | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-app-properties-name.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/app/properties/name")               |
| [accountSeed](#accountseed) | `string` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-app-properties-accountseed.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/app/properties/accountSeed") |

## name

Name of the app

`name`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-app-properties-name.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/app/properties/name")

### name Type

`string`

## accountSeed

Specifies the app auth key's string seed, for generating ed25519 keypair, to be used for signing App Actions

`accountSeed`

*   is required

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-app-properties-accountseed.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/app/properties/accountSeed")

### accountSeed Type

`string`
