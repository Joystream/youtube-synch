#!/usr/bin/env bash

if [[ "$TELEMETRY_ENABLED" = "yes" ]]; then
    echo "Starting YouTube Sync Service with telemetry enabled..."
    node --require ./opentelemetry/index.js ./bin/run start $*
else
    ./bin/run start $*
fi
