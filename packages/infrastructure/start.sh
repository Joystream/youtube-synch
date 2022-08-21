docker rm -v ypp-localaws --force

docker run --rm -d  --name ypp-localaws -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack


# Remove previously created `dev` stack (if any) without removing corresponding .ymal file
pulumi stack rm dev --preserve-config --yes --force

# Init dev stack
pulumi stack init dev

# Deploy the infracture resources
pulumi up --skip-preview --stack dev



# pulumi down --skip-preview --stack dev

# docker run --rm -it -v ypp_localaws_data:/var/lib/localstack --name ypp-localaws -p 4566:4566 -p 4510-4559:4510-4559 localstack/localstack
