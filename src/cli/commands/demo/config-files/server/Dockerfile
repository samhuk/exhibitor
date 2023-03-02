FROM node as deps
WORKDIR /usr/app
COPY ./package.json ./package.json
RUN npm install

FROM node as release
COPY ./ /server
COPY --from=deps /usr/app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "/server/index.js"]