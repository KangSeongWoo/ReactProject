#!bin/bash

echo "docker stg admin-web run start"
docker pull storedevcamera/admin-web:stg-latest

docker rm -f \
  $(docker ps -aq -f name=admin-web)

docker run -it -d --name "admin-web" \
  -p 9080:80 \
  storedevcamera/admin-web:stg-latest

#docker rmi $(docker image ls -f reference=storedevcamera/admin-server -q | tail -n $((7)))

echo "docker stg admin-web run complete A"
