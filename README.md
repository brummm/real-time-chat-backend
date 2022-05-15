# Real Time Chat Backend
Real time chat API using socket.io

## How to run
### DEV
Create a `/.env` file containing the parameteres needed for the project to run. A example of those parameters can be found at `./dev.env`.

Every time you run the `npm run dev` script `/.env` file is copied into `/dev.env` file.

## Deployment

The deployment is currently being made at Heroku using github actions.

The Docker file within this repo is only used into Heroku (but it could be used as a development machine as well).