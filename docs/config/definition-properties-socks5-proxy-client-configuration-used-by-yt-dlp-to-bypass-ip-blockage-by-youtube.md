## proxy Type

`object` ([Socks5 proxy client configuration used by yt-dlp to bypass IP blockage by Youtube](definition-properties-socks5-proxy-client-configuration-used-by-yt-dlp-to-bypass-ip-blockage-by-youtube.md))

# proxy Properties

| Property                    | Type     | Required | Nullable       | Defined by                                                                                                                                                                                                                                                         |
| :-------------------------- | :------- | :------- | :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [url](#url)                 | `string` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-socks5-proxy-client-configuration-used-by-yt-dlp-to-bypass-ip-blockage-by-youtube-properties-url.md "https://joystream.org/schemas/youtube-synch/config#/properties/proxy/properties/url")                 |
| [chiselProxy](#chiselproxy) | `object` | Optional | cannot be null | [Youtube Sync node configuration](definition-properties-socks5-proxy-client-configuration-used-by-yt-dlp-to-bypass-ip-blockage-by-youtube-properties-chiselproxy.md "https://joystream.org/schemas/youtube-synch/config#/properties/proxy/properties/chiselProxy") |

## url

Proxy Client URL e.g. socks\://localhost:1080, socks\://user:password\@localhost:1080

`url`

*   is optional

*   Type: `string`

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-socks5-proxy-client-configuration-used-by-yt-dlp-to-bypass-ip-blockage-by-youtube-properties-url.md "https://joystream.org/schemas/youtube-synch/config#/properties/proxy/properties/url")

### url Type

`string`

## chiselProxy

Configuration option to manage Chisel Client & Server. Before enabling this option please refer to setup guide in `socks5-proxy/SETUP.md`

`chiselProxy`

*   is optional

*   Type: `object` ([Details](definition-properties-socks5-proxy-client-configuration-used-by-yt-dlp-to-bypass-ip-blockage-by-youtube-properties-chiselproxy.md))

*   cannot be null

*   defined in: [Youtube Sync node configuration](definition-properties-socks5-proxy-client-configuration-used-by-yt-dlp-to-bypass-ip-blockage-by-youtube-properties-chiselproxy.md "https://joystream.org/schemas/youtube-synch/config#/properties/proxy/properties/chiselProxy")

### chiselProxy Type

`object` ([Details](definition-properties-socks5-proxy-client-configuration-used-by-yt-dlp-to-bypass-ip-blockage-by-youtube-properties-chiselproxy.md))
