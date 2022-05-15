FROM node:16-alpine3.12

ARG NODE_ENV
WORKDIR /usr/app

COPY package*.json ./

COPY . .

RUN npm i -g typescript && npm install

EXPOSE ${PORT}

CMD ["npm", "run", "start_within_container"]
