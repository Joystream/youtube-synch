pulumi down --skip-preview --stack ${ENV} --cwd packages/infrastructure

pulumi down --skip-preview --stack ${ENV} --cwd packages/monitor

if [[ "$ENV" == "local" ]]; then
    # Remove the docker container
    docker rm -v ypp-localaws --force >/dev/null
fi

# # Remove previously created `dev` stack (if any) without removing corresponding .ymal file
# pulumi stack rm dev --preserve-config --yes --force --cwd packages/infrastructure

# # Remove previously created `dev` stack (if any) without removing corresponding .ymal file
# pulumi stack rm dev --preserve-config --yes --force --cwd packages/monitor
