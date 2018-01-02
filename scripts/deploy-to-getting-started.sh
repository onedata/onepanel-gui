#!/bin/bash

[ -z ${BUILD_DIR+x} ] && BUILD_DIR=./rel

[ -z ${TMP_GUI_PARENT_DIR+x} ] && TMP_GUI_PARENT_DIR=./src/tmp
TMP_GUI_DIR=${TMP_GUI_PARENT_DIR}/gui_static
[ -z ${TMP_GUI_PARENT_DIR_R+x} ] && TMP_GUI_PARENT_DIR_R=$TMP_GUI_PARENT_DIR
TMP_GUI_DIR_R=${TMP_GUI_PARENT_DIR_R}/gui_static

## PROVIDER PANEL

SERVICE_TYPE=provider
DOCKER_ID=`docker ps | grep ${SERVICE_TYPE} | head -1 | cut -f1 -d" "`
DOCKER_GUI_PARENT_DIR=/var/lib/op_panel
DOCKER_GUI_DIR=${DOCKER_GUI_PARENT_DIR}/gui_static

rm -r $TMP_GUI_DIR
echo "Copying ${BUILD_DIR} to ${TMP_GUI_DIR}..."
cp -r $BUILD_DIR $TMP_GUI_DIR &&
docker exec ${DOCKER_ID} rm -rf ${DOCKER_GUI_DIR} &&
echo "Copying ${TMP_GUI_DIR_R} to ${DOCKER_GUI_DIR} in ${DOCKER_ID} container..."
docker cp $TMP_GUI_DIR_R ${DOCKER_ID}:${DOCKER_GUI_PARENT_DIR} &&

echo "Deploying to ${SERVICE_TYPE} done!"

## ZONE PANEL

SERVICE_TYPE=zone
DOCKER_ID=`docker ps | grep ${SERVICE_TYPE} | head -1 | cut -f1 -d" "`
DOCKER_GUI_PARENT_DIR=/var/lib/oz_panel
DOCKER_GUI_DIR=${DOCKER_GUI_PARENT_DIR}/gui_static

rm -r $TMP_GUI_DIR
echo "Copying ${BUILD_DIR} to ${TMP_GUI_DIR}..."
cp -r $BUILD_DIR $TMP_GUI_DIR &&
docker exec ${DOCKER_ID} rm -rf ${DOCKER_GUI_DIR} &&
echo "Copying ${TMP_GUI_DIR_R} to ${DOCKER_GUI_DIR} in ${DOCKER_ID} container..."
docker cp $TMP_GUI_DIR_R ${DOCKER_ID}:${DOCKER_GUI_PARENT_DIR} &&


echo "Deploying to ${SERVICE_TYPE} done!"
