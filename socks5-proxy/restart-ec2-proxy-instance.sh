#!/bin/bash

set -e

# This script is used to stop and start the EC2 machine, which automatically
# assigns a new IP address to EC@ machine and hence to socks5 proxy too.

set -a
if [ -f .env ]; then
    . .env
fi
set +a

# Set your EC2 Instance ID and region
INSTANCE_ID=$INSTANCE_ID

# Fingerprint (Key) needed to connect to the Chisel Sever by Chisel Client running on the client machine

# Stopping an instance
echo -e "Stopping EC2 proxy server instance... \n"
aws ec2 stop-instances --instance-ids $INSTANCE_ID
aws ec2 wait instance-stopped --instance-ids $INSTANCE_ID

# Starting an instance
echo -e "Starting EC2 proxy server instance... \n"
aws ec2 start-instances --instance-ids $INSTANCE_ID
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Fetch the current public IP of the EC2 instance
echo -e "Fetching new assigned IP address of proxy server instance... \n"
IP_ADDRESS=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query "Reservations[*].Instances[*].PublicIpAddress" --output text)

# Check if IP address is fetched
if [ -z "$IP_ADDRESS" ]; then
    echo "Failed to fetch IP address"
    exit 1
fi

sleep 30

# Export new IP address of ec2 instance to be used by chisel proxy client
export IP_ADDRESS=$IP_ADDRESS

# Restart the docker-compose chisel client service
echo -e "Reatarting Chisel Client... \n"
docker rm -f chisel-client
docker-compose -f ./docker-compose.chisel.yml up -d chisel-client
