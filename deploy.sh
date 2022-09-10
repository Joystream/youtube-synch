# Remove previously running AWS docker container & volume
docker rm -v ypp-localaws --force

# Run new AWS docker container
docker run --rm -d  --name ypp-localaws -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack


# Export the env variables for child processes
source .env        

#####################################
# Depolyment of common AWS resources
#####################################

# Remove previously created `dev` stack (if any) without removing corresponding .ymal file
pulumi stack rm dev --preserve-config --yes --force --cwd packages/infrastructure

# Init dev stack
pulumi stack init dev --cwd packages/infrastructure

# Deploy the infracture resources
pulumi up --skip-preview --stack dev --cwd packages/infrastructure


######################################################
# Depolyment of youtube sync monitoring AWS resources
######################################################

# Build zip archives for Lambda functions
yarn nx run monitor:build

# Remove previously created `dev` stack (if any) without removing corresponding .ymal file
pulumi stack rm dev --preserve-config --yes --force --cwd packages/monitor

# Init dev stack
pulumi stack init dev --cwd packages/monitor

# Deploy the infracture resources
pulumi up --skip-preview --stack dev --cwd packages/monitor
