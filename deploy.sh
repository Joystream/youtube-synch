#!/usr/bin/env bash
set -e

GREEN=$(tput setaf 2)
RED=$(tput setaf 1)
NC=$(tput sgr0)
# HIDE_OUTPUT=> /dev/null 2>&1
CONTAINER=ypp-localaws

# Export the env variables for child processes
source .env

# Run new AWS docker container only if its not running
if ! docker ps -a --format '{{.Names}}' | grep ${CONTAINER} >/dev/null; then

    if [[ "$ENV" == "local" ]]; then
        echo "${GREEN} Creating localstack aws services ${NC}"
        docker run --rm -d --name ${CONTAINER} -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack
    fi

    echo "${GREEN} Initializing pulumi stacks ${NC}"

    # Init common dev stack
    pulumi stack init ${ENV} --cwd packages/infrastructure >/dev/null 2>&1

    # Init monitoring dev stack
    pulumi stack init ${ENV} --cwd packages/monitor >/dev/null 2>&1
fi

#####################################
# Depolyment of common AWS resources
#####################################

if [[ "$RESOURCES" == "all" ]]; then
    echo "${GREEN}Deploying common resources for Youtube Partner Program & Syncing service${NC}"

    pulumi down --skip-preview --stack ${ENV} --cwd packages/infrastructure

    # Deploy the infracture resources
    pulumi up --skip-preview --stack ${ENV} --cwd packages/infrastructure
fi

######################################################
# Depolyment of youtube sync monitoring AWS resources
######################################################

echo "${GREEN} Building zip archives for Lambda functions ${NC}"
yarn nx run monitor:build >/dev/null 2>&1

echo "${GREEN} Deploying monitoring & syncing resources Youtube Syncing service ${NC}"
pulumi down --skip-preview --stack ${ENV} --cwd packages/monitor

# Deploy the infracture resources
pulumi up --skip-preview --stack ${ENV} --cwd packages/monitor
