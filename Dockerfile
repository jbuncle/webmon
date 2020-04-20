FROM node as build

ADD ./ /workspace

WORKDIR /workspace

RUN npm install

RUN npm run ncc

FROM node
COPY --from=build /workspace/dist/index.js /usr/lib/webmon.js
CMD node /usr/lib/webmon.js