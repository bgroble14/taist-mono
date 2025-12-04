#!/bin/bash

# Sync version from frontend/app.json to backend/VERSION
# Run this script whenever you update the version in app.json

FRONTEND_APP_JSON="frontend/app.json"
BACKEND_VERSION="backend/VERSION"

if [ ! -f "$FRONTEND_APP_JSON" ]; then
    echo "Error: $FRONTEND_APP_JSON not found"
    exit 1
fi

# Extract version from app.json
VERSION=$(node -e "const fs = require('fs'); const json = JSON.parse(fs.readFileSync('$FRONTEND_APP_JSON', 'utf8')); console.log(json.expo.version);")

if [ -z "$VERSION" ]; then
    echo "Error: Could not extract version from $FRONTEND_APP_JSON"
    exit 1
fi

# Write to backend/VERSION
echo "$VERSION" > "$BACKEND_VERSION"
echo "✅ Synced version $VERSION from $FRONTEND_APP_JSON to $BACKEND_VERSION"

