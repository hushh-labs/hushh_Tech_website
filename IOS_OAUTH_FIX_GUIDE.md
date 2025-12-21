# iOS OAuth Login Fix Guide

## Problem
After login via Apple/Google OAuth in the iOS app, users were seeing "localhost:5173 is currently unreachable" error. This happened because the OAuth redirect URL was using `window.location.origin` which returns `capacitor://localhost` or similar in the Capacitor WebView.

## Root Cause
In `src/resources/config/config.ts`, the redirect URL was:
```javascript
redirect_url: `${window.location.origin}/auth/callback`
```

In Capacitor iOS app, `window.location.origin` is NOT the production URL. OAuth providers (Apple/Google) redirect to this URL, but the WebView can't handle localhost URLs.

## Solution Implemented

### 1. Platform Detection in Config (`src/resources/config/config.ts`)
Added Capacitor detection to always use production URL for OAuth redirect when running in native apps:
```javascript
function getRedirectUrl(): string {
  // In native apps, ALWAYS use production URL
  if (Capacitor.isNativePlatform()) {
    return "https://hushh.ai/auth/callback";
  }
  // On web, use current origin
  return `${window.location.origin}/auth/callback`;
}
```

### 2. Platform Utility (`src/utils/platform.ts`)
Created utility functions for platform detection:
- `isNativeApp()` - Check if running in Capacitor
- `isIOS()` - Check if iOS
- `getBaseUrl()` - Get appropriate base URL

### 3. iOS URL Scheme (`ios/App/App/Info.plist`)
Added URL scheme for deep linking:
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>ai.hushh.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>hushh</string>
        </array>
    </dict>
</array>
```

## How OAuth Works Now

### Web Flow (unchanged):
1. User clicks "Sign in with Apple/Google"
2. Redirects to OAuth provider
3. Returns to `https://hushh.ai/auth/callback`
4. Session established ✅

### iOS App Flow (fixed):
1. User clicks "Sign in with Apple/Google" in app
2. Opens system browser for OAuth (not WebView)
3. OAuth provider redirects to `https://hushh.ai/auth/callback`
4. Web page handles session and shows success
5. User manually returns to app OR deep link opens app

## Supabase Configuration Required

### Add Redirect URL in Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/ibsisfnjxeowvdtvgzff/auth/url-configuration
2. Add these to "Redirect URLs":
   - `https://hushh.ai/auth/callback`
   - `https://www.hushh.ai/auth/callback`
   - `hushh://auth/callback` (for deep links)

## Testing

### Build and Test:
```bash
# Build web assets
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# Build and run on device/simulator
```

### Test OAuth:
1. Open app on iOS device/simulator
2. Tap "Sign in with Apple" or "Sign in with Google"
3. Complete OAuth in browser
4. Should see success page on hushh.ai
5. Session should be established

## Files Changed
- `src/resources/config/config.ts` - Added Capacitor detection for redirect URL
- `src/utils/platform.ts` - NEW - Platform detection utilities
- `ios/App/App/Info.plist` - Added URL scheme for deep linking

## Build Version
After this fix, increment build number to 3:
1. Open `ios/App/App.xcodeproj/project.pbxproj`
2. Change `CURRENT_PROJECT_VERSION` from `2` to `3`
3. Or run: `npm run ios:deploy`

## Notes
- The fix ensures OAuth always redirects to production URL when running in native app
- Deep linking with `hushh://` scheme allows opening app from web
- Session is shared between web and app via Supabase persistence
