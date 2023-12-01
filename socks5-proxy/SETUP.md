# SETUP.md

## Overview

This setup is designed to automate the restarting of an Amazon EC2 instance and update a Docker Compose deployment with the new IP address of the EC2 instance. The Docker Compose setup runs a Chisel client which connects to a Chisel server hosted on the EC2 instance.

## Components

1. **Amazon EC2 Instance**: A server that will be stopped and started by the script running on the client machine, resulting in a new public IP address assignment of EC2 proxy server instance.

2. **Chisel**: A fast TCP tunnel over HTTP. In this setup, a Chisel client is run in a Docker container, which connects to a Chisel server running on the EC2 instance.

3. **Docker and Docker Compose**: Used to manage the Chisel client container.

4. **Bash Script (`start-proxy-client.sh`)**: A script to start to Chisel proxy client on the client machine.

5. **Bash Script (`restart-ec2-proxy-instance.sh`)**: A script to automate the stopping and starting of the EC2 instance where Chisel server is running and updating the Docker Compose configuration with the new IP address.

6. **Docker Compose File (`docker-compose.chisel.yml`)**: Configuration file for Docker Compose to set up the Chisel client.

## System Requirements

- **AWS CLI**: Command line tool for interacting with AWS services.
- **Docker**: Platform for developing, shipping, and running applications.
- **Docker Compose**: Tool for defining and running multi-container Docker applications.

## Installation & Configuration

### AWS CLI

1. **Install AWS CLI**: Follow the instructions on the [AWS CLI installation page](https://aws.amazon.com/cli/).
2. **Configure AWS CLI**: Run `aws configure` and enter your AWS credentials (Access Key ID, Secret Access Key) and default region.

### Bash Script Configuration

1. Create a `.env` file in the same directory as the `restart-ec2-proxy-instance.sh` & `start-proxy-client.sh` script with your EC2 instance ID and the Chisel server's fingerprint. For example:

   ```
   INSTANCE_ID="EC2_INSTANCE_ID"
   CHISEL_SERVER_FINGERPRINT="CHISEL_SERVER_FINGERPRINT" (see below for instructions on how to retrieve the fingerprint)

   ```

2. Make the scripts executable:
   ```bash
   chmod +x restart-ec2-proxy-instance.sh
   chmod +x start-proxy-client.sh
   ```

### Starting Chisel Server on EC2 Instance

To run the Chisel server on the EC2 instance, execute the following Docker command. This command starts a Chisel server Docker container that listens on port 8080.

```bash
docker run -d --name chisel-server -p 8080:8080 --restart=always jpillora/chisel server --key 'random-key' --port 8080 --socks5
```

Where `--key` is a string to seed the generation of a ECDSA public and private key pair. All communications will be secured using this key pair.

After starting the Chisel server, you can retrieve the server's fingerprint by inspecting the docker-compose logs:

```bash
docker logs chisel-server
```

Copy the fingerprint and add it to the `.env` file for `CHISEL_SERVER_FINGERPRINT` env var.

### Starting Chisel Client on Client Machine

To start the Chisel client on the client machine, execute the following command:

```bash
./start-proxy-client.sh
```
