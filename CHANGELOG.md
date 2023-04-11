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
