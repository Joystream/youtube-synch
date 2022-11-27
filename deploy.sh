#!/usr/bin/env bash
# set -e

GREEN=$(tput setaf 2)
RED=$(tput setaf 1)
NC=$(tput sgr0)
# HIDE_OUTPUT=> /dev/null 2>&1
CONTAINER=ypp-localaws

# # Export the env variables for child processes
# source .env

set -a
. .env
if [ -f .env.prod ]; then
    . .env.prod
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
# Build lambda functions
#####################################

./build.sh

#####################################
# Depolyment of common AWS resources
#####################################

echo "${GREEN}Initializing common infrastructure stack${NC}"
pulumi stack init ${DEPLOYMENT_ENV} --cwd packages/infrastructure >/dev/null 2>&1

echo "${GREEN}Deploying common resources for Youtube Partner Program & Syncing service${NC}"
pulumi up --skip-preview --stack ${DEPLOYMENT_ENV} --cwd packages/infrastructure

######################################################
# Depolyment of youtube sync monitoring AWS resources
######################################################

if [[ "$RESOURCES" == "all" ]]; then
    echo "${GREEN}Initializing monitoring infrastructure stack${NC}"
    pulumi stack init ${DEPLOYMENT_ENV} --cwd packages/monitor >/dev/null 2>&1

    echo "${GREEN} Deploying monitoring & syncing resources Youtube Syncing service ${NC}"
    pulumi up --skip-preview --stack ${DEPLOYMENT_ENV} --cwd packages/monitor
fi
