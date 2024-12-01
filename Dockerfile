# Use the specified image as base
FROM node:20

# Set the working directory to /youtube-synch
WORKDIR /youtube-synch

ENV DEBIAN_FRONTEND=noninteractive

# Install AWS CLI
RUN apt-get update && \
    apt-get install -y awscli && \
    rm -rf /var/lib/apt/lists/*

# Install Docker manually
RUN curl -fsSL https://get.docker.com -o get-docker.sh && \
    sh get-docker.sh && \
    rm get-docker.sh

# Install node-gyp
RUN npm install -g node-gyp

# Install proxychains
RUN apt-get update && apt-get install -y proxychains4

# Copy the package.json and yarn.lock (or package-lock.json for npm) files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

# Build the project
RUN npm run build

# Set the command to run when a container based on the image is started
CMD ["./scripts/start-youtube-synch.sh"]
