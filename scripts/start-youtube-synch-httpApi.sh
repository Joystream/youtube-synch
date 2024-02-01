#!/usr/bin/env bash

if [[ "$TELEMETRY_ENABLED" = "yes" ]]; then
    node --require ./opentelemetry/index.js ./bin/run start $*
else
    echo "Starting YouTube Sync Service without telemetry..."
    ./bin/run start $*
fi
