# iOS CI/CD Automation Guide

## 🚀 One Command Deploy to TestFlight

```bash
npm run ios:testflight
```

This single command:
1. ✅ Builds web app (`npm run build`)
2. ✅ Syncs to Capacitor iOS
3. ✅ Auto-increments build number
4. ✅ Creates Xcode archive
5. ✅ Exports IPA
6. ✅ Uploads to TestFlight automatically

---

## ⚙️ Configuration

### API Credentials (Already Configured)
- **Key ID:** `2P753XQ823`
- **Issuer ID:** `c4ac9023-32d3-4d1b-98c1-2a299f1ac957`
- **Key Location:** `~/.private_keys/AuthKey_2P753XQ823.p8`

---

## 📱 Available Commands

| Command | Description |
|---------|-------------|
| `npm run ios:testflight` | **Full automation** - Build, increment, export, upload |
| `npm run ios:deploy` | Build and export IPA only (no auto-increment) |
| `npm run ios:deploy:build-only` | Build only, no upload |
| `npm run ios:ota` | Push OTA update (for small changes) |
| `npm run ios:ota:beta` | Push OTA update to beta testers |

---

## 🔄 When to Use What

### Use `ios:testflight` for:
- Native changes (new Capacitor plugins)
- Major app updates
- First-time deployments

### Use `ios:ota` for:
- Small UI/CSS changes
- Bug fixes in React code
- Minor text changes

---

## 📝 Build Number Management

The automation automatically increments the build number in:
`ios/App/App.xcodeproj/project.pbxproj`

Example:
- Build 3 → Build 4 → Build 5 ...

---

## 🔧 Troubleshooting

### "Bundle version already used" Error
This means the build number was already uploaded. The automation auto-increments, so this shouldn't happen. If it does:
```bash
# Check current build number
grep "CURRENT_PROJECT_VERSION" ios/App/App.xcodeproj/project.pbxproj | head -1
```

### API Key Issues
Ensure the key file exists:
```bash
ls -la ~/.private_keys/AuthKey_*.p8
```

---

## 📊 Build Process Timeline

| Step | Duration | Description |
|------|----------|-------------|
| Web Build | ~10 sec | Vite production build |
| Cap Sync | ~5 sec | Copy to iOS project |
| Archive | ~3-5 min | Xcode archive |
| Export | ~30 sec | Create IPA |
| Upload | ~5-10 min | Upload to TestFlight |
| **Total** | **~10-15 min** | End-to-end |

---

## 🎯 Quick Start

Just run:
```bash
npm run ios:testflight
```

That's it! Your app will be on TestFlight in ~15 minutes.

---

---

## ☁️ Supabase Edge Function Integration

### Build Tracker API

The iOS build secrets and tracking are managed via Supabase Edge Function:

**Endpoint:** `https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/ios-build-tracker`

### Available Actions

| Action | Description |
|--------|-------------|
| `?action=get-credentials` | Get App Store Connect API credentials |
| `?action=start-build` | Record a new build start |
| `?action=update-status` | Update build status |
| `?action=get-latest` | Get latest build info |
| `?action=list-builds` | List recent builds |

### Secrets Stored in Supabase

All credentials are securely stored as Supabase secrets:
- `APP_STORE_API_KEY_ID` - App Store Connect API Key ID
- `APP_STORE_ISSUER_ID` - App Store Connect Issuer ID  
- `APPLE_TEAM_ID` - Apple Developer Team ID
- `APPLE_BUNDLE_ID` - App Bundle Identifier

### Test the API

```bash
# Check status
curl "https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/ios-build-tracker"

# Get credentials
curl "https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/ios-build-tracker?action=get-credentials"
```

### Database Table (One-time setup)

Run this in Supabase SQL Editor to create the ios_builds tracking table:

```sql
-- File: supabase/migrations/20251221000000_create_ios_builds.sql
CREATE TABLE IF NOT EXISTS ios_builds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    build_number INTEGER NOT NULL UNIQUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    ipa_size VARCHAR(20),
    triggered_by VARCHAR(100) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

Created: December 21, 2025
