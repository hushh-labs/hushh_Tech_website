#!/bin/bash

# ============================================================================
# iOS TestFlight Deploy Script
# Hushh Technologies - Automated iOS Build & Upload
# ============================================================================
# Usage: ./scripts/ios-deploy.sh [options]
#
# Options:
#   --skip-build     Skip npm build (use existing dist/)
#   --skip-archive   Skip archiving (use existing .xcarchive)
#   --no-upload      Build only, don't upload to TestFlight
#   --help           Show this help message
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEAM_ID="WVDK9JW99C"
BUNDLE_ID="ai.hushh.app"
APP_NAME="Hushh - Data Privacy"

# Parse arguments
SKIP_BUILD=false
SKIP_ARCHIVE=false
NO_UPLOAD=false

for arg in "$@"; do
    case $arg in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-archive)
            SKIP_ARCHIVE=true
            shift
            ;;
        --no-upload)
            NO_UPLOAD=true
            shift
            ;;
        --help)
            head -20 "$0" | tail -15
            exit 0
            ;;
    esac
done

# Print header
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        🍎 iOS TestFlight Deploy - Hushh Technologies 🍎        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for required tools
echo -e "${YELLOW}🔍 Checking requirements...${NC}"

if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ xcodebuild not found. Please install Xcode.${NC}"
    exit 1
fi

if ! command -v xcrun &> /dev/null; then
    echo -e "${RED}❌ xcrun not found. Please install Xcode Command Line Tools.${NC}"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Please install Node.js.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required tools found${NC}"
echo ""

# Step 1: Build web app
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}📦 Step 1/5: Building web app...${NC}"
    npm run build
    echo -e "${GREEN}✅ Web build complete${NC}"
else
    echo -e "${YELLOW}⏭️  Step 1/5: Skipping web build (--skip-build)${NC}"
fi
echo ""

# Step 2: Sync to Capacitor
echo -e "${YELLOW}🔄 Step 2/5: Syncing to Capacitor iOS...${NC}"
npx cap sync ios
echo -e "${GREEN}✅ Capacitor sync complete${NC}"
echo ""

# Step 3: Archive
if [ "$SKIP_ARCHIVE" = false ]; then
    echo -e "${YELLOW}📱 Step 3/5: Creating Xcode archive...${NC}"
    echo "   This may take a few minutes..."
    
    cd ios/App
    
    # Clean build folder
    rm -rf build/App.xcarchive
    
    xcodebuild -workspace App.xcworkspace \
        -scheme App \
        -configuration Release \
        -archivePath build/App.xcarchive \
        archive \
        -quiet
    
    cd ../..
    echo -e "${GREEN}✅ Archive created${NC}"
else
    echo -e "${YELLOW}⏭️  Step 3/5: Skipping archive (--skip-archive)${NC}"
fi
echo ""

# Step 4: Export IPA
echo -e "${YELLOW}📤 Step 4/5: Exporting IPA...${NC}"

cd ios/App

# Clean export folder
rm -rf build/export

xcodebuild -exportArchive \
    -archivePath build/App.xcarchive \
    -exportPath build/export \
    -exportOptionsPlist ../ExportOptions.plist \
    -quiet

cd ../..

# Check IPA was created
if [ ! -f "ios/App/build/export/App.ipa" ]; then
    echo -e "${RED}❌ IPA file not found. Export failed.${NC}"
    exit 1
fi

IPA_SIZE=$(du -h ios/App/build/export/App.ipa | cut -f1)
echo -e "${GREEN}✅ IPA exported (${IPA_SIZE})${NC}"
echo "   Location: ios/App/build/export/App.ipa"
echo ""

# Step 5: Upload to TestFlight
if [ "$NO_UPLOAD" = true ]; then
    echo -e "${YELLOW}⏭️  Step 5/5: Skipping upload (--no-upload)${NC}"
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    🎉 BUILD COMPLETE! 🎉                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "IPA ready for manual upload: ios/App/build/export/App.ipa"
    echo ""
    echo "Upload options:"
    echo "  1. Xcode Organizer: Window → Organizer → Distribute App"
    echo "  2. Transporter app: Drag and drop the IPA"
    echo "  3. CLI: npm run ios:upload"
    exit 0
fi

echo -e "${YELLOW}🚀 Step 5/5: Uploading to TestFlight...${NC}"

# Check for API key configuration
# Try environment variables first, then fall back to common locations
API_KEY_ID="${APP_STORE_API_KEY_ID:-}"
ISSUER_ID="${APP_STORE_ISSUER_ID:-}"
KEY_PATH="${APP_STORE_KEY_PATH:-}"

# If not in env vars, try to find the key file
if [ -z "$API_KEY_ID" ]; then
    # Check common locations for .p8 files
    for dir in ~/.private_keys ~/.appstoreconnect/private_keys ./private_keys ~/private_keys; do
        if [ -d "$dir" ]; then
            P8_FILE=$(find "$dir" -name "AuthKey_*.p8" 2>/dev/null | head -1)
            if [ -n "$P8_FILE" ]; then
                # Extract key ID from filename
                API_KEY_ID=$(basename "$P8_FILE" | sed 's/AuthKey_//' | sed 's/.p8//')
                KEY_PATH="$dir"
                break
            fi
        fi
    done
fi

if [ -z "$API_KEY_ID" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  No API key found for automated upload.${NC}"
    echo ""
    echo "To enable automated uploads, set up your API key:"
    echo ""
    echo "Option 1: Environment variables"
    echo "  export APP_STORE_API_KEY_ID=\"YOUR_KEY_ID\""
    echo "  export APP_STORE_ISSUER_ID=\"YOUR_ISSUER_ID\""
    echo ""
    echo "Option 2: Place key file in ~/.private_keys/"
    echo "  ~/.private_keys/AuthKey_{KEY_ID}.p8"
    echo ""
    echo "See IOS_TESTFLIGHT_UPLOAD.md for detailed setup instructions."
    echo ""
    echo -e "${GREEN}✅ BUILD COMPLETE - Manual upload required${NC}"
    echo "   IPA location: ios/App/build/export/App.ipa"
    exit 0
fi

# Get issuer ID from env or prompt
if [ -z "$ISSUER_ID" ]; then
    echo -e "${YELLOW}⚠️  APP_STORE_ISSUER_ID not set.${NC}"
    echo "Please set it in your environment or .env.local file."
    echo ""
    echo "You can find it at:"
    echo "https://appstoreconnect.apple.com/access/api"
    echo ""
    echo -e "${GREEN}✅ BUILD COMPLETE - Manual upload required${NC}"
    echo "   IPA location: ios/App/build/export/App.ipa"
    exit 0
fi

echo "   Using API Key: $API_KEY_ID"
echo "   Uploading... (this may take several minutes)"
echo ""

xcrun altool --upload-app \
    -f ios/App/build/export/App.ipa \
    -t ios \
    --apiKey "$API_KEY_ID" \
    --apiIssuer "$ISSUER_ID"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 DEPLOYED TO TESTFLIGHT! 🎉                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "  1. Wait for Apple processing (10-30 minutes)"
echo "  2. You'll receive an email when ready"
echo "  3. Add testers in App Store Connect → TestFlight"
echo ""
echo "App Store Connect: https://appstoreconnect.apple.com"
echo ""
