# Build stage 1 - Install NPM dependencies
FROM node as deps
WORKDIR /usr/app
COPY ./package.json ./package.json
RUN npm install

# Build stage 2 - Copy over Site Server javascript and other misc. files.
FROM node as release
COPY ./index.js /server/index.js
COPY ./metadata.json /.exh/metadata.json
COPY --from=deps /usr/app/node_modules ./node_modules
CMD ["node", "/server/index.js"]