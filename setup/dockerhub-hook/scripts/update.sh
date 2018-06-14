#!/bin/sh
# Path needs to be mounted from host to container.
UPDATE_PATH=/blocktrack

cd ${UPDATE_PATH} && docker-compose pull $1 && docker-compose up -d
