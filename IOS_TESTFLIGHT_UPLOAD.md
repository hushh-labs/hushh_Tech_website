# iOS TestFlight Deployment Guide

> **One-command deployment:** `npm run ios:deploy`

This guide covers how to build and deploy the Hushh iOS app to TestFlight.

---

## 🚀 Quick Start (For Returning Developers)

If you've already set up your API key, just run:

```bash
npm run ios:deploy
```

This will:
1. Build the web app
2. Sync to Capacitor iOS
3. Archive with Xcode
4. Export IPA
5. Upload to TestFlight

---

## 📋 First-Time Setup

### Prerequisites

- **macOS** with Xcode 15+ installed
- **Node.js** 18+ and npm
- **Apple Developer Account** (must be part of HushOne, Inc. team)
- Access to App Store Connect

### Step 1: Clone and Install

```bash
git clone https://github.com/DamriaNeelesh/hushhTech.git
cd hushhTech
npm install
```

### Step 2: Set Up App Store Connect API Key

The API key enables automated uploads to TestFlight without manual intervention.

#### Creating a New API Key

1. Go to [App Store Connect → Users and Access → Keys](https://appstoreconnect.apple.com/access/api)
2. Click the **"+"** button to create a new key
3. Enter a name (e.g., "Hushh iOS Deploy - [Your Name]")
4. Select **"App Manager"** or **"Admin"** role
5. Click **Create**
6. **Download the .p8 file immediately** (you can only download it once!)
7. Note down:
   - **Key ID** (shown in the table, e.g., `2P753XQ823`)
   - **Issuer ID** (shown at the top of the page)

#### Installing the API Key

Place the downloaded `.p8` file in one of these locations:

```bash
# Recommended location
mkdir -p ~/.private_keys
mv ~/Downloads/AuthKey_XXXXXXXXXX.p8 ~/.private_keys/
```

#### Setting Environment Variables

Add these to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# App Store Connect API Key for iOS deployments
export APP_STORE_API_KEY_ID="YOUR_KEY_ID"
export APP_STORE_ISSUER_ID="YOUR_ISSUER_ID"
```

Then reload your shell:
```bash
source ~/.zshrc
```

Alternatively, create a `.env.local` file (don't commit this!):
```bash
APP_STORE_API_KEY_ID=YOUR_KEY_ID
APP_STORE_ISSUER_ID=YOUR_ISSUER_ID
```

### Step 3: Verify Xcode Setup

Open the iOS project once to ensure signing is configured:

```bash
npm run ios:open
```

In Xcode:
1. Select the "App" project in the navigator
2. Go to "Signing & Capabilities" tab
3. Ensure "Automatically manage signing" is checked
4. Team should be: **HushOne, Inc. (WVDK9JW99C)**
5. Bundle ID should be: **ai.hushh.app**

Close Xcode. You're ready to deploy!

---

## 🛠 Available Commands

| Command | Description |
|---------|-------------|
| `npm run ios:deploy` | **Full deploy** - Build, archive, export, upload to TestFlight |
| `npm run ios:deploy:build-only` | Build & export IPA only, no upload |
| `npm run ios:upload` | Upload existing IPA to TestFlight |
| `npm run ios:build` | Build web + sync to Capacitor |
| `npm run ios:sync` | Sync web changes to iOS |
| `npm run ios:open` | Open Xcode |
| `npm run ios:archive` | Create Xcode archive |
| `npm run ios:export` | Export IPA from archive |

### Script Flags

The deploy script supports these options:

```bash
./scripts/ios-deploy.sh --help          # Show help
./scripts/ios-deploy.sh --skip-build    # Skip npm build (use existing dist/)
./scripts/ios-deploy.sh --skip-archive  # Skip archiving (use existing .xcarchive)
./scripts/ios-deploy.sh --no-upload     # Build only, don't upload
```

---

## 📱 After Upload

1. **Wait for processing** - Apple processes builds in 10-30 minutes
2. **Check email** - You'll receive an email when processing completes
3. **Add testers** - Go to App Store Connect → TestFlight → Add testers

### Managing TestFlight Testers

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select **Hushh - Data Privacy**
3. Go to **TestFlight** tab
4. Create test groups or add individual testers

---

## 🔧 Troubleshooting

### "No signing certificate found"

Run in Xcode once:
```bash
npm run ios:open
```
Then go to Signing & Capabilities and ensure your Apple ID is signed in.

### "No API key found for automated upload"

Either:
- Set environment variables: `APP_STORE_API_KEY_ID` and `APP_STORE_ISSUER_ID`
- Or place your `.p8` file in `~/.private_keys/AuthKey_XXXXXX.p8`

### "App Name already in use"

The app name in App Store Connect is **"Hushh - Data Privacy"** (not "Hushh Technologies").

### Build fails with Swift/SPM errors

Clean the build and try again:
```bash
cd ios/App
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
cd ../..
npm run ios:deploy
```

### Upload fails with authentication error

1. Check your API key is not expired
2. Verify the `.p8` file is in the correct location
3. Ensure your environment variables are set correctly

---

## 📊 App Information

| Field | Value |
|-------|-------|
| App Name | Hushh - Data Privacy |
| Bundle ID | ai.hushh.app |
| Team | HushOne, Inc. |
| Team ID | WVDK9JW99C |

---

## 🔐 Security Notes

- **Never commit** the `.p8` API key file to git
- **Never commit** `.env.local` with API credentials
- The API key should be kept secure - it provides access to upload builds
- Each developer can create their own API key, or use a shared team key

---

## 📁 Build Artifacts

After a successful build:

| Artifact | Location |
|----------|----------|
| Web build | `dist/` |
| iOS archive | `ios/App/build/App.xcarchive` |
| IPA file | `ios/App/build/export/App.ipa` |

The IPA file (~269 MB) is what gets uploaded to TestFlight.

---

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify your Apple Developer account has access to HushOne, Inc.
3. Ensure your API key has "App Manager" or higher permissions
4. Contact the team lead for access issues

---

*Last updated: December 21, 2025*
