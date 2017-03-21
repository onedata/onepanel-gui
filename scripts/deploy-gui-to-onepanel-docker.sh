#!/bin/bash

# TODO oneprovider/onezone switch
SERVICE_NAME=onezone

TMP_GUI_PARENT_DIR=./tmp
TMP_GUI_DIR=${TMP_GUI_PARENT_DIR}/gui_static

DOCKER_ID=`docker ps | grep ${SERVICE_NAME} | head -1 | cut -f1 -d" "`

rm -rf $TMP_GUI_DIR &&
cp -r dist $TMP_GUI_DIR &&
docker exec ${DOCKER_ID} rm -rf /root/bin/node/data/gui_static &&
docker cp $TMP_GUI_DIR ${DOCKER_ID}:/root/bin/node/data/ &&

echo "Deploying to ${SERVICE_NAME} done!"
