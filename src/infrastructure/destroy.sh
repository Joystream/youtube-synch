#!/usr/bin/env bash

set -a
. .env
set +a

pulumi down --skip-preview --stack ${DEPLOYMENT_ENV} --cwd lib/infrastructure/pulumi

if [[ "$DEPLOYMENT_ENV" == "local" ]]; then
    # Remove previously created stack (if any) without removing corresponding .ymal file
    pulumi stack rm ${DEPLOYMENT_ENV} --preserve-config --yes --force --cwd lib/infrastructure/pulumi

    # Remove the docker container
    docker rm -v ypp-localaws --force >/dev/null
fi
