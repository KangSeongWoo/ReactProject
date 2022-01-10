#!bin/bash

echo "docker prd admin-web run start"
docker pull storedevcamera/admin-web:prd-latest

docker rm -f \
  $(docker ps -aq -f name=admin-web)

docker run -it -d --name "admin-web" \
  -p 9080:80 \
  storedevcamera/admin-web:prd-latest
##
#docker rmi $(docker image ls -f reference=storedevcamera/admin-server -q | tail -n $((7)))

echo "docker prd admin-web run complete A"
