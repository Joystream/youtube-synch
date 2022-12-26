#!/usr/bin/env bash

set -a
. .env
set +a

pulumi down --skip-preview --stack ${DEPLOYMENT_ENV} --cwd packages/infrastructure

pulumi down --skip-preview --stack ${DEPLOYMENT_ENV} --cwd packages/monitor

if [[ "$DEPLOYMENT_ENV" == "local" ]]; then
    # Remove previously created stack (if any) without removing corresponding .ymal file
    pulumi stack rm ${DEPLOYMENT_ENV} --preserve-config --yes --force --cwd packages/infrastructure

    # Remove previously created stack (if any) without removing corresponding .ymal file
    pulumi stack rm ${DEPLOYMENT_ENV} --preserve-config --yes --force --cwd packages/monitor

    # Remove the docker container
    docker rm -v ypp-localaws --force >/dev/null
fi
