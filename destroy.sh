# Remove previously created `dev` stack (if any) without removing corresponding .ymal file
pulumi stack rm dev --preserve-config --yes --force --cwd packages/infrastructure

# Remove previously created `dev` stack (if any) without removing corresponding .ymal file
pulumi stack rm dev --preserve-config --yes --force --cwd packages/monitor

# Remove the docker container
docker rm -v ypp-localaws --force >/dev/null 2>&1
