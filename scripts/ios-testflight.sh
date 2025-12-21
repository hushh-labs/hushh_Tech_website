#!/bin/bash

# ============================================================================
# iOS TestFlight Full Automation Script
# Hushh Technologies - One Command Deploy to TestFlight
# ============================================================================
# Usage: npm run ios:testflight
#
# This script:
#   1. Builds the web app
#   2. Syncs to Capacitor iOS
#   3. Auto-increments build number
#   4. Creates Xcode archive
#   5. Exports IPA
#   6. Uploads to TestFlight automatically
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration - App Store Connect
API_KEY_ID="2P753XQ823"
ISSUER_ID="c4ac9023-32d3-4d1b-98c1-2a299f1ac957"
PRIVATE_KEY_PATH="$HOME/.private_keys/AuthKey_${API_KEY_ID}.p8"

# iOS Configuration
TEAM_ID="WVDK9JW99C"
BUNDLE_ID="ai.hushh.app"
APP_NAME="Hushh - Data Privacy"
PROJECT_DIR="ios/App"
PBXPROJ_PATH="${PROJECT_DIR}/App.xcodeproj/project.pbxproj"

# Print header
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║    🚀 iOS TestFlight Full Automation - Hushh Technologies 🚀        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for required tools
echo -e "${YELLOW}🔍 Checking requirements...${NC}"

if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ xcodebuild not found. Please install Xcode.${NC}"
    exit 1
fi

if [ ! -f "$PRIVATE_KEY_PATH" ]; then
    echo -e "${RED}❌ API Key not found at $PRIVATE_KEY_PATH${NC}"
    echo "   Please copy your AuthKey_${API_KEY_ID}.p8 to ~/.private_keys/"
    exit 1
fi

echo -e "${GREEN}✅ All requirements satisfied${NC}"
echo ""

# Function to get current build number
get_build_number() {
    grep -m 1 "CURRENT_PROJECT_VERSION = " "$PBXPROJ_PATH" | sed 's/.*= //' | sed 's/;.*//'
}

# Function to increment build number
increment_build_number() {
    local current=$(get_build_number)
    local new=$((current + 1))
    
    # Replace all occurrences of CURRENT_PROJECT_VERSION
    sed -i '' "s/CURRENT_PROJECT_VERSION = ${current}/CURRENT_PROJECT_VERSION = ${new}/g" "$PBXPROJ_PATH"
    
    echo "$new"
}

# Step 1: Build web app
echo -e "${YELLOW}📦 Step 1/6: Building web app...${NC}"
npm run build
echo -e "${GREEN}✅ Web build complete${NC}"
echo ""

# Step 2: Sync to Capacitor
echo -e "${YELLOW}🔄 Step 2/6: Syncing to Capacitor iOS...${NC}"
npx cap sync ios
echo -e "${GREEN}✅ Capacitor sync complete${NC}"
echo ""

# Step 3: Auto-increment build number
echo -e "${YELLOW}🔢 Step 3/6: Incrementing build number...${NC}"
OLD_BUILD=$(get_build_number)
NEW_BUILD=$(increment_build_number)
echo -e "${GREEN}✅ Build number: ${OLD_BUILD} → ${NEW_BUILD}${NC}"
echo ""

# Step 4: Create Xcode archive
echo -e "${YELLOW}📱 Step 4/6: Creating Xcode archive...${NC}"
echo "   This may take 3-5 minutes..."

cd "$PROJECT_DIR"

# Clean and archive
rm -rf build/App.xcarchive

xcodebuild -project App.xcodeproj \
    -scheme App \
    -configuration Release \
    -destination 'generic/platform=iOS' \
    -archivePath build/App.xcarchive \
    archive \
    -quiet

cd ../..
echo -e "${GREEN}✅ Archive created${NC}"
echo ""

# Step 5: Export IPA
echo -e "${YELLOW}📤 Step 5/6: Exporting IPA...${NC}"

cd "$PROJECT_DIR"

rm -rf build/export

xcodebuild -exportArchive \
    -archivePath build/App.xcarchive \
    -exportPath build/export \
    -exportOptionsPlist ../ExportOptions.plist \
    -quiet

cd ../..

# Check IPA was created
if [ ! -f "${PROJECT_DIR}/build/export/App.ipa" ]; then
    echo -e "${RED}❌ IPA file not found. Export failed.${NC}"
    exit 1
fi

IPA_SIZE=$(du -h "${PROJECT_DIR}/build/export/App.ipa" | cut -f1)
echo -e "${GREEN}✅ IPA exported (${IPA_SIZE})${NC}"
echo ""

# Step 6: Upload to TestFlight
echo -e "${YELLOW}🚀 Step 6/6: Uploading to TestFlight...${NC}"
echo "   API Key: ${API_KEY_ID}"
echo "   Issuer: ${ISSUER_ID:0:8}..."
echo "   Uploading... (this may take 5-10 minutes)"
echo ""

xcrun altool --upload-app \
    -f "${PROJECT_DIR}/build/export/App.ipa" \
    -t ios \
    --apiKey "$API_KEY_ID" \
    --apiIssuer "$ISSUER_ID"

UPLOAD_STATUS=$?

if [ $UPLOAD_STATUS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           🎉 BUILD ${NEW_BUILD} DEPLOYED TO TESTFLIGHT! 🎉              ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "📋 Summary:"
    echo "   • Build Number: ${NEW_BUILD}"
    echo "   • IPA Size: ${IPA_SIZE}"
    echo "   • Bundle ID: ${BUNDLE_ID}"
    echo ""
    echo "📱 Next Steps:"
    echo "   1. Wait for Apple processing (10-30 minutes)"
    echo "   2. You'll receive an email when ready"
    echo "   3. Check TestFlight in App Store Connect"
    echo ""
    echo "🔗 App Store Connect: https://appstoreconnect.apple.com"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Upload failed with status: ${UPLOAD_STATUS}${NC}"
    echo "   Check the error message above."
    echo "   IPA is saved at: ${PROJECT_DIR}/build/export/App.ipa"
    exit 1
fi
