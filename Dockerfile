FROM node as build

ADD ./ /workspace

WORKDIR /workspace

RUN npm install

RUN npm run ncc

FROM node:slim

VOLUME '/var/log/webmon'
VOLUME '/etc/webmon'

COPY --from=build /workspace/dist/index.js /usr/lib/webmon.js
CMD node /usr/lib/webmon.js /etc/webmon/configuration.json