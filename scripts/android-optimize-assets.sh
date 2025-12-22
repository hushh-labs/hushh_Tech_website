#!/bin/bash
# Optimize Android assets by removing large files that should be loaded from CDN

ASSETS_DIR="android/app/src/main/assets/public"

echo "🔍 Current assets size:"
du -sh "$ASSETS_DIR"

echo ""
echo "🗑️  Removing large video files (MP4s)..."
find "$ASSETS_DIR" -name "*.mp4" -type f -delete
find "$ASSETS_DIR" -name "*.MP4" -type f -delete

echo "🗑️  Removing large GIF files (>5MB)..."
find "$ASSETS_DIR" -name "*.gif" -type f -size +5M -delete

echo "🗑️  Removing PDF files (load from web)..."
find "$ASSETS_DIR" -name "*.pdf" -type f -delete
find "$ASSETS_DIR" -name "*.PDF" -type f -delete

echo "🗑️  Removing oversized images (>3MB)..."
find "$ASSETS_DIR" -name "*.jpg" -type f -size +3M -delete
find "$ASSETS_DIR" -name "*.jpeg" -type f -size +3M -delete
find "$ASSETS_DIR" -name "*.png" -type f -size +3M -delete
find "$ASSETS_DIR" -name "*.JPG" -type f -size +3M -delete
find "$ASSETS_DIR" -name "*.PNG" -type f -size +3M -delete

echo ""
echo "✅ After optimization:"
du -sh "$ASSETS_DIR"

echo ""
echo "📊 Remaining large files (>1MB):"
find "$ASSETS_DIR" -type f -size +1M -exec du -sh {} \; 2>/dev/null | sort -rh | head -20
