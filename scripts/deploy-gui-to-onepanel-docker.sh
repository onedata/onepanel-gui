#!/bin/bash

[ -z $ONEPANEL_SERVICE_TYPE ] && ONEPANEL_SERVICE_TYPE=onezone

[ -z $TMP_GUI_PARENT_DIR ] && TMP_GUI_PARENT_DIR=./tmp
TMP_GUI_DIR=${TMP_GUI_PARENT_DIR}/gui_static

DOCKER_ID=`docker ps | grep ${ONEPANEL_SERVICE_TYPE} | head -1 | cut -f1 -d" "`

DOCKER_GUI_PARENT_DIR=/root/bin/node/data
DOCKER_GUI_DIR=${DOCKER_GUI_PARENT_DIR}/gui_static

rm -r $TMP_GUI_DIR
echo "Copying dist to ${TMP_GUI_DIR}..."
cp -r dist $TMP_GUI_DIR &&
docker exec ${DOCKER_ID} rm -rf ${DOCKER_GUI_DIR} &&
echo "Copying ${TMP_GUI_DIR} to ${DOCKER_GUI_DIR} in ${DOCKER_ID} container..."
docker cp $TMP_GUI_DIR ${DOCKER_ID}:${DOCKER_GUI_PARENT_DIR} &&

echo "Deploying to ${SERVICE_NAME} done!"
