# Gmail-Safe Email Template Deployment

## Deployment Summary
**Date:** December 27, 2025  
**Status:** ✅ LIVE

## Architecture

```
GitHub Webhook → Supabase Edge Function → Cloud Run API → Gmail API → DevOps Team
                   (github-devops-notify)   (email-template-api)
```

## What Was Fixed

### The Problem
Gmail strips CSS properties like `background-color`, `border-radius`, `box-shadow`, and gradients, causing email notifications to appear as plain text without styling.

### The Solution
Migrated email template to use **Gmail-safe HTML** with:
- **Table-based layout** (no div-based CSS layouts)
- **`bgcolor` HTML attributes** instead of CSS `background-color`
- **Inline styles** for text and spacing
- **Pure JavaScript template** (no JSX/React transpilation needed)

## Deployed Components

### 1. Google Cloud Run API
- **URL:** `https://email-template-api-53407187172.us-central1.run.app`
- **Version:** 2.1.0 (Gmail-Safe Pure JS)
- **Project:** hushone-app
- **Region:** us-central1
- **Revision:** email-template-api-00003-jc2

### 2. Supabase Edge Function
- **Function:** github-devops-notify
- **Project:** ibsisfnjxeowvdtvgzff
- **Dashboard:** https://supabase.com/dashboard/project/ibsisfnjxeowvdtvgzff/functions

## Files Changed

```
cloud-run/email-template-api/
├── index.js           # Express server (v2.1.0)
├── package.json       # Simplified deps (express + cors only)
├── Dockerfile         # Node.js 20 Alpine
└── emails/
    └── PRNotification.js  # Gmail-safe HTML template

supabase/functions/github-devops-notify/
└── index.ts           # Points to new Cloud Run API
```

## Gmail-Safe Techniques Used

| ❌ Gmail Strips | ✅ Use Instead |
|----------------|----------------|
| `background-color: #f00;` | `bgcolor="#f00"` on `<td>` |
| `border-radius` | Use solid borders only |
| `box-shadow` | Not supported - skip |
| `@media queries` | Limited support |
| `<div>` layouts | `<table>` layouts |
| External CSS | Inline styles only |

## Email Template Features

- **Branded Header** - "🎉 Pull Request Merged!" with blue background
- **PR Title & Number** - Clickable link to GitHub
- **Author/Merger Avatars** - Initials with colored backgrounds
- **Branch Flow** - `feature-branch → main`
- **Stats Row** - Files Changed, Additions, Deletions
- **Description** - Markdown-rendered with basic formatting
- **CTA Button** - "View Pull Request →"
- **Footer** - Hushh DevOps Bot branding

## Testing

### Verify Cloud Run API
```bash
curl https://email-template-api-53407187172.us-central1.run.app/
# Expected: {"version":"2.1.0","engine":"Gmail-Safe Pure JS",...}
```

### Test PR Notification Endpoint
```bash
curl -X POST https://email-template-api-53407187172.us-central1.run.app/pr-notification \
  -H "Content-Type: application/json" \
  -d '{"prData":{"prNumber":123,"prTitle":"Test","baseBranch":"main"}}'
```

### Trigger Real Email
Merge any PR to the `main` branch in the hushhTech repository. The DevOps team will receive a styled email notification.

## Recipients

Email notifications are sent to:
- manish@hushh.ai
- neelesh1@hushh.ai
- ankit@hushh.ai
- i-akshat@hush1one.com
- suresh@hushh.ai

## Troubleshooting

### Email Not Received
1. Check Edge Function logs in Supabase Dashboard
2. Verify Gmail API credentials in Supabase secrets
3. Check Cloud Run logs in GCP Console

### Styling Issues in Gmail
- Ensure all backgrounds use `bgcolor` attribute on `<td>`
- Avoid CSS `background-color` property
- Use inline styles only

## Maintenance

### Update Email Template
1. Edit `cloud-run/email-template-api/emails/PRNotification.js`
2. Update version in `package.json`
3. Deploy: `cd cloud-run/email-template-api && gcloud run deploy email-template-api --source . --region us-central1 --project hushone-app --allow-unauthenticated --port 8080 --clear-base-image`

### View Logs
```bash
# Cloud Run logs
gcloud run logs read email-template-api --project hushone-app --region us-central1

# Supabase Edge Function logs
# Go to: https://supabase.com/dashboard/project/ibsisfnjxeowvdtvgzff/functions
```
