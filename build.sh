#!/bin/sh

# If applicable, download the latest and greatest files from Dropbox

../SupportFiles/DropBox/download.sh

# Start the build

../SupportFiles/DockerSupport/build.sh Dockerfile-armv7l bkjeholt

