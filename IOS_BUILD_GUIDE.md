# iOS Build Guide - Hushh Technologies

## 📱 App Configuration

| Setting | Value |
|---------|-------|
| **App Name** | Hushh Technologies |
| **Bundle ID** | ai.hushh.app |
| **Team ID** | WVDK9JW99C |
| **Team Name** | HushOne, Inc. |

---

## ✅ Setup Completed (Automated)

- [x] Capacitor installed and configured
- [x] iOS platform added
- [x] Web assets synced to iOS
- [x] Team ID configured in Xcode project
- [x] ExportOptions.plist created for TestFlight

---

## 🔧 Xcode Setup (Manual - One Time)

Xcode should now be open. Complete these steps:

### Step 1: Verify Signing Configuration
1. Click on **App** in the left sidebar (project navigator)
2. Select the **App** target
3. Go to **Signing & Capabilities** tab
4. Verify:
   - ✅ "Automatically manage signing" is checked
   - ✅ Team shows "HushOne, Inc. (WVDK9JW99C)"
   - ✅ Bundle Identifier shows "ai.hushh.app"

### Step 2: Create Distribution Certificate (if needed)
If you see a signing error:
1. Xcode will prompt to create certificates
2. Click **"Fix Issue"** or **"Register Device"**
3. This will automatically create the Distribution certificate

### Step 3: Update App Display Name (Optional)
1. Go to **App** target → **General** tab
2. Change "Display Name" to `Hushh` (shorter for home screen)

### Step 4: Add App Icon (Required for App Store)
1. In Xcode, select **Assets.xcassets** → **AppIcon**
2. Drag your 1024x1024 PNG app icon to the appropriate slots
3. Xcode will auto-generate all sizes

---

## 🏗️ Build & Archive Commands (CLI)

### Option A: Build via CLI (Recommended)

```bash
# 1. Build the web app first (if you made changes)
cd /Users/ankitkumarsingh/hushhTech
npm run build
npx cap sync ios

# 2. Archive the app
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -archivePath build/HushhApp.xcarchive \
  archive \
  -allowProvisioningUpdates

# 3. Export for App Store Connect
xcodebuild -exportArchive \
  -archivePath build/HushhApp.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist ios/ExportOptions.plist \
  -allowProvisioningUpdates
```

### Option B: Build via Xcode (GUI)

1. In Xcode, select **Product** → **Destination** → **Any iOS Device (arm64)**
2. Select **Product** → **Archive**
3. Wait for archive to complete
4. In Organizer window, click **Distribute App**
5. Select **App Store Connect** → **Upload**
6. Follow the prompts

---

## 📤 Upload to TestFlight

### Option A: Using Xcode (Easiest)
After archiving in Xcode:
1. Organizer window opens automatically
2. Select your archive
3. Click **Distribute App**
4. Choose **App Store Connect**
5. Select **Upload**
6. Wait for validation and upload

### Option B: Using CLI
```bash
# Upload IPA using xcrun
xcrun altool --upload-app \
  -f build/ipa/App.ipa \
  -t ios \
  -u YOUR_APPLE_ID_EMAIL \
  -p YOUR_APP_SPECIFIC_PASSWORD

# OR using newer xcrun notarytool (for validation)
xcrun notarytool submit build/ipa/App.ipa \
  --apple-id YOUR_APPLE_ID_EMAIL \
  --password YOUR_APP_SPECIFIC_PASSWORD \
  --team-id WVDK9JW99C
```

### Getting App-Specific Password
1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. Go to **Security** → **App-Specific Passwords**
4. Click **Generate Password**
5. Name it "Xcode Upload"
6. Copy the generated password

---

## 🧪 TestFlight Testing

After upload:
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app (create if first time)
3. Go to **TestFlight** tab
4. Wait for build processing (5-15 minutes)
5. Add internal/external testers
6. Testers will receive email invitation

---

## 📋 Quick Reference Commands

```bash
# Build web + sync to iOS
npm run build && npx cap sync ios

# Open Xcode
npx cap open ios

# Full archive command
xcodebuild -workspace ios/App/App.xcworkspace -scheme App -configuration Release -sdk iphoneos -archivePath build/HushhApp.xcarchive archive -allowProvisioningUpdates

# Export IPA
xcodebuild -exportArchive -archivePath build/HushhApp.xcarchive -exportPath build/ipa -exportOptionsPlist ios/ExportOptions.plist -allowProvisioningUpdates
```

---

## ⚠️ Troubleshooting

### "No signing certificate" error
1. Open Xcode → Preferences → Accounts
2. Sign in with Apple ID
3. Xcode will download certificates automatically

### "Provisioning profile" issues
1. In Xcode, go to Signing & Capabilities
2. Uncheck and re-check "Automatically manage signing"
3. Select your team again

### Build fails with SPM error
```bash
# Clean and rebuild
cd ios/App
rm -rf ~/Library/Developer/Xcode/DerivedData/*
xcodebuild clean
```

---

## 📱 First Time App Store Connect Setup

If this is your first iOS app:
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: Hushh Technologies
   - Primary Language: English
   - Bundle ID: ai.hushh.app (select from dropdown)
   - SKU: hushhapp-001
4. Click **Create**
5. Now you can upload builds to TestFlight

---

## 🎉 Success Checklist

- [ ] Xcode signing configured
- [ ] App icon added
- [ ] Archive created successfully
- [ ] Uploaded to App Store Connect
- [ ] TestFlight build processing complete
- [ ] Testers invited

---

**Generated on:** December 21, 2025
**Bundle ID:** ai.hushh.app
**Team:** HushOne, Inc. (WVDK9JW99C)
