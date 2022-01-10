#!bin/bash

echo "docker dev admin-web run start"
docker pull storedevcamera/admin-web:dev-latest

docker rm -f \
  $(docker ps -aq -f name=admin-web)

docker run -it -d --name "admin-web" \
  -p 9080:80 \
  storedevcamera/admin-web:dev-latest

#docker rmi $(docker image ls -f reference=storedevcamera/admin-server -q | tail -n $((7)))

echo "docker dev admin-web run complete A"
