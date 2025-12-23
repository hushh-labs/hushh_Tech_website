# OAuth Mobile Fix Deployment Guide

## Issue Summary
OAuth login on Android and iOS was redirecting to `localhost` instead of back to the app after Google Sign In.

## Root Cause
- **Android**: Missing App Links intent-filters in `AndroidManifest.xml` to handle OAuth callbacks
- **iOS**: Associated Domains entitlements were not covering all domain variations

## Changes Made

### 1. Android - AndroidManifest.xml
Added App Links intent-filters for OAuth callback handling:

```xml
<!-- App Links for OAuth callback (www.hushhtech.com) -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="https"
        android:host="www.hushhtech.com"
        android:pathPrefix="/auth/callback" />
</intent-filter>

<!-- App Links for OAuth callback (hushhtech.com without www) -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="https"
        android:host="hushhtech.com"
        android:pathPrefix="/auth/callback" />
</intent-filter>

<!-- Deep link scheme for custom hushh:// URLs -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="hushh" />
</intent-filter>
```

### 2. iOS - App.entitlements
Updated Associated Domains to cover all domain variations:

```xml
<key>com.apple.developer.associated-domains</key>
<array>
    <string>applinks:hushhtech.com</string>
    <string>applinks:www.hushhtech.com</string>
    <string>applinks:hushh.ai</string>
    <string>applinks:www.hushh.ai</string>
    <string>webcredentials:hushhtech.com</string>
    <string>webcredentials:www.hushhtech.com</string>
    <string>webcredentials:hushh.ai</string>
    <string>webcredentials:www.hushh.ai</string>
</array>
```

## How OAuth Flow Works

1. **User taps "Sign in with Google"** in the app
2. **App opens browser** with OAuth URL (Supabase hosted)
3. **User authenticates** with Google
4. **Google redirects to** `https://www.hushhtech.com/auth/callback?code=...`
5. **App Links (Android) / Universal Links (iOS)** intercept this URL
6. **App opens** and receives the auth code
7. **App completes** the session creation

## Server-Side Configuration (Already Done)

### assetlinks.json (Android App Links)
Location: `https://www.hushhtech.com/.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "ai.hushh.app",
    "sha256_cert_fingerprints": [
      "2D:0A:54:4B:2B:5A:29:5B:AB:21:7F:A5:A7:64:09:2E:C9:2F:B9:5C:16:C9:E9:B4:93:A8:DE:66:E6:C7:10:C8"
    ]
  }
}]
```

### apple-app-site-association (iOS Universal Links)
Location: `https://www.hushhtech.com/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [{
      "appID": "WVDK9JW99C.ai.hushh.app",
      "paths": ["/auth/callback", "/auth/callback/*", "/auth/*"]
    }]
  },
  "webcredentials": {
    "apps": ["WVDK9JW99C.ai.hushh.app"]
  }
}
```

## Build Artifacts

### Android AAB (Ready for Play Store)
- **File**: `releases/android/hushh-v1.0.6-oauth-fix-build8.aab`
- **Size**: 115 MB
- **Version**: 1.0.6 (Build 8)

### iOS (Ready to Build)
- iOS project is synced with latest web assets
- Entitlements are updated
- Run `npm run ios:testflight` to build and upload

## Deployment Steps

### Android Deployment
1. Go to [Google Play Console](https://play.google.com/console)
2. Select "Hushh - Data Privacy" app
3. Go to **Production** > **Create new release**
4. Upload `releases/android/hushh-v1.0.6-oauth-fix-build8.aab`
5. Add release notes:
   ```
   Bug Fixes:
   - Fixed Google Sign In redirect issue on mobile
   - OAuth now properly returns to the app after authentication
   ```
6. Submit for review

### iOS Deployment
1. Run the TestFlight script:
   ```bash
   npm run ios:testflight
   ```
   Or manually in Xcode:
   - Open `ios/App/App.xcworkspace` in Xcode
   - Select "Any iOS Device (arm64)" as target
   - Product → Archive
   - Distribute App → App Store Connect → Upload

2. In App Store Connect:
   - Wait for build processing
   - Add build to TestFlight
   - Submit for review

## Testing the Fix

### On Android
1. Install the new build from Play Store (once approved)
2. Go to Login page
3. Tap "Sign in with Google"
4. Complete Google authentication
5. ✅ Should return to the app and be logged in

### On iOS
1. Install from TestFlight
2. Go to Login page
3. Tap "Sign in with Google" or "Sign in with Apple"
4. Complete authentication
5. ✅ Should return to the app and be logged in

## Technical Details

### OAuth Redirect URL
- **Configured in Supabase**: `https://www.hushhtech.com/auth/callback`
- **Set in app**: `src/utils/platform.ts` → `getOAuthRedirectUrl()`

### Why localhost was showing
- When Android/iOS couldn't match the URL to an App Link/Universal Link
- The browser stayed open instead of deep linking to the app
- The web page at `/auth/callback` was attempting a localhost redirect

### The fix
- Android now has `intent-filter` with `android:autoVerify="true"`
- iOS now has `applinks:` entries in Associated Domains
- Both platforms will now intercept the callback URL and open the app

## Files Modified

1. `android/app/src/main/AndroidManifest.xml` - Added App Links
2. `ios/App/App/App.entitlements` - Updated Associated Domains

## Verification Checklist

- [x] Android App Links added to AndroidManifest.xml
- [x] iOS Associated Domains updated in App.entitlements
- [x] assetlinks.json verified at https://www.hushhtech.com/.well-known/assetlinks.json
- [x] apple-app-site-association verified at https://www.hushhtech.com/.well-known/apple-app-site-association
- [x] Web app built successfully
- [x] Capacitor sync completed for both platforms
- [x] Android AAB built (v1.0.6, build 8)
- [ ] Android build uploaded to Play Store
- [ ] iOS build uploaded to TestFlight
- [ ] OAuth tested on Android device
- [ ] OAuth tested on iOS device

---

**Date**: December 23, 2025  
**Fix Version**: 1.0.6 (Build 8)
