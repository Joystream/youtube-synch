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
