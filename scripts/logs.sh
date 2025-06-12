#!/bin/bash

CONTAINER_NAME=${1:-atproto-dashboard}
LINES=${2:-100}

echo "📋 Showing last $LINES lines of logs for $CONTAINER_NAME"

docker logs --tail $LINES -f $CONTAINER_NAME
