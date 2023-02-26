# Remove previously running AWS docker container & volume
docker rm -v ypp-localaws --force

# Run new AWS docker container
docker run --rm -d  --name ypp-localaws -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack


# Remove previously created `dev` stack (if any) without removing corresponding .ymal file
pulumi stack rm dev --preserve-config --yes --force

# Init dev stack
pulumi stack init dev

# Set region where AWS operations will take place.
pulumi config set aws:region us-east-1

# Deploy the infracture resources
pulumi up --skip-preview --stack dev
