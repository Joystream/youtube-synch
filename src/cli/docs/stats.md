`youtube-synch stats`
=====================

Returns channels created from date x till date y + link to joystream and youtube channel + Referrer ids.

* [`youtube-synch stats:channels`](#youtube-synch-statschannels)
* [`youtube-synch stats:videosByChannel`](#youtube-synch-statsvideosbychannel)

## `youtube-synch stats:channels`

Returns channels created from date x till date y + link to joystream and youtube channel + Referrer ids.

```
USAGE
  $ youtube-synch stats:channels

OPTIONS
  -c, --configPath=configPath  [default: ./config.yml] Path to config JSON/YAML file (relative to current working
                               directory)

  -d, --appDomain=appDomain    Domain of the application that should be used to construct the channel URLs

  -y, --yes                    Answer "yes" to any prompt, skipping any manual confirmations

  --httpApiUrl=httpApiUrl      [default: http://localhost:3001] HttpApi URL from where channels & videos stats should be
                               fetched
```

## `youtube-synch stats:videosByChannel`

Returns the number of videos created (for a given channel) from date x till date y + link to joystream and youtube channel + Referrer ids.

```
USAGE
  $ youtube-synch stats:videosByChannel

OPTIONS
  -c, --configPath=configPath              [default: ./config.yml] Path to config JSON/YAML file (relative to current
                                           working directory)

  -d, --appDomain=appDomain                Domain of the application that should be used to construct the channel &
                                           videos URLs

  -y, --yes                                Answer "yes" to any prompt, skipping any manual confirmations

  --httpApiUrl=httpApiUrl                  [default: http://localhost:3001] HttpApi URL from where channels & videos
                                           stats should be fetched

  --joystreamChannelId=joystreamChannelId  (required) ID of the synced Joystream channel for which the uploaded videos
                                           stats should be returned
```
