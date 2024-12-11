FROM node:20-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production=true --ignore-scripts

COPY ./dist ./dist/

COPY .env ./

CMD [ "yarn", "start" ]
