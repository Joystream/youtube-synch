### 3.4.1

- Add support for setting `isShort` field in the video metadata (indicating whether video is a short format, vertical video or not) when creating the video.
- Support connecting to chisel server proxy ec2 instance using Private IP address.
- **FIX**: Properly handle error when failing to download the members-only content from Youtube.

### 3.4.0

- Enable opentelemetry integration for tracing
- Support running httpApi and sync as separate services
- **FIX**: Added timeout in `ContentMetadataService` to avoid infinite waiting for the video to be processed
- **FIX**: Restarting chisel client container from inside yt-synch container
- **FIX**: Skip uploading object to storage node if it already exists
- **FIX**: `ytdlpClient.getVideos` method

### 3.3.0

- Added `chisel` proxy setup with automated IP rotation mechanism to circumvent youtube IP blockage, also integrated proxy setup with yt-synch server. See [docs](socks5-proxy/SETUP.md) for more details
- Optimizes Youtube API quota usage by using `yt-dlp` instead of youtubeApi to fetch the channel details
- Added `processedAt` in channels schema to track the timestamp when channel was processed (`Verified`/`Suspended`)
- Removed unused method from video repository
- Added YPP InductionRequirement of `CHANNEL_CRITERIA_UNMET_CREATION_DATE`
- Update video processing priority calculation to prioritize Silver+ tier channels
- **FIX**: Update referral reward values
- **FIX**: Added error handling for winston logger
- **FIX**: Remove stale downloaded videos
- **FIX**: Avoid updating some channel properties e.g. `createdAt`, `email`, `userId` on re-signup

### 3.2.0

- Optimizes Youtube API quota usage by using `yt-dlp` instead of youtubeApi to fetch the video details
- add `pendingDownloadTimeoutSec` config option to manage timeout for youtube downloads
- Add multiple variants to `YtVideo.state.VideoUnavailable`
- **FIX**: add optional locking feature for Dynamodb tables
- **FIX**: Only calculate priority for sync-able videos

### 3.1.0

- bump `@bull-board` npm dependency
- Add new `referrers/top-referrers` endpoint to return top referrers by cumulative reward
- Updates `channels/induction/requirements` endpoint to return both the requirements as well as error messages if the signup fails
- **FIX**: lock bullmq jobs processing when recalculating the priorities
- **FIX**: skip stall check & add auto-renewal of locks for batch jobs
- **FIX**: remove `joystreamChannelId` field from video type + add optional locking feature for Dynamodb tables
- **FIX**: add timeout for 'pWaitFor' in storage-node/api.ts

### 3.0.0

- Introduce new YPP 2.0 program with with four different tiers (`Bronze`, `Silver`, `Gold` & `Diamond`) and different rewards for each tier. Previously the tiers were based on the subscribers count
- Migrate from `better-queue` npm package to `BullMQ` for queue management.
- Adds `channels/:id/referrals` endpoint to get the referrals of a channel
- update `/channels/:id` endpoint for returning the sync eta, backlog etc
- remove unused channels/ & users/ endpoints
- reenable syncing for 'Unverified channels'
- Add feature for batch creation of videos on chain

### 2.1.0

- return syncBacklog field in `GET /status` endpoint
- **FIX**: Adds fix for premiere videos not syncing bug

### 2.0.0

- Updates minimum required NodeJS version to `v18`.
- Adds `referredChannels` field in `GET /channels/{joystreamChannelId}` endpoint's response.
- Adds configuration option to enable/disable syncing by operators.
- Introduced feature to sync videos of only `Verified` channels.
- Introduced feature for per channel based sync limits.
- **FIX**: Adds validation against multiple signups by same Joystream channel.
- **FIX**: Hide elasticsearch credentials in the logs.
- **FIX**: Make `avatar` optional in create membership (`POST /membership`) request.
- **FIX**: Youtube Quota usage query endpoint.

### 1.5.0

- Adds new `POST /membership` endpoint for captcha-free membership creation of verified YPP users. Requires Faucet endpoint (`joystream.faucet.endpoint`) and Bearer Authentication token (`joystream.faucet.captchaBypassKey`) in the configuration, as the request handler calls Joystream Faucet as an authenticated actor.
- Adds new `state-publishedAt-index` Global Secondary Index on `videos` DynamoDB table to efficiently query all the videos synced in a given time range.
- Updates `POST /users` endpoint to return more information about verified YPP user. The response now includes `channelHandle`, `channelTitle`, `channelDescription`, `avatarUrl` & `bannerUrl` fields too.
- Adds check for disk space before initiating video download.
- **FIX** `sendExtrinsic`: The send extrinsic function (which is a wrapper around PolkadotJS `tx.signAndSend` function) has been fixed to handle the case when tx has been finalized before the callback registered in `tx.signAndSend` would run.
- **FIX**: Calculation for daily quota usage of Youtube API.
- **FIX**: If a Youtube channel has been terminated by Youtube, mark its state in YT-synch backend as `OutedOut` and exclude it from syncing, previously, the YT-synch backend would keep trying to fetch the channel info and would fail with `youtube.common.authenticatedUserAccountSuspended` error.

### 1.4.2

- Adds Youtube API quota usage optimization.
- Fetches Youtube API daily quota usage stats from the Google's Cloud Monitoring API instead of calculating it in the application.
- Bumps `ajv` package version to `^8.0.0` & generate docs for the configuration schema
- set AsyncLock's queue size to `MAX_SAFE_INTEGER`

### 1.4.1

- Excludes age restricted videos from syncing.
- Add support for excluding blocked videos of channel from being tracked.
- While uploading the asset to storage-node set the axios `max-redirects: 0`. This is done to avoid the buffering of complete request payload body in-memory (which could lead to out of memory error if payload is too large). Since if max-redirects is not equal to zero, the axios client will buffer all the request payload in-memory to respond to any redirection from the server.
- override the `res.send` and `res.json` methods to save the body data to `res.locals`
- Adds `pWaitFor` function to check the QN state for `totalVideosCreated` nonce when creating videos.

### 1.4.0

- Adds support for whitelisting a channel such that a whitelisted channel will be exempted from requirements check when signing up for the YPP program. Adds `POST /channels/whitelist` endpoint to whitelist a channel/s & `DELETE /channels/whitelist/{ytChannelHandle}` endpoint to remove a channel from whitelist.

### 1.3.0

- Integrates ElasticSearch alerting feature based on the filtration criteria set on the ingested logs.
- Adds `./scripts/create-elasticsearch-alert.sh` script to automate the creation of _Kibana Alert Rules_ and _Action Connectors_ for Alerting purpose.

### 1.2.0

- Changed the order by which videos should be synced, now the videos are synced in the order of their `publishedAt` date instead of `views`. This is done to ensure that the videos are synced in the order they were published on Youtube.
- Added --no-warning (`noWarning=true`) flag while downloading video using `yt-dlp` to correctly parse stdout response
- Changed the billing mode of all DynamoDB tables from `PROVISIONED` to `PAY_PER_REQUEST` (On-demand)
- Added pagination to dynamoDB `query` & `scan` operations

### 1.1.1

- Fixed count of synced videos displayed in `stats:videosByChannel` CLI command.
- Added a contentProcessing interval flag (`intervals.contentProcessing`) to separate the periodic polling of channels for new content (using `YoutubePollingService`) from the periodic processing of content (using `ContentDownloadService`, `ContentCreationService`, `ContentUploadService`).
- Added `async-lock` on all dynamodb queries/updates to have serializable DB across all services.
- Added `lines-between-class-members` & `no-floating-promises` eslint rules, also added `lint.yml` github CI workflow to run eslint on every PR.

### 1.1.0

- Adds `/status/collaborator` endpoint which return the the information (e.g. balance, memberId, address) of the Collaborator member
- Adds `/status/quota-usage` & `/status/quota-usage/today` endpoints. And marks both `/youtube/quota-usage` & `/youtube/quota-usage/today` as depreciated. They will be removed in next major release
- Initializes the NestFactory Application as `DynamicModule` instead of using previously used `@Module` decorator
- For Dynamodb `videos` table change the billing mode from `PROVISIONED` to `PAY_PER_REQUEST` (On-demand) due to unpredictable `ProvisionedThroughputExceededException` errors
- Adds channels & videos stats CLI commands for Operator reward management (see [docs](src/cli/docs/stats.md) for more details)

### 1.0.0

- Released first version of the YT-synch service
