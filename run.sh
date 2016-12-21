#!/bin/sh -f
DOCKER_IMAGE_NAME=bkjeholt/mqtt-agent-onewire-${1}-rpi
DOCKER_CONTAINER_NAME=hic-agent-onewire

echo "------------------------------------------------------------------------"
echo "-- Run image:       $DOCKER_IMAGE_NAME:latest "

# DOCKER_IMAGE=$(../SupportFiles/DockerSupport/get-latest-image-string.sh $DOCKER_IMAGE_NAME)

echo "------------------------------------------------------------------------"
echo "-- Remove docker container if it exists"
echo "-- Container:   $DOCKER_CONTAINER_NAME "
echo "------------------------------------------------------------------------"

docker rm -f $DOCKER_CONTAINER_NAME

echo "------------------------------------------------------------------------"
echo "-- Start container "
echo "-- Based on image: $DOCKER_IMAGE-NAME "
echo "------------------------------------------------------------------------"

docker run -d \
           --restart="always" \
           --link mqtt-broker:mqtt \
           --privileged \
           --device /dev:/dev \
           --name $DOCKER_CONTAINER_NAME \
           $DOCKER_IMAGE-NAME

