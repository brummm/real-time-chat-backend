#!/bin/bash

# install node
sudo apt install -y gcc-c++ make
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 18
nvm alias default 18.0.0



DIR="/var/www/html"
if [ -d "$DIR" ]; then
  echo "${DIR} exists."
else
  echo "Creating ${DIR} directory."
  mkdir ${DIR}
fi