#!/bin/bash -f

DOCKER_HUB_NAME=bkjeholt
PACKAGE_PATH=package.json
ARCHITECTURE=rpi
DOCKERFILE_PATH="Dockerfile-${ARCHITECTURE}"

PACKAGE_NAME=$(grep '"name"[ \t]*:' ${PACKAGE_PATH} | head -1 | sed 's/[ \t]*"name"[ \t]*:[ \t]*"//g' | sed 's/",[ \t\n]*//g')
PACKAGE_VERSION=$(grep '"version"[ \t]*:' ${PACKAGE_PATH} | head -1 | sed 's/[ \t]*"version"[ \t]*:[ \t]*"//g' | sed 's/",[ \t\n]*//g')

IMAGE_NAME="${DOCKER_HUB_NAME}/${PACKAGE_NAME}"

TAR_FILE_NAME="${PACKAGE_NAME}---${PACKAGE_VERSION}.tgz"

TAG_IDENTITY="${PACKAGE_VERSION}"
TAG_IDENTITY_WITH_ARCHITECTURE="${PACKAGE_VERSION}-${ARCHITECTURE}"

echo "------------------------------------------------------------------------"
echo "Build a container according to the package.json information "
echo "------------------------------------------------------------------------"
echo "-- Build:        ${PACKAGE_NAME} "
echo "-- Version:      ${PACKAGE_VERSION} "
echo "------------------------------------------------------------------------"
echo "-- Dockerfile:   ${DOCKERFILE_PATH} "
echo "-- Arch.:        ${ARCHITECTURE} "
echo "-- Package info: ${PACKAGE_PATH} "
echo "-- Image tag:    ${TAG_IDENTITY} "
echo "-- Image ext tag:${TAG_IDENTITY_WITH_ARCHITECTURE} "
echo "------------------------------------------------------------------------"

rm -f Dockerfile-tmp
cp ${DOCKERFILE_PATH} Dockerfile-tmp

docker build -f Dockerfile-tmp -t ${IMAGE_NAME}:${TAG_IDENTITY} -t ${IMAGE_NAME}:${TAG_IDENTITY_WITH_ARCHITECTURE} -t ${IMAGE_NAME}:latest .

echo "------------------------------------------------------------------------"
echo "-- Docker build ready "
echo "------------------------------------------------------------------------"
echo "-- Available images for package: ${PACKAGE_NAME} "
echo "-- and corresponding image:      ${IMAGE_NAME} "
echo "------------------------------------------------------------------------"

docker images ${IMAGE_NAME}

echo "------------------------------------------------------------------------"
echo "-- Push the image to repository "
echo "-- Repository:   ${IMAGE_NAME} "
echo "------------------------------------------------------------------------"
# echo "-- Push version:  ${TAG_IDENTITY} "
# echo "------------------------------------------------------------------------"
# 
# docker push ${IMAGE_NAME}:${TAG_IDENTITY}
# 
echo "------------------------------------------------------------------------"
echo "-- Push version:  ${TAG_IDENTITY_WITH_ARCHITECTURE} "
echo "------------------------------------------------------------------------"

docker push ${IMAGE_NAME}:${TAG_IDENTITY_WITH_ARCHITECTURE}

echo "------------------------------------------------------------------------"
echo "-- Push version:  latest "
echo "------------------------------------------------------------------------"

docker push ${IMAGE_NAME}:latest

echo "------------------------------------------------------------------------"
echo "-- The image is now stored in repository "
echo "------------------------------------------------------------------------"
echo "-- Store the development directories as an archive file "
echo "-- Archive file: ${TAR_FILE_NAME} "
echo "------------------------------------------------------------------------"

tar -czf ~/${TAR_FILE_NAME} .

../SupportFiles/DropBox/upload-archive.sh ~/${TAR_FILE_NAME} 
rm -f ~/${TAR_FILE_NAME}
echo "------------------------------------------------------------------------"


