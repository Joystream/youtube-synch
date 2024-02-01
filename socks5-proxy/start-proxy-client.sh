#!/bin/bash

set -e

SCRIPT_PATH="$(dirname "${BASH_SOURCE[0]}")"
cd $SCRIPT_PATH

set -a
if [ -f .env ]; then
    . .env
fi
set +a

# Fetch the current public IP of the EC2 instance
echo -e "Fetching new assigned IP address of proxy server instance... \n"
IP_ADDRESS=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query "Reservations[*].Instances[*].PublicIpAddress" --output text)

# Check if IP address is fetched
if [ -z "$IP_ADDRESS" ]; then
    echo "Failed to fetch IP address"
    exit 1
fi

# Export new IP address of ec2 instance to be used by chisel proxy client
export IP_ADDRESS=$IP_ADDRESS

# Restart the docker-compose chisel client service
echo -e "Restarting Chisel Client... \n"
docker rm -f chisel-client || true

export COMPOSE_HTTP_TIMEOUT=120 # Increase to 120 seconds
docker compose -f ./docker-compose.chisel.yml up -d chisel-client
