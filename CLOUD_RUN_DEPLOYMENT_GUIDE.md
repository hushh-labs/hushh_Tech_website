# Cloud Run Email Template API Deployment Guide

## Overview

The email template for GitHub PR notifications is hosted on Google Cloud Run instead of Vercel.

**Architecture Flow:**
```
GitHub Webhook → Supabase Edge Function → Cloud Run API → Get HTML Template → Send Email
```

## Cloud Run Service Details

| Property | Value |
|----------|-------|
| **Project ID** | hushone-app |
| **Project Number** | 53407187172 |
| **Service Name** | email-template-api |
| **Region** | us-central1 |
| **Port** | 8080 |
| **Memory** | 256Mi |
| **Timeout** | 60s |
| **URL** | `https://email-template-api-53407187172.us-central1.run.app` |

## API Endpoints

### Health Check
```bash
GET /
```
Returns:
```json
{
  "status": "healthy",
  "service": "Hushh Email Template API",
  "version": "1.0.0",
  "endpoints": ["/pr-notification"]
}
```

### PR Notification Template
```bash
POST /pr-notification
Content-Type: application/json

{
  "prData": {
    "prNumber": 200,
    "prTitle": "Feature: Add new component",
    "prUrl": "https://github.com/...",
    "prDescription": "Description of changes",
    "baseBranch": "main",
    "headBranch": "feature-branch",
    "author": {
      "login": "username",
      "profileUrl": "https://github.com/username"
    },
    "mergedBy": {
      "login": "merger",
      "profileUrl": "https://github.com/merger"
    },
    "createdAt": "Dec 26, 2025",
    "mergedAt": "Dec 26, 2025",
    "filesChanged": 5,
    "additions": 100,
    "deletions": 20,
    "repoName": "hushh-labs/hushh_Tech_website",
    "repoUrl": "https://github.com/hushh-labs/hushh_Tech_website"
  }
}
```
Returns:
```json
{
  "success": true,
  "subject": "[Hushh DevOps] FEATURE: PR #200 merged to main",
  "html": "<html>...</html>"
}
```

## Manual Deployment

### Prerequisites
```bash
# Login to GCP
gcloud auth login

# Set project
gcloud config set project hushone-app

# Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

### Deploy
```bash
cd cloud-run/email-template-api

gcloud run deploy email-template-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --timeout 60s
```

### Get Service URL
```bash
gcloud run services describe email-template-api \
  --region us-central1 \
  --format 'value(status.url)'
```

### View Logs
```bash
gcloud alpha run services logs tail email-template-api --region us-central1
```

## GitHub Action Auto-Deploy

The workflow at `.github/workflows/deploy-cloud-run.yml` automatically deploys when:
- Push to `main` branch
- Changes in `cloud-run/email-template-api/**`

### Required GitHub Secret
Add `GCP_SA_KEY` secret with the Service Account JSON key that has Cloud Run Admin role.

### Create Service Account for GitHub Actions
```bash
# Create service account
gcloud iam service-accounts create github-actions-deploy \
  --display-name="GitHub Actions Deploy"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding hushone-app \
  --member="serviceAccount:github-actions-deploy@hushone-app.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# Grant Service Account User role
gcloud projects add-iam-policy-binding hushone-app \
  --member="serviceAccount:github-actions-deploy@hushone-app.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Grant Cloud Build Editor role
gcloud projects add-iam-policy-binding hushone-app \
  --member="serviceAccount:github-actions-deploy@hushone-app.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

# Create key
gcloud iam service-accounts keys create ~/gcp-key.json \
  --iam-account=github-actions-deploy@hushone-app.iam.gserviceaccount.com

# Add to GitHub Secrets as GCP_SA_KEY
cat ~/gcp-key.json | pbcopy
```

## Edge Function Configuration

After Cloud Run deployment, update the Edge Function to use the Cloud Run URL:

**File:** `supabase/functions/github-devops-notify/index.ts`

Update `TEMPLATE_API_URL`:
```typescript
const TEMPLATE_API_URL = 'https://email-template-api-xxxxx-uc.a.run.app/pr-notification';
```

Then deploy the Edge Function:
```bash
supabase functions deploy github-devops-notify --project-ref ibsisfnjxeowvdtvgzff
```

## Local Development

```bash
cd cloud-run/email-template-api
npm install
npm run dev
```

Server runs at `http://localhost:8080`

## Testing

### Test Health Check
```bash
curl https://email-template-api-xxxxx-uc.a.run.app/
```

### Test Template Generation
```bash
curl -X POST https://email-template-api-xxxxx-uc.a.run.app/pr-notification \
  -H "Content-Type: application/json" \
  -d '{
    "prData": {
      "prNumber": 200,
      "prTitle": "Test PR",
      "prUrl": "https://github.com/test",
      "baseBranch": "main",
      "headBranch": "test",
      "author": {"login": "test"},
      "mergedBy": {"login": "test"},
      "createdAt": "Dec 26, 2025",
      "mergedAt": "Dec 26, 2025",
      "filesChanged": 1,
      "additions": 10,
      "deletions": 5,
      "repoName": "test/repo",
      "repoUrl": "https://github.com/test/repo"
    }
  }'
```

## Files Structure

```
cloud-run/
└── email-template-api/
    ├── index.js          # Express API with template endpoint
    ├── package.json      # Dependencies (express, cors)
    └── README.md         # This file

.github/
└── workflows/
    └── deploy-cloud-run.yml   # GitHub Action for auto-deploy
```

## Troubleshooting

### Deployment Failed
1. Check Cloud Build logs: `gcloud builds log [BUILD_ID]`
2. Ensure all APIs are enabled
3. Verify project ID is correct

### Service Not Responding
1. Check service logs: `gcloud run services logs tail email-template-api`
2. Verify service is deployed: `gcloud run services list`
3. Test health endpoint first

### Email Not Received
1. Check Edge Function logs in Supabase Dashboard
2. Verify Cloud Run URL is correct in Edge Function
3. Test API endpoint directly with curl

---

**Created:** Dec 26, 2025  
**Updated:** Dec 26, 2025
