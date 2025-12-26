# iOS Universal Links Setup Guide

## Overview

Universal Links enable iOS OAuth to redirect back to the app after login (Apple/Google Sign-In). This requires:
1. **AASA file** on the website ✅ (already created)
2. **Associated Domains** entitlement in iOS ✅ (already created)
3. **Apple Developer Portal** configuration ⚠️ (needs manual setup)

## Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| AASA File | ✅ Done | `public/.well-known/apple-app-site-association` |
| iOS Entitlements | ✅ Done | `ios/App/App/App.entitlements` |
| Xcode Project | ✅ Done | References entitlements file |
| Apple Developer Portal | ❌ Pending | Need to enable Associated Domains |
| Provisioning Profile | ❌ Pending | Need to regenerate after enabling |

## Step 1: Enable Associated Domains in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Click **Certificates, Identifiers & Profiles**
3. Select **Identifiers** from the left menu
4. Find and click on `ai.hushh.app`
5. Scroll down to **Capabilities**
6. Check the box for **Associated Domains**
7. Click **Save**

## Step 2: Regenerate Provisioning Profile

After enabling Associated Domains, the provisioning profile must be regenerated:

1. In Apple Developer Portal, go to **Profiles**
2. Find the profile for `ai.hushh.app` (App Store / Distribution)
3. Click on it and select **Edit**
4. Click **Generate** to create a new profile
5. **Download** the new profile

## Step 3: Update Xcode with New Profile

### Option A: Automatic (Recommended)
1. Open Xcode
2. Go to **Xcode → Settings → Accounts**
3. Select your Apple ID
4. Click **Download Manual Profiles**
5. Clean build and rebuild

### Option B: Manual
1. Download the new profile from Apple Developer Portal
2. Double-click to install in Xcode
3. In Xcode project, select the new profile for signing

## Step 4: Rebuild and Upload

After the provisioning profile is updated:

```bash
# Run the automated TestFlight script
npm run ios:testflight
```

Or manually:
```bash
# Build web app
npm run build

# Sync to Capacitor
npx cap sync ios

# Open Xcode and build
npx cap open ios
# Then Product → Archive → Distribute App → App Store Connect
```

## AASA File Details

The AASA file at `public/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "WVDK9JW99C.ai.hushh.app",
        "paths": [
          "/auth/callback",
          "/auth/callback/*",
          "/auth/*"
        ]
      }
    ]
  },
  "webcredentials": {
    "apps": [
      "WVDK9JW99C.ai.hushh.app"
    ]
  }
}
```

## iOS Entitlements

The entitlements at `ios/App/App/App.entitlements`:

```xml
<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:hushh.ai</string>
    <string>applinks:www.hushh.ai</string>
    <string>webcredentials:hushh.ai</string>
    <string>webcredentials:www.hushh.ai</string>
</array>
```

## IMPORTANT: Website Deployment

The AASA file must be deployed to the **production website** at:
- `https://hushh.ai/.well-known/apple-app-site-association`
- OR `https://www.hushh.ai/.well-known/apple-app-site-association`

The file was added to `public/.well-known/` in this repo. If the production website is a different deployment, the AASA file must be added there too.

## Verification

After deployment, verify the AASA file is accessible:

```bash
curl -I https://www.hushh.ai/.well-known/apple-app-site-association
# Should return: Content-Type: application/json

curl https://www.hushh.ai/.well-known/apple-app-site-association
# Should return the JSON content
```

## Testing Universal Links

1. Install the TestFlight build on iOS device
2. Open Safari and go to `https://hushh.ai/auth/callback`
3. iOS should show a banner "Open in Hushh" at the top
4. If no banner appears, Universal Links are not configured correctly

## Troubleshooting

### Export Failed - Associated Domains Error
```
error: Provisioning profile doesn't support Associated Domains capability
```
**Solution:** Enable Associated Domains in Apple Developer Portal and regenerate profile.

### AASA Not Found (404)
**Solution:** Deploy the AASA file to the production website.

### AASA Returns HTML Instead of JSON
**Solution:** Check vercel.json rewrites to ensure `.well-known` is not caught by SPA routing.

### Universal Links Not Working
1. Verify AASA file is accessible with correct Content-Type
2. Wait 24-48 hours for Apple's CDN to cache the AASA
3. Reinstall the app (Universal Links are registered at install time)

## Configuration Reference

| Setting | Value |
|---------|-------|
| Team ID | WVDK9JW99C |
| Bundle ID | ai.hushh.app |
| App ID | WVDK9JW99C.ai.hushh.app |
| OAuth Redirect | https://hushh.ai/auth/callback |
| AASA Path | /.well-known/apple-app-site-association |

---

Once Associated Domains is enabled and the profile is regenerated, run:
```bash
npm run ios:testflight
```
