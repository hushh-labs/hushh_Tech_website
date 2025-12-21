#!/bin/bash

# ============================================
# iOS OTA (Over-The-Air) Update Deployment
# ============================================
# This script builds and deploys an OTA update bundle
# that iOS users will automatically download without
# needing to update through the App Store.
#
# Usage:
#   npm run ios:ota           # Deploy OTA update
#   npm run ios:ota -- --beta # Deploy to beta channel
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  iOS OTA Update Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Configuration
BUNDLE_VERSION=$(node -p "require('./package.json').version")
CHANNEL="${1:-production}"
BUILD_DIR="dist"
OTA_DIR="ota-bundles"
BUNDLE_NAME="bundle-${BUNDLE_VERSION}-$(date +%Y%m%d%H%M%S)"
BUNDLE_FILE="${OTA_DIR}/${BUNDLE_NAME}.zip"

# Create OTA bundles directory
mkdir -p ${OTA_DIR}

echo -e "\n${YELLOW}Step 1: Building production bundle...${NC}"
npm run build

if [ ! -d "${BUILD_DIR}" ]; then
    echo -e "${RED}ERROR: Build failed - dist folder not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build complete${NC}"

echo -e "\n${YELLOW}Step 2: Creating bundle archive...${NC}"

# Create the zip bundle
cd ${BUILD_DIR}
zip -r "../${BUNDLE_FILE}" .
cd ..

echo -e "${GREEN}✓ Bundle created: ${BUNDLE_FILE}${NC}"

# Get bundle size
BUNDLE_SIZE=$(ls -lh ${BUNDLE_FILE} | awk '{print $5}')
echo -e "   Bundle size: ${BUNDLE_SIZE}"

echo -e "\n${YELLOW}Step 3: Creating manifest file...${NC}"

# Create manifest JSON for the update
MANIFEST_FILE="${OTA_DIR}/manifest-${BUNDLE_VERSION}.json"
cat > ${MANIFEST_FILE} << EOF
{
  "version": "${BUNDLE_VERSION}",
  "channel": "${CHANNEL}",
  "bundleUrl": "https://hushh.ai/app-updates/${BUNDLE_NAME}.zip",
  "releaseNotes": "Bug fixes and improvements",
  "mandatory": false,
  "minAppVersion": "1.0.0",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "checksum": "$(shasum -a 256 ${BUNDLE_FILE} | cut -d ' ' -f 1)"
}
EOF

echo -e "${GREEN}✓ Manifest created: ${MANIFEST_FILE}${NC}"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}OTA Bundle Ready for Upload!${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Upload ${BUNDLE_FILE} to your CDN/Supabase Storage"
echo -e "2. Upload ${MANIFEST_FILE} or update your API endpoint"
echo -e "3. Users will automatically receive the update on next app launch"

echo -e "\n${YELLOW}Upload Commands (example using Supabase):${NC}"
echo -e "  supabase storage cp ${BUNDLE_FILE} ss://app-updates/"
echo -e "  supabase storage cp ${MANIFEST_FILE} ss://app-updates/"

echo -e "\n${YELLOW}Or using curl to your server:${NC}"
echo -e "  curl -X POST https://hushh.ai/api/app-updates/publish \\"
echo -e "    -F 'bundle=@${BUNDLE_FILE}' \\"
echo -e "    -F 'manifest=@${MANIFEST_FILE}'"

echo -e "\n${BLUE}Bundle Details:${NC}"
echo -e "  Version: ${BUNDLE_VERSION}"
echo -e "  Channel: ${CHANNEL}"
echo -e "  Size: ${BUNDLE_SIZE}"
echo -e "  Bundle: ${BUNDLE_FILE}"
echo -e "  Manifest: ${MANIFEST_FILE}"

echo -e "\n${GREEN}Done! 🚀${NC}"
