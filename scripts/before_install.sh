#!/bin/bash

# install node and npm if they don't exist
if which node > /dev/null then
    echo "node is installed, skipping..."
else
  # using a snap package to install node at version 16
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
  . ~/.nvm/nvm.sh
  nvm install node
fi

DIR="/home/ec2-user/real-time-chat"
if [ -d "$DIR" ]; then
  echo "${DIR} exists."
else
  echo "Creating ${DIR} directory."
  mkdir ${DIR}
fi