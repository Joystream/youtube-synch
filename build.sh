#!/usr/bin/env bash
set -e

GREEN=$(tput setaf 2)
RED=$(tput setaf 1)
NC=$(tput sgr0)

rm -rf ./dist/

echo "${GREEN} Building zip archive for YPP Lambda function ${NC}"
yarn nx run api:build-lambda >/dev/null

echo "${GREEN} Building zip archives for Syncing & Monitoring Lambda functions ${NC}"
yarn nx run monitor:build-lambdas >/dev/null

echo "${GREEN} Building processing server for ec2 deployment ${NC}"
yarn nx run monitor:build-processingServer:production >/dev/null

WASM_FILE=blake3_js_bg.wasm

# Manually copy blake3 wasm module to the build artifacts folder because it is not add by the webpack during bundle creation
tee dist/packages/monitor/${WASM_FILE} \
    ./dist/packages/processing-server/${WASM_FILE} < \
    ./node_modules/blake3/dist/wasm/web/${WASM_FILE} >/dev/null

# Create tar archive of processing server for EC2 deployment
tar czf dist/packages/youtube-synch.tar.gz \
    .env .env.prod processing-server.docker-compose.yml \
    -C dist/packages/processing-server main.js ${WASM_FILE}
