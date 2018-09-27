FROM node:10.11.0-alpine as build

COPY package.json package-lock.json /app/

WORKDIR /app

RUN npm ci

COPY webpack.config.js /app/
COPY src/client /app/src/client

ENV NODE_ENV=production
RUN npm run build

FROM node:10.11.0-alpine

COPY package.json package-lock.json /app/

WORKDIR /app

ENV NODE_ENV=production

RUN npm ci

COPY . /app
COPY --from=build /app/public/ /app/public/

EXPOSE 3000

ENV DEBUG=nand:*

CMD ["node", "bin/www"]
