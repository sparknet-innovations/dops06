#!/bin/bash

apt-get update -y
apt-get install -y docker.io docker-compose
systemctl enable docker
systemctl start docker

cat <<EOF > /home/azureuser/docker-compose.yml
version: '3'
services:
  backend:
    image: <dockerhub_username>/home-applience-backend:latest
    ports:
      - "5000:5000"

  frontend:
    image: <dockerhub_username>/home-applience-frontend:latest
    ports:
      - "80:80"
EOF

docker-compose up -d
