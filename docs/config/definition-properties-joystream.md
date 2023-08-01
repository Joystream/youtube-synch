## joystream Type

`object` ([Details](definition-properties-joystream.md))

# joystream Properties

| Property                                    | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                             |
| :------------------------------------------ | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [faucet](#faucet)                           | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-faucet.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/faucet")                                                                   |
| [app](#app)                                 | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-app.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/app")                                                                         |
| [channelCollaborator](#channelcollaborator) | `object` | Required | cannot be null | [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator") |

## faucet

Joystream's faucet configuration (needed for captcha-free membership creation)

`faucet`

*   is required

*   Type: `object` ([Details](definition-properties-joystream-properties-faucet.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-faucet.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/faucet")

### faucet Type

`object` ([Details](definition-properties-joystream-properties-faucet.md))

## app

Joystream Metaprotocol App specific configuration

`app`

*   is required

*   Type: `object` ([Details](definition-properties-joystream-properties-app.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-app.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/app")

### app Type

`object` ([Details](definition-properties-joystream-properties-app.md))

## channelCollaborator

Joystream channel collaborators used for syncing the content

`channelCollaborator`

*   is required

*   Type: `object` ([Joystream channel collaborator used for syncing the content](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content.md "https://joystream.org/schemas/youtube-synch/config#/properties/joystream/properties/channelCollaborator")

### channelCollaborator Type

`object` ([Joystream channel collaborator used for syncing the content](definition-properties-joystream-properties-joystream-channel-collaborator-used-for-syncing-the-content.md))
