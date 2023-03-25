#!/usr/bin/env bash
# set -e

GREEN=$(tput setaf 2)
RED=$(tput setaf 1)
NC=$(tput sgr0)
CONTAINER=ypp-localaws

# # Export the env variables for child processes
# source .env

set -a
if [ -f .env ]; then
    . .env
fi
set +a

# Run new AWS docker container only if its not running
if ! docker ps -a --format '{{.Names}}' | grep ${CONTAINER} >/dev/null; then
    if [[ "$DEPLOYMENT_ENV" == "local" ]]; then
        echo "${GREEN} Creating localstack aws services ${NC}"
        docker run --rm -d --name ${CONTAINER} -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack
    fi
fi

#####################################
# Depolyment of common AWS resources
#####################################

echo "${GREEN}Initializing common infrastructure stack${NC}"
pulumi stack init ${DEPLOYMENT_ENV} --cwd lib/infrastructure/pulumi >/dev/null 2>&1

echo "${GREEN}Deploying common resources for Youtube Partner Program & Syncing service${NC}"
pulumi up --skip-preview --stack ${DEPLOYMENT_ENV} --cwd lib/infrastructure/pulumi
