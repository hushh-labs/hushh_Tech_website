#!/bin/bash

# ============================================================================
# Android Google Play Store Build Script
# Hushh Technologies - Build AAB for Play Store
# ============================================================================
# Usage: npm run android:playstore
#
# This script:
#   1. Builds the web app
#   2. Syncs to Capacitor Android
#   3. Auto-increments version code
#   4. Creates signed AAB (Android App Bundle)
#   5. Outputs ready-to-upload AAB file
# ============================================================================

set -e  # Exit on any error

# Set JAVA_HOME to Android Studio bundled JDK (macOS)
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BUNDLE_ID="ai.hushh.app"
APP_NAME="Hushh - Data Privacy"
PROJECT_DIR="android"
BUILD_GRADLE_PATH="${PROJECT_DIR}/app/build.gradle"
KEYSTORE_PROPS="${PROJECT_DIR}/app/keystore.properties"
OUTPUT_DIR="${PROJECT_DIR}/app/build/outputs/bundle/release"

# Print header
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🤖 Android Play Store Build - Hushh Technologies 🤖               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for required tools
echo -e "${YELLOW}🔍 Checking requirements...${NC}"

# Check if keystore.properties exists
if [ ! -f "$KEYSTORE_PROPS" ]; then
    echo -e "${RED}❌ keystore.properties not found at $KEYSTORE_PROPS${NC}"
    echo ""
    echo "To create a keystore, run:"
    echo "  keytool -genkeypair -v -storetype PKCS12 -keystore android/keystores/hushh-release.keystore -alias hushh-release -keyalg RSA -keysize 2048 -validity 10000"
    echo ""
    echo "Then copy android/keystore.properties.example to android/keystore.properties and fill in the values."
    exit 1
fi

echo -e "${GREEN}✅ keystore.properties found${NC}"
echo ""

# Function to get current version code
get_version_code() {
    grep "versionCode " "$BUILD_GRADLE_PATH" | head -1 | sed 's/.*versionCode //' | tr -d ' '
}

# Function to get current version name
get_version_name() {
    grep "versionName " "$BUILD_GRADLE_PATH" | head -1 | sed 's/.*versionName "//' | sed 's/".*//'
}

# Function to increment version code
increment_version_code() {
    local current=$(get_version_code)
    local new=$((current + 1))
    
    # Replace version code in build.gradle
    sed -i '' "s/versionCode ${current}/versionCode ${new}/" "$BUILD_GRADLE_PATH"
    
    echo "$new"
}

# Step 1: Build web app
echo -e "${YELLOW}📦 Step 1/5: Building web app...${NC}"
npm run build
echo -e "${GREEN}✅ Web build complete${NC}"
echo ""

# Step 2: Sync to Capacitor
echo -e "${YELLOW}🔄 Step 2/5: Syncing to Capacitor Android...${NC}"
npx cap sync android
echo -e "${GREEN}✅ Capacitor sync complete${NC}"
echo ""

# Step 3: Auto-increment version code
echo -e "${YELLOW}🔢 Step 3/5: Incrementing version code...${NC}"
OLD_VERSION=$(get_version_code)
NEW_VERSION=$(increment_version_code)
VERSION_NAME=$(get_version_name)
echo -e "${GREEN}✅ Version: ${VERSION_NAME} (${OLD_VERSION} → ${NEW_VERSION})${NC}"
echo ""

# Step 4: Build release AAB
echo -e "${YELLOW}📱 Step 4/5: Building release AAB...${NC}"
echo "   This may take 2-5 minutes..."

cd "$PROJECT_DIR"

# Clean and build
./gradlew clean bundleRelease

cd ..

# Check if AAB was created
AAB_FILE="${OUTPUT_DIR}/app-release.aab"
if [ ! -f "$AAB_FILE" ]; then
    echo -e "${RED}❌ AAB file not found. Build failed.${NC}"
    exit 1
fi

AAB_SIZE=$(du -h "$AAB_FILE" | cut -f1)
echo -e "${GREEN}✅ AAB built (${AAB_SIZE})${NC}"
echo ""

# Step 5: Copy to output location
echo -e "${YELLOW}📤 Step 5/5: Preparing output...${NC}"

# Create release folder
RELEASE_DIR="releases/android"
mkdir -p "$RELEASE_DIR"

# Copy AAB with version name
RELEASE_AAB="${RELEASE_DIR}/hushh-v${VERSION_NAME}-${NEW_VERSION}.aab"
cp "$AAB_FILE" "$RELEASE_AAB"

echo -e "${GREEN}✅ AAB copied to ${RELEASE_AAB}${NC}"
echo ""

# Success message
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           🎉 BUILD ${NEW_VERSION} READY FOR PLAY STORE! 🎉              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "📋 Summary:"
echo "   • Version Name: ${VERSION_NAME}"
echo "   • Version Code: ${NEW_VERSION}"
echo "   • AAB Size: ${AAB_SIZE}"
echo "   • Bundle ID: ${BUNDLE_ID}"
echo ""
echo "📁 Output Files:"
echo "   • ${AAB_FILE}"
echo "   • ${RELEASE_AAB}"
echo ""
echo "📱 Next Steps:"
echo "   1. Go to Google Play Console: https://play.google.com/console"
echo "   2. Select your app or create a new one"
echo "   3. Go to 'Production' > 'Create new release'"
echo "   4. Upload the AAB file: ${RELEASE_AAB}"
echo "   5. Fill in release notes and submit for review"
echo ""
echo "🔗 Google Play Console: https://play.google.com/console"
echo ""
