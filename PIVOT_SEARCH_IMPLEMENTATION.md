# 🎯 Hushh Deep Search - Seed-Based Identity Pivot Pattern

## Implementation Complete - December 29, 2025

## What is Pivot Search?

The Seed-Based Identity Pivot Pattern is the core differentiator of Hushh Deep Search. Instead of just running parallel APIs, we use a **confirmed profile as the SEED** to build a complete digital portfolio.

### Flow:
```
1. User enters Name, Email, Phone
2. Quick search finds AS MANY profile recommendations as possible
3. User clicks "This is me" on ONE profile (e.g., LinkedIn)
4. That confirmed profile becomes the SEED (100% confidence anchor)
5. PivotExtract (W9) EXTRACTS full data FROM that profile using ChatGPT
6. PivotExtract DISCOVERS related profiles (GitHub, Twitter, personal site)
7. Orchestrator chains to W1-W8 APIs with discovered usernames/URLs
8. Build COMPLETE DIGITAL PORTFOLIO
```

## Files Modified/Created

### New Edge Function
- `supabase/functions/deepsearch-pivotextract/index.ts` - Core pivot logic
- `supabase/functions/deepsearch-pivotextract/deno.json` - Deno config

### Modified Files
- `supabase/functions/deepsearch-orchestrator/index.ts` - Added pivot mode support
- `src/services/deepSearch/index.ts` - Added PivotProfile interface and parameter
- `src/pages/deepsearch/index.tsx` - Updated UI to pass pivot profile

## Technical Details

### PivotExtract Function (`deepsearch-pivotextract`)

This is the brain of the pivot pattern. It:

1. **Receives confirmed profile** (platform, URL, username)
2. **Uses ChatGPT (gpt-4o-mini)** to analyze the profile
3. **Extracts data**:
   - fullName, headline, currentTitle, currentCompany
   - workHistory, education, skills
   - bio, location
4. **Discovers related profiles** with confidence scores:
   - GitHub username from bio
   - Twitter handle
   - Personal website
5. **Generates search queries** for finding profiles on other platforms

### Orchestrator Pivot Mode

When `pivotProfile` is passed:

```typescript
// Step 1: Call PivotExtract to analyze confirmed profile
const pivotResult = await callPivotExtract(pivotProfile, name, email, phone);

// Step 2: Chain APIs based on discovered profiles
const chainedResults = await chainAPIsFromDiscoveredProfiles(searchId, pivotResult, name, email, phone);

// Step 3: Merge all data into complete profile
mergedProfile = mergePivotDataIntoProfile(mergedProfile, pivotResult);
```

### Platform to API Mapping

```typescript
const PLATFORM_TO_API = {
  'GitHub': 'codeGraph',      // W1
  'LinkedIn': 'proConnect',   // W5
  'Twitter': 'socialMap',     // W3
  'Website': 'webCrawl',      // W4
};
```

## Frontend Flow

### Verification Screen
When profiles are found, user sees "This is me" / "Not me" buttons for each.

### On "This is me" Click:
1. Profile is marked as confirmed in UI
2. ConfirmedPivot object is created
3. Toast shows "🔒 Identity Locked!"
4. Screen switches to processing
5. `handleStartSearch()` is called with pivot parameter
6. Goes directly to results (skips verification again)

### Processing Screen (Pivot Mode)
Shows special pivot banner:
```
🔒 IDENTITY PIVOT LOCKED
[LinkedIn] @username
Enhanced search using verified identity as anchor • Higher accuracy results
```

## Deployment Status

| Component | Status | Deployed On |
|-----------|--------|-------------|
| deepsearch-pivotextract | ✅ Deployed | Dec 29, 2025 |
| deepsearch-orchestrator | ✅ Updated | Dec 29, 2025 |
| Frontend (deepsearch page) | ✅ Ready | Dec 29, 2025 |
| Frontend service | ✅ Updated | Dec 29, 2025 |

## Testing

### To test the pivot flow:

1. Go to `/deepsearch`
2. Enter a name (e.g., "Ankit Kumar Singh")
3. Optionally add email/phone
4. Click "Hushh Deep Search"
5. Wait for profiles to appear on verification screen
6. Click "This is me" on any profile
7. Watch the pivot-enhanced search run
8. View complete digital portfolio

### Expected Behavior

- Normal search → Goes to verification screen
- Click "This is me" → Shows pivot banner → Goes directly to results
- Click "Not me" → Profile marked as rejected
- Click "None of these" → Refined search runs

## Console Logs to Watch

```
[DeepSearch] 🎯 Starting PIVOT MODE search with LinkedIn: @username
[Orchestrator] 🎯 PIVOT MODE - Starting seed-based search for confirmed LinkedIn: @username
[Orchestrator] PivotExtract found 3 related profiles
[Orchestrator] Chaining W1-W8 APIs for discovered profiles...
[Orchestrator] 🎯 PIVOT MODE complete - confidence: 85%
```

## API Endpoints

```bash
# PivotExtract (new)
POST https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/deepsearch-pivotextract
{
  "platform": "LinkedIn",
  "profileUrl": "https://linkedin.com/in/username",
  "username": "username",
  "name": "Full Name",
  "email": "optional@email.com",
  "phone": "+919876543210"
}

# Orchestrator (updated)
POST https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/deepsearch-orchestrator
{
  "name": "Full Name",
  "email": "optional@email.com",
  "phone": "+919876543210",
  "runAllPhases": true,
  "pivotProfile": {              // NEW - optional
    "platform": "LinkedIn",
    "profileUrl": "https://linkedin.com/in/username",
    "username": "username"
  }
}
```

## Key Benefits

1. **Higher Accuracy**: User confirmed = higher confidence
2. **Complete Portfolio**: Extract all data from confirmed profile
3. **Discovery**: Find related profiles on other platforms
4. **Chained Search**: Use discovered profiles to run targeted API calls
5. **Better UX**: User feels in control of identity verification

## Future Improvements

- [ ] Add profile photo extraction from confirmed profile
- [ ] Add more platform-specific extraction prompts
- [ ] Cache discovered profiles for faster subsequent searches
- [ ] Add "Merge Results" option for multiple confirmed profiles
- [ ] Add confidence explanation in results

---

*Implementation by Hushh AI Team - December 29, 2025*
