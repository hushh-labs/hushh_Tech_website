# 🚀 iOS TestFlight CI/CD Automation

**One Command Deploy to TestFlight** - Build, Archive, Export, Upload automatically!

---

## ⚡ Quick Start

```bash
npm run ios:testflight
```

This single command does everything:
1. Builds web app
2. Syncs to iOS
3. Increments build number
4. Creates archive
5. Exports IPA
6. Uploads to TestFlight

**Time:** ~10-15 minutes | **Output:** Build ready on TestFlight

---

## 📋 Prerequisites

| Requirement | Status |
|-------------|--------|
| Xcode | ✅ Installed |
| API Key | ✅ `~/.private_keys/AuthKey_2P753XQ823.p8` |
| Node.js | ✅ Required |
| macOS | ✅ Required (iOS builds need Xcode) |

---

## 🔧 Commands Available

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run ios:testflight` | **Full automation** | New builds, native changes |
| `npm run ios:ota` | OTA update only | Small React/UI changes |
| `npm run ios:deploy` | Build without upload | Testing locally |

---

## 📱 Build Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  npm run ios:testflight                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1 ─→ Vite Build        (~10s)  ✅ Web assets compiled    │
│  Step 2 ─→ Capacitor Sync    (~1s)   ✅ Assets copied to iOS   │
│  Step 3 ─→ Build Increment   (~1s)   ✅ Version 3 → 4 → 5...   │
│  Step 4 ─→ Xcode Archive     (~3min) ✅ .xcarchive created     │
│  Step 5 ─→ Export IPA        (~30s)  ✅ App.ipa (~258MB)       │
│  Step 6 ─→ Upload TestFlight (~5min) ✅ altool upload          │
│                                                                 │
│  Result: Build appears on App Store Connect → TestFlight        │
└─────────────────────────────────────────────────────────────────┘
```

---

## ☁️ Supabase Integration

Credentials stored securely in Supabase Edge Function.

### API Endpoint

```
https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/ios-build-tracker
```

### Actions

| Action | URL |
|--------|-----|
| Status | `?action=` (default) |
| Get Credentials | `?action=get-credentials` |
| Start Build | `?action=start-build` |
| Update Status | `?action=update-status` |
| List Builds | `?action=list-builds` |

### Test API

```bash
curl "https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/ios-build-tracker"
```

---

## 🔐 Stored Secrets

| Secret | Value |
|--------|-------|
| `APP_STORE_API_KEY_ID` | `2P753XQ823` |
| `APP_STORE_ISSUER_ID` | `c4ac9023-32d3-4d1b-98c1-2a299f1ac957` |
| `APPLE_TEAM_ID` | `WVDK9JW99C` |
| `APPLE_BUNDLE_ID` | `ai.hushh.app` |

---

## 📁 File Structure

```
hushhTech/
├── scripts/
│   └── ios-testflight.sh          # Main automation script
├── ios/
│   ├── App/
│   │   ├── App.xcodeproj/         # Xcode project
│   │   └── build/
│   │       ├── App.xcarchive/     # Build archive
│   │       └── export/App.ipa     # Exported IPA
│   └── ExportOptions.plist        # Export configuration
└── supabase/functions/
    └── ios-build-tracker/         # Supabase edge function
```

---

## 🔍 Troubleshooting

### Check Build Number
```bash
grep "CURRENT_PROJECT_VERSION" ios/App/App.xcodeproj/project.pbxproj | head -1
```

### Check API Key
```bash
ls ~/.private_keys/AuthKey_*.p8
```

### View Upload Logs
```bash
tail -f /tmp/ios-testflight.log
```

### "Bundle version already used"
Build number auto-increments. If error persists, manually update in Xcode.

---

## 🏃 When to Use What

| Scenario | Command |
|----------|---------|
| New Capacitor plugin added | `npm run ios:testflight` |
| Major app update | `npm run ios:testflight` |
| Fixed a bug in React code | `npm run ios:ota` |
| CSS/styling changes | `npm run ios:ota` |
| Testing build locally | `npm run ios:deploy` |

---

## 📊 Build History

| Build | Date | Status |
|-------|------|--------|
| 1.0 (4) | Dec 21, 2025 9:55 PM | ✅ Complete |
| 1.0 (3) | Dec 21, 2025 9:27 PM | ✅ Complete |
| 1.0 (2) | Dec 21, 2025 8:47 PM | ✅ Complete |
| 1.0 (1) | Dec 21, 2025 7:26 PM | ✅ Complete |

---

## 🔗 Links

- [App Store Connect](https://appstoreconnect.apple.com)
- [Supabase Dashboard](https://supabase.com/dashboard/project/ibsisfnjxeowvdtvgzff/functions)

---

**Created:** December 21, 2025 | **Last Build:** #4
