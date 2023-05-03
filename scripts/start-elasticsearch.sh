#!/usr/bin/env bash

set -e

SCRIPT_PATH="$(dirname "${BASH_SOURCE[0]}")"
cd $SCRIPT_PATH

set -a
if [ -f ../.env ]; then
    . ../.env
fi
set +a

ELASTIC_USERNAME=${ELASTIC_USERNAME:="elastic"}
ELASTIC_PASSWORD=${ELASTIC_PASSWORD:="password"}

## Run docker-compose to start elasticsearch container
docker-compose -f ../docker-compose.elasticsearch.yml up -d elasticsearch

printf 'Waiting for Elasticsearch...\n'

sleep 30

# Generate & Export a random 32-character encryption key as an environment variable
export XPACK_ENCRYPTEDSAVEDOBJECTS_ENCRYPTIONKEY=$(openssl rand -base64 24)

# Generate the service token
response=$(curl -f -s -X POST -u "${ELASTIC_USERNAME}":"${ELASTIC_PASSWORD}" "http://localhost:9200/_security/service/elastic/kibana/credential/token/my_kibana_token" -H 'Content-Type: application/json')

# Extract & export the token from the response
export ELASTICSEARCH_SERVICEACCOUNTTOKEN=$(echo $response | jq -r '.token.value')

## Run docker-compose to start kibana container
docker-compose -f ../docker-compose.elasticsearch.yml up -d kibana
