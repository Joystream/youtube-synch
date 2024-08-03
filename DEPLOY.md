# YouTube Sync Deployment Guide

This guide outlines the steps to deploy the YouTube Sync application, including DynamoDB table creation and EC2 instance setup.

# Creating DynamoDB Tables

There are 5 DynamoDB tables that need to be created if you are deploying for the first time: `channels`, `videos`, `stats`, `users`, and `whitelistChannels`. You can use the AWS DynamoDB UI to create these tables.

Refer to [src/infrastructure/index.ts](src/infrastructure/index.ts) for the table schemas.

# Required EC2 Instances

## Prerequisites

- Docker
- Node
- npm

You will need two EC2 instances for the deployment:

### 1. YouTube Sync Application

This instance runs the YouTube Sync application, which includes two services and Redis.

- **HttpApi Server**: Provides API endpoints to create, update, delete, and retrieve data from DynamoDB.
- **YT Sync Service**: Responsible for downloading videos from YouTube and syncing them to the Joystream network.
- **Redis**: Used for caching the state of videos being synced.

To set up this instance, follow these steps:

```bash
git clone https://github.com/Joystream/youtube-synch.git

# Install dependencies
npm i
```

Configure the values specified in the [config.yml](config.yml) file. Alternatively, you can use environment variables (IMPORTANT: Environment variables override values specified in `config.yml` if both are set).

#### Constructing Environment Variables

The environment variables are derived from the `config.yml` file by converting the YAML structure into a flat format using double underscores (`__`) to represent nesting. YAML keys are converted to uppercase in environment variables. All environment variables start with `YT_SYNCH__`. CamelCase in YAML keys is converted to snake_case in environment variables. Example: `queryNode` becomes `QUERY_NODE`

Here’s an example configuration:

```yml
endpoints:
  queryNode: http://localhost:8080/graphql
  joystreamNodeWs: ws://localhost:9944
  redis:
    host: localhost
```

The corresponding environment variables are:

- `endpoints.queryNode` becomes `YT_SYNCH__ENDPOINTS__QUERY_NODE`
- `endpoints.joystreamNodeWs` becomes `YT_SYNCH__ENDPOINTS__JOYSTREAM_NODE_WS`
- `endpoints.redis.host` becomes `YT_SYNCH__ENDPOINTS__REDIS__HOST`

In a `.env` file, they would look like:

```bash
YT_SYNCH__ENDPOINTS__QUERY_NODE=http://localhost:8080/graphql
YT_SYNCH__ENDPOINTS__JOYSTREAM_NODE_WS=ws://localhost:9944
YT_SYNCH__ENDPOINTS__REDIS__HOST=localhost
```

```bash
# Start the Docker containers for the YouTube Sync application
npm run docker:start:prod
```

This will start the `youtube-synch_httpApi`, `youtube-synch_sync`, and `redis` services.

### 2. Proxy Service Instance

This instance runs a proxy service for the YouTube Sync application.

- **Proxy Server**: Creates a proxy server used to download videos from YouTube. This service helps avoid IP blocking by YouTube due to too many requests. When an IP address is blocked, the proxy EC2 instance will be restarted, assigning a new IP address.

For setup guidance, refer to the [SETUP.md](socks5-proxy/SETUP.md) file.
