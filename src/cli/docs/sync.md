`youtube-synch sync`
====================

Add Unauthorized Youtube Channel For Syncing, this command will also create corresponding Joystream Channel if --joystreamChannelId  flag is not provided

* [`youtube-synch sync:addUnauthorizedChannelForSyncing`](#youtube-synch-syncaddunauthorizedchannelforsyncing)
* [`youtube-synch sync:syncMultipleUnauthorizedChannels`](#youtube-synch-syncsyncmultipleunauthorizedchannels)

## `youtube-synch sync:addUnauthorizedChannelForSyncing`

Add Unauthorized Youtube Channel For Syncing, this command will also create corresponding Joystream Channel if --joystreamChannelId  flag is not provided

```
USAGE
  $ youtube-synch sync:addUnauthorizedChannelForSyncing

OPTIONS
  -c, --configPath=configPath              [default: ./config.yml] Path to config JSON/YAML file (relative to current
                                           working directory)

  -y, --yes                                Answer "yes" to any prompt, skipping any manual confirmations

  --channelUrl=channelUrl                  Youtube Channel or User URL (e,g. https://www.youtube.com/@MrBeast
                                           https://www.youtube.com/user/mrbeast6000)

  --joystreamChannelId=joystreamChannelId  Joystream Channel ID where Youtube videos will be replicated

  --videosLimit=videosLimit                [default: 50] Limit the number of videos to sync

  --ytChannelId=ytChannelId                Youtube Channel ID
```

## `youtube-synch sync:syncMultipleUnauthorizedChannels`

Sync multiple unauthorized channels, this command internally uses.

```
USAGE
  $ youtube-synch sync:syncMultipleUnauthorizedChannels

OPTIONS
  -c, --configPath=configPath  [default: ./config.yml] Path to config JSON/YAML file (relative to current working
                               directory)

  -i, --input=input            (required) Path to JSON file to use as input

  -y, --yes                    Answer "yes" to any prompt, skipping any manual confirmations
```
