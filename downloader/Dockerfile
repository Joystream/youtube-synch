# syntax=docker/dockerfile:1
FROM node
WORKDIR /app
RUN apt-get update
RUN apt-get install -y python
COPY package.json /app
RUN npm i && npm cache clean --force
COPY /build /app
ENTRYPOINT [ "node",  "index.js" ]
CMD ["${videourl}"]
