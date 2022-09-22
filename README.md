# YoutubeSync

## Required Stack

- Docker
- aws cli

Enter `localhost:3001/docs` to view all api endpoints and their descriptions

For user verification flow only two endpoints are needed

`/users/verify`

`/users/verify-and-save`

## Running the app

1. Install dependencies
   `yarn`

2. Deploy all the necessary infrastructure
   `./packages/infrastructure/deploy.sh`

This script deploys the relevant dynamoDB tables

3. Start the frontend app
   `yarn nx run app:serve`

4. Start the YPP backend server
   `yarn nx run api:serve`
