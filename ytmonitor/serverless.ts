import 'reflect-metadata';

import type { AWS } from '@serverless/typescript';

import monitor from '@functions/monitor';

const serverlessConfiguration: AWS = {
  service: 'ytmonitor',
  frameworkVersion: '2',
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
    },
  },
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      BATCH_SIZE: '100', //Number of users loaded in one run
      YOUTUBE_API_URL: 'https://youtube.googleapis.com/youtube/v3',
      YOUTUBE_API_KEY: 'API_KEY_HERE'
    },
    lambdaHashingVersion: '20201221',
  },
  // import the function via paths
  functions: { monitor },
};

module.exports = serverlessConfiguration;
