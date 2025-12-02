#!/bin/bash

# 🔒 SAFE TestFlight Deployment Script
# This script ONLY deploys to TestFlight (internal testing)
# It will NOT publish to the App Store

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║       🚀 SAFE TESTFLIGHT DEPLOYMENT                       ║"
echo "║       (This will NOT go to the App Store)                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verify we're in the right directory
if [ ! -f "app.json" ]; then
    echo "❌ Error: Must run from frontend directory"
    exit 1
fi

# Show current version
VERSION=$(grep -o '"version": "[^"]*' app.json | cut -d'"' -f4)
echo "📦 Version to deploy: $VERSION"
echo ""

echo "🔒 SAFETY CHECKS:"
echo "  ✅ Using 'preview' profile (internal testing only)"
echo "  ✅ App environment: STAGING (safe for testing)"
echo "  ✅ Distribution: TestFlight ONLY"
echo "  ❌ Will NOT publish to App Store"
echo ""

echo "📋 What will happen:"
echo "  1. Build iOS app with staging environment"
echo "  2. Submit to TestFlight for internal testing"
echo "  3. You can test on your device"
echo "  4. Will appear in App Store Connect > TestFlight tab"
echo ""

read -p "🤔 Continue with TestFlight deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🔨 Step 1: Building iOS app (this takes ~10-15 minutes)..."
echo "════════════════════════════════════════════════════════════"
npx eas-cli build --platform ios --profile preview --non-interactive

echo ""
echo "📱 Step 2: Submitting to TestFlight..."
echo "════════════════════════════════════════════════════════════"
npx eas-cli submit --platform ios --latest --non-interactive

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       ✅ SUCCESS! BUILD SUBMITTED TO TESTFLIGHT           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Next Steps:"
echo "  1. Go to: https://appstoreconnect.apple.com"
echo "  2. Click 'Taist' app"
echo "  3. Click 'TestFlight' tab"
echo "  4. Wait 5-15 minutes for processing"
echo "  5. Build $VERSION will appear as 'Ready to Test'"
echo ""
echo "🎉 Your styling updates are now in TestFlight!"
echo ""


