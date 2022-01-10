#!bin/bash

echo "docker admin run start"
docker pull storedevcamera/admin-nginx

docker rm -f \
  $(docker ps -aq -f name=admin-nginx)

docker run -it -d --name "admin-nginx" \
  -p 9080:80 \
  storedevcamera/admin-nginx

#docker rmi $(docker image ls -f reference=storedevcamera/admin-server -q | tail -n $((7)))

echo "docker admin-nginx run complete A"
