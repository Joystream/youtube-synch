#!/bin/bash

# This script is used to stop and start the EC2 machine, which automatically
# assigns a new IP address to EC2 machine and hence to socks5 proxy server too.

set -e

SCRIPT_PATH="$(dirname "${BASH_SOURCE[0]}")"
cd $SCRIPT_PATH

set -a
if [ -f .env ]; then
    . .env
fi
set +a

# Set your EC2 Instance ID and region
INSTANCE_ID=$INSTANCE_ID

# Stopping an instance
echo -e "Stopping EC2 proxy server instance... \n"
aws ec2 stop-instances --instance-ids $INSTANCE_ID
aws ec2 wait instance-stopped --instance-ids $INSTANCE_ID

# Starting an instance
echo -e "Starting EC2 proxy server instance... \n"
aws ec2 start-instances --instance-ids $INSTANCE_ID
aws ec2 wait instance-running --instance-ids $INSTANCE_ID

# Start proxy client
./start-proxy-client.sh
