#!/bin/bash

# install node
sudo yum install -y gcc-c++ make
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 18
nvm alias default 18.0.0

# install mongo
sudo tee -a /etc/yum.repos.d/mongodb-org-5.0.repo <<EOF
[mongodb-org-5.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc
EOF

sudo yum install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod


DIR="/home/ec2-user/real-time-chat"
if [ -d "$DIR" ]; then
  echo "${DIR} exists."
else
  echo "Creating ${DIR} directory."
  mkdir ${DIR}
fi