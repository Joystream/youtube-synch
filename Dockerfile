FROM node:14

# Set the working directory to /youtube-synch
WORKDIR /youtube-synch

# Copy the contents of the current directory to /youtube-synch
COPY . /youtube-synch

# Install dependencies
RUN yarn install

# Build the project
RUN yarn build

# Set the command to run when a container based on the image is started
CMD ["./bin/run", "start"]
