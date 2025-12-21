# iOS OTA Live Update Guide 🚀

This guide explains how to push Over-The-Air (OTA) updates to iOS users without going through App Store review.

## Overview

| Deployment Type | When to Use | Time to Users |
|----------------|-------------|---------------|
| **OTA Update** (`npm run ios:ota`) | Small changes, bug fixes, UI updates | **Instant** (next app launch) |
| **TestFlight** (`npm run ios:deploy`) | Native code changes, new Capacitor plugins | ~1 hour (after upload) |
| **App Store** | Major releases, App Store features | 1-7 days (after review) |

---

## Quick Start

### Push an OTA Update (Recommended for small changes)

```bash
# Deploy OTA update to all production users
npm run ios:ota

# Deploy to beta testers only
npm run ios:ota:beta
```

This creates a bundle in `ota-bundles/` that you upload to your CDN/Supabase Storage.

### Full iOS Build (for native changes)

```bash
# Build and upload to TestFlight
npm run ios:deploy
```

---

## How OTA Updates Work

```
┌─────────────────────────────────────────────────────────────────┐
│                     OTA UPDATE FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Developer                    Server                   iOS App  │
│   ─────────                    ──────                   ───────  │
│       │                          │                         │     │
│       │  npm run ios:ota         │                         │     │
│       │─────────────────────────>│                         │     │
│       │  Upload bundle.zip       │                         │     │
│       │                          │                         │     │
│       │                          │      Check for update   │     │
│       │                          │<────────────────────────│     │
│       │                          │                         │     │
│       │                          │   New version available │     │
│       │                          │────────────────────────>│     │
│       │                          │                         │     │
│       │                          │      Download bundle    │     │
│       │                          │<────────────────────────│     │
│       │                          │                         │     │
│       │                          │   bundle.zip            │     │
│       │                          │────────────────────────>│     │
│       │                          │                         │     │
│       │                          │                  ┌──────┴─────┐
│       │                          │                  │ Apply on   │
│       │                          │                  │ next launch│
│       │                          │                  └────────────┘
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## OTA Update Commands

| Command | Description |
|---------|-------------|
| `npm run ios:ota` | Build and package OTA bundle for production |
| `npm run ios:ota:beta` | Build OTA bundle for beta channel |

### What Gets Created

After running `npm run ios:ota`:

```
ota-bundles/
├── bundle-1.0.0-20231221123456.zip    # The actual update bundle
└── manifest-1.0.0.json                 # Metadata for the update
```

---

## Setting Up OTA Server

### Option 1: Supabase Storage (Recommended)

1. Create a storage bucket `app-updates` in Supabase
2. Upload bundles:
   ```bash
   supabase storage cp ota-bundles/bundle-*.zip ss://app-updates/
   ```
3. Create an API endpoint to serve manifest:
   ```typescript
   // api/app-updates/check.ts
   export default async function handler(req, res) {
     const { currentVersion, platform } = req.query;
     
     // Check if newer version exists
     const latestVersion = await getLatestVersion();
     
     if (latestVersion > currentVersion) {
       res.json({
         version: latestVersion,
         bundleUrl: `https://your-supabase.supabase.co/storage/v1/object/public/app-updates/bundle-${latestVersion}.zip`,
         mandatory: false,
       });
     } else {
       res.status(204).end(); // No update
     }
   }
   ```

### Option 2: Vercel/CDN

1. Upload bundles to your CDN
2. Update the `updateUrl` in `capacitor.config.ts`

---

## Initializing Live Updates in the App

Add to your App.tsx:

```typescript
import { useEffect } from 'react';
import { initLiveUpdate } from './utils/liveUpdate';

function App() {
  useEffect(() => {
    // Initialize live updates on app launch
    initLiveUpdate();
  }, []);
  
  // ... rest of app
}
```

---

## When to Use Each Method

### Use OTA Updates For ✅
- Bug fixes in React/TypeScript code
- UI/UX improvements
- Text/copy changes
- Styling updates
- New React components
- API endpoint changes
- State management updates

### Use TestFlight/App Store For ❌
- Adding new Capacitor plugins
- Native iOS code changes
- Changes to `capacitor.config.ts` plugins
- iOS permission changes
- Splash screen or icon updates

---

## Configuration

### capacitor.config.ts

```typescript
plugins: {
  LiveUpdate: {
    // Your update server URL
    updateUrl: 'https://hushh.ai/app-updates',
    
    // Auto-check for updates on app launch
    autoUpdate: true,
    
    // Show prompt before downloading
    promptForUpdate: true,
    
    // Channel for targeting (production, beta, dev)
    channel: 'production',
  },
}
```

### Environment Variables

Add to your `.env.local`:

```bash
# Optional: Override update URL per environment
VITE_OTA_UPDATE_URL=https://hushh.ai/api/app-updates/check
```

---

## Troubleshooting

### Update Not Applying

1. **Check console logs** - Open Safari Web Inspector and look for `[LiveUpdate]` messages
2. **Force reload** - In the app, use the Dev Console (tap Hushh logo 5 times) and trigger reload
3. **Clear cache** - Delete and reinstall the app

### Bundle Download Fails

1. Ensure the bundle URL is publicly accessible
2. Check CORS headers on your storage bucket
3. Verify the bundle is a valid zip file

### Rollback to Previous Version

If an update causes issues:

```typescript
import { resetToBuiltInBundle, reloadApp } from './utils/liveUpdate';

// Reset to the original app bundle
await resetToBuiltInBundle();
await reloadApp();
```

---

## Best Practices

1. **Version your bundles** - Always increment version in `package.json` before OTA
2. **Test locally first** - Run `npm run build && npm run preview` before deploying
3. **Use beta channel** - Deploy to beta first: `npm run ios:ota:beta`
4. **Keep backups** - Store previous bundles for quick rollback
5. **Monitor analytics** - Track which versions users are on

---

## iOS Header Scroll Fix

This build also includes an important iOS fix for the header scroll issue:

### Problem
On iOS WebView, content was scrolling "through" the fixed header because iOS doesn't properly create compositing layers for `position: fixed` elements.

### Solution Applied
- Added `-webkit-transform: translate3d(0,0,0)` to force GPU compositing
- Added `-webkit-backface-visibility: hidden` to prevent flickering
- Added `env(safe-area-inset-top)` for iPhone notch support
- Added global `.fixed` class iOS fixes in `index.css`

---

## Summary

| Action | Command | Updates Live? |
|--------|---------|---------------|
| Small fix | `npm run ios:ota` | ✅ Yes, instant |
| Beta test | `npm run ios:ota:beta` | ✅ Yes, to beta users |
| Native change | `npm run ios:deploy` | ❌ No, requires TestFlight |
| App Store | Manual upload | ❌ No, requires review |

**For most changes, use `npm run ios:ota`** - it's instant and doesn't require App Store review!
