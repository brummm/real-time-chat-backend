#!/bin/bash
DIR="/home/ec2-user/real-time-chat"
sudo chmod -R 777 ${DIR}
cd ${DIR}

npm install
npm run build

# start node app in the background
node ./dist/index.js > app.out.log 2> app.err.log < /dev/null &
