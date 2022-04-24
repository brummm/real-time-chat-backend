# Real Time Chat Backend
Real time chat API using socket.io (WIP)

## How to run
### DEV
Create a `/.env` file containing the parameteres needed for the project to run. A example of those parameters can be found at `./dev.env`.

Every time you run the `npm run dev` script `/.env` file is copied into `/dev.env` file.

## Deployment (AWS)
Add this script into the user data configuration:
```
#!/bin/bash
sudo apt update
sudo apt install -y ruby-full
sudo apt install -y wget
cd /home/ubuntu
wget https://aws-codedeploy-us-east-1.s3.amazonaws.com/latest/install
chmod +x ./install
sudo ./install auto > /tmp/logfile
```