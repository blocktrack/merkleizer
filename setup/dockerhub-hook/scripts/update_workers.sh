#!/bin/sh
# Path needs to be mounted from host to container.
UPDATE_PATH=/blocktrack

cd ${UPDATE_PATH} && docker-compose pull worker_btc worker_mvs && docker-compose up -d worker_btc worker_mvs
