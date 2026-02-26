ARG NODE_VERSION="20.18.0"
ARG ALPINE_VERSION="3.19"

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS base

WORKDIR /home/app
COPY . .
RUN npm set progress=false && npm config set depth 0 && npm install
RUN npm run build

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION}
USER node
WORKDIR /home/node
COPY --from=base /home/app/ ./

ENV NODE_ENV=production
ENTRYPOINT ["npm", "run", "start", "--workspace=@repo/rest-server"]
