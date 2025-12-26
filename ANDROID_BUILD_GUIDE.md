# 🤖 Android Google Play Store Build Guide

## Overview

This guide explains how to build and deploy the Hushh app to Google Play Store.

## Prerequisites

1. **Google Play Developer Account** ($25 one-time fee)
   - Sign up at: https://play.google.com/console/signup

2. **Android Studio** (installed and configured)
   - Download: https://developer.android.com/studio

3. **Java Development Kit (JDK 17+)**
   - Android Studio includes this, but ensure it's in your PATH

4. **Release Keystore** (for signing the app)
   - See [Create Keystore](#step-1-create-signing-keystore) section below

---

## Quick Start

```bash
# One-command build for Play Store
npm run android:playstore
```

---

## Step-by-Step Guide

### Step 1: Create Signing Keystore

⚠️ **IMPORTANT**: Store your keystore safely! If you lose it, you cannot update your app.

```bash
# Create keystores directory
mkdir -p android/keystores

# Generate keystore (you'll be prompted for passwords)
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore android/keystores/hushh-release.keystore \
  -alias hushh-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

When prompted, enter:
- **Keystore password**: Choose a strong password
- **Key password**: Can be same as keystore password
- **Name**: Hushh Technologies
- **Organizational Unit**: Mobile Development
- **Organization**: Hushh Technologies
- **City**: San Francisco
- **State**: California
- **Country Code**: US

### Step 2: Configure Keystore Properties

```bash
# Copy the example file
cp android/keystore.properties.example android/keystore.properties
```

Edit `android/keystore.properties`:
```properties
storeFile=keystores/hushh-release.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=hushh-release
keyPassword=YOUR_KEY_PASSWORD
```

⚠️ **NEVER commit keystore.properties to git!**

### Step 3: Get SHA256 Fingerprint (for OAuth)

```bash
# Get the SHA256 fingerprint from your keystore
keytool -list -v -keystore android/keystores/hushh-release.keystore -alias hushh-release

# Look for: SHA256: XX:XX:XX:XX:...
```

### Step 4: Update assetlinks.json

Edit `public/.well-known/assetlinks.json` and replace `SHA256_FINGERPRINT_PLACEHOLDER` with your actual fingerprint:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "ai.hushh.app",
      "sha256_cert_fingerprints": [
        "XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"
      ]
    }
  }
]
```

### Step 5: Build the AAB

```bash
# Option 1: Use the automation script
npm run android:playstore

# Option 2: Manual build
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

The AAB file will be at:
- `android/app/build/outputs/bundle/release/app-release.aab`

---

## Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run android:sync` | Sync web assets to Android |
| `npm run android:open` | Open project in Android Studio |
| `npm run android:build` | Build web + sync to Android |
| `npm run android:playstore` | Full automation: build, sign, create AAB |
| `npm run android:debug` | Build debug APK |
| `npm run android:release` | Build release AAB only |

---

## Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)

2. **Create a new app** (if first time):
   - App name: Hushh - Data Privacy
   - Default language: English
   - App or game: App
   - Free or paid: Free

3. **Set up your app**:
   - Complete all required sections (store listing, content rating, etc.)
   - Add app icon, screenshots, description

4. **Create a release**:
   - Go to: Production → Create new release
   - Upload AAB file
   - Add release notes
   - Review and start rollout

---

## Android App Links (Deep Links)

For OAuth to work correctly, you need:

1. **assetlinks.json** deployed to your website:
   - URL: `https://www.hushhtech.com/.well-known/assetlinks.json`
   - This is created in `public/.well-known/assetlinks.json`

2. **AndroidManifest.xml** configured (already done by Capacitor):
   - Uses `https` scheme
   - Handles auth callback URLs

3. **Platform detection** in code:
   - `src/utils/platform.ts` handles Android detection
   - Uses production URL for OAuth redirects

---

## Troubleshooting

### Build Fails: "Could not find tools.jar"
```bash
# Ensure JAVA_HOME is set correctly
export JAVA_HOME=$(/usr/libexec/java_home)
```

### Build Fails: "SDK location not found"
```bash
# Create local.properties with SDK location
echo "sdk.dir=/Users/$USER/Library/Android/sdk" > android/local.properties
```

### Keystore Not Found
```bash
# Ensure keystore path is correct in keystore.properties
# Path should be relative to android/ directory
storeFile=keystores/hushh-release.keystore
```

### AAB Size Too Large
- Enable ProGuard minification (already configured)
- Use `shrinkResources true` (already configured)
- Check for large assets in `dist/`

---

## Version Management

The version is managed in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1       // Increment for each Play Store upload
    versionName "1.0.0" // Displayed to users
}
```

The `android:playstore` script auto-increments `versionCode`.

---

## Security Checklist

- [ ] Keystore stored securely (not in git)
- [ ] keystore.properties in .gitignore
- [ ] Strong passwords for keystore and key
- [ ] Backup keystore in secure location
- [ ] assetlinks.json deployed with correct fingerprint
- [ ] ProGuard enabled for release builds

---

## Related Documentation

- [iOS Build Guide](./IOS_BUILD_GUIDE.md)
- [iOS TestFlight Guide](./IOS_TESTFLIGHT_UPLOAD.md)
- [Capacitor Documentation](https://capacitorjs.com/docs/android)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

---

## Support

For issues with Android builds, check:
1. Android Studio Logcat
2. Gradle build output
3. Console errors during sync

🔗 **Google Play Console**: https://play.google.com/console
