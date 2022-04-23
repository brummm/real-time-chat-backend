#!/bin/bash

curl --silent --location https://rpm.nodesource.com/setup_16.x | bash -
yum -y install nodejs

DIR="/home/ec2-user/real-time-chat"
if [ -d "$DIR" ]; then
  echo "${DIR} exists."
else
  echo "Creating ${DIR} directory."
  mkdir ${DIR}
fi