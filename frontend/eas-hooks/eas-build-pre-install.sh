#!/usr/bin/env bash

# EAS Build Pre-install Hook
# Ensures GoogleService-Info.plist is in the correct location

set -e

echo "🔧 EAS Hook: Copying GoogleService-Info.plist to iOS project..."

# Copy from frontend root to ios/Taist folder if needed
if [ -f "GoogleService-Info.plist" ] && [ -d "ios/Taist" ]; then
  cp -f GoogleService-Info.plist ios/Taist/GoogleService-Info.plist
  echo "✅ GoogleService-Info.plist copied successfully"
else
  echo "⚠️  GoogleService-Info.plist or ios/Taist directory not found"
fi

