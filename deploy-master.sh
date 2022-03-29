#!/bin/bash

echo "docker prd admin-web run start"

aws ecr get-login-password | docker login --username AWS --password-stdin 252464636547.dkr.ecr.ap-northeast-2.amazonaws.com/erp-front-backoffice

docker pull 252464636547.dkr.ecr.ap-northeast-2.amazonaws.com/erp-front-backoffice:latest

docker rm -f \
  $(docker ps -aq -f name=erp-front-backoffice)

#docker run -it -d --name "erp-front-backoffice" -p 80:80 -v /home/ec2-user/ssl:/etc/nginx/ssl -v /home/ec2-user/logs/access:/var/logs/access -v /home/ec2-user/logs/error:/var/logs/error 252464636547.dkr.ecr.ap-northeast-2.amazonaws.com/erp-front-backoffice:latest
docker run -it -d --name "erp-front-backoffice" -p 443:443 -p 80:80 -v /home/ec2-user/ssl:/etc/nginx/ssl -v /home/ec2-user/logs/access:/var/logs/access -v /home/ec2-user/logs/error:/var/logs/error 252464636547.dkr.ecr.ap-northeast-2.amazonaws.com/erp-front-backoffice:latest
#docker rmi $(docker image ls -f reference=252464636547.dkr.ecr.ap-northeast-2.amazonaws.com/erp-front-backoffice -q | tail -n $((7)))

echo "end"