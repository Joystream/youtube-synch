# Use the specified image as base
FROM node:18

# Set the working directory to /youtube-synch
WORKDIR /youtube-synch

# Install AWS CLI
RUN apt-get update && \
    apt-get install -y awscli && \
    rm -rf /var/lib/apt/lists/*

# Copy the package.json and yarn.lock (or package-lock.json for npm) files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of your application
COPY . .

# Build the project
RUN yarn build

# Set the command to run when a container based on the image is started
CMD ["./bin/run", "start"]
