# GitHub DevOps Webhook Setup Guide

This guide explains how to set up automated email notifications when a PR is merged into the main branch of the hushhTech repository.

## Overview

```
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│   GitHub Repo   │──────│  Supabase Edge Func  │──────│   Gmail API     │
│  PR Merged      │      │  github-devops-notify│      │   (Send Email)  │
└─────────────────┘      └──────────────────────┘      └─────────────────┘
                                                              │
                                                              ▼
                                                       ┌─────────────────┐
                                                       │ dev-ops@hushh.ai│
                                                       │   (Recipient)   │
                                                       └─────────────────┘

FROM: ankit@hushh.ai
TO: dev-ops@hushh.ai
```

## Prerequisites

- Google Cloud Platform account with billing enabled
- Admin access to Google Workspace (hushh.ai)
- Supabase project access
- GitHub repository admin access

---

## Step 1: Google Cloud Setup (Service Account)

### 1.1 Run the Setup Script

```bash
# Make the script executable
chmod +x scripts/gcloud-devops-setup.sh

# Run the setup script
./scripts/gcloud-devops-setup.sh
```

This script will:
- Create a new GCP project `hushh-devops-notifier`
- Enable the Gmail API
- Create a service account `hushh-github-notifier@hushh-devops-notifier.iam.gserviceaccount.com`
- Generate a service account key JSON file

### 1.2 Note Down the Credentials

After running the script, you'll get:
- **Service Account Email**: `hushh-github-notifier@hushh-devops-notifier.iam.gserviceaccount.com`
- **Private Key**: (in the downloaded JSON file)

### 1.3 Configure Domain-Wide Delegation

This is **CRITICAL** for the service account to send emails as `ankit@hushh.ai`.

1. Go to [Google Workspace Admin Console](https://admin.google.com)
2. Navigate to: **Security** → **API Controls** → **Domain-wide Delegation**
3. Click **Add new**
4. Enter:
   - **Client ID**: Find this in the service account JSON file (look for `client_id`)
   - **OAuth Scopes**: `https://www.googleapis.com/auth/gmail.send`
5. Click **Authorize**

**Who can do this?** Only a Google Workspace Super Admin (likely Manish or someone with full admin access).

---

## Step 2: Set Supabase Edge Function Secrets

### 2.1 Get Your Service Account Key

Open the JSON key file downloaded in Step 1. You'll need:
- `client_email` → This is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → This is your `GOOGLE_PRIVATE_KEY`

### 2.2 Set the Secrets

```bash
# Set the service account email
supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL="hushh-github-notifier@hushh-devops-notifier.iam.gserviceaccount.com"

# Set the private key (include the entire key including -----BEGIN/END-----)
supabase secrets set GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvg...your-key-here...abc123=
-----END PRIVATE KEY-----"

# Set the sender email (who the email will appear FROM)
supabase secrets set GMAIL_SENDER_EMAIL="ankit@hushh.ai"

# Generate a secure webhook secret (for verifying GitHub signatures)
# Generate one with: openssl rand -hex 32
supabase secrets set GITHUB_WEBHOOK_SECRET="your-generated-secret-here"
```

### 2.3 Deploy the Edge Function

```bash
# Deploy the function
supabase functions deploy github-devops-notify

# Verify it's deployed
supabase functions list
```

---

## Step 3: Configure GitHub Webhook

### 3.1 Get the Webhook URL

Your webhook URL will be:
```
https://xqgjqblobjrpqmwvlqof.supabase.co/functions/v1/github-devops-notify
```

### 3.2 Add Webhook in GitHub

1. Go to **GitHub Repository** → **Settings** → **Webhooks**
2. Click **Add webhook**
3. Configure:
   - **Payload URL**: `https://xqgjqblobjrpqmwvlqof.supabase.co/functions/v1/github-devops-notify`
   - **Content type**: `application/json`
   - **Secret**: Same value as `GITHUB_WEBHOOK_SECRET` you set in Supabase
   - **SSL verification**: Enabled
   - **Events**: Select "Let me select individual events" → Check only **Pull requests**
4. Click **Add webhook**

### 3.3 Verify Webhook is Active

GitHub will send a ping event. Check:
- Green checkmark next to the webhook = Success
- Click on "Recent Deliveries" to see the ping response

---

## Step 4: Testing

### 4.1 Test with a Real PR

1. Create a new branch
2. Make a small change
3. Create a PR to `main`
4. Merge the PR
5. Check `dev-ops@hushh.ai` for the notification email

### 4.2 Check Supabase Logs

```bash
# View function logs
supabase functions logs github-devops-notify
```

### 4.3 Test Manually with curl

```bash
# Send a test payload (simulating GitHub webhook)
curl -X POST https://xqgjqblobjrpqmwvlqof.supabase.co/functions/v1/github-devops-notify \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{
    "action": "closed",
    "pull_request": {
      "number": 999,
      "title": "Test PR",
      "merged": true,
      "html_url": "https://github.com/test/test/pull/999",
      "body": "Test description",
      "user": {
        "login": "testuser",
        "avatar_url": "https://github.com/identicons/testuser.png",
        "html_url": "https://github.com/testuser"
      },
      "merged_by": {
        "login": "admin",
        "avatar_url": "https://github.com/identicons/admin.png",
        "html_url": "https://github.com/admin"
      },
      "created_at": "2025-12-26T10:00:00Z",
      "merged_at": "2025-12-26T12:00:00Z",
      "base": { "ref": "main" },
      "head": { "ref": "feature/test" },
      "changed_files": 5,
      "additions": 100,
      "deletions": 20,
      "labels": []
    },
    "repository": {
      "full_name": "DamriaNeelesh/hushhTech",
      "html_url": "https://github.com/DamriaNeelesh/hushhTech"
    }
  }'
```

---

## Email Format

When a PR is merged, the email will contain:

### Subject Line
```
🚀 [MERGED] PR #192 - docs: Add Claude workflow
```

### Email Content Includes:
- 🎉 Header with Hushh branding
- PR number and title
- Labels (if any)
- **Raised By**: Author's GitHub profile with avatar
- **Merged By**: Merger's GitHub profile with avatar
- **Timestamps**: When PR was raised & merged (in IST)
- **Branch Flow**: `feature-branch` → `main`
- **Stats**: Files changed, additions (+), deletions (-)
- **Description**: Full PR description with markdown support
- **CTA Button**: "View Pull Request →" link

---

## Troubleshooting

### Email Not Sending

1. **Check Domain-Wide Delegation**
   - Ensure the service account has the `gmail.send` scope authorized
   - The Client ID must match exactly

2. **Check Service Account Credentials**
   ```bash
   # Verify secrets are set
   supabase secrets list
   ```

3. **Check Logs**
   ```bash
   supabase functions logs github-devops-notify --tail
   ```

### Webhook Not Triggering

1. **Check GitHub Webhook Status**
   - Go to repo Settings → Webhooks → Recent Deliveries
   - Look for failed deliveries (red X)

2. **Verify Payload URL**
   - Ensure the URL is exactly: `https://xqgjqblobjrpqmwvlqof.supabase.co/functions/v1/github-devops-notify`

3. **Check Signature Verification**
   - Ensure `GITHUB_WEBHOOK_SECRET` matches in both GitHub and Supabase

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid Gmail API token | Check Domain-Wide Delegation setup |
| `403 Forbidden` | Service account not authorized | Add gmail.send scope in Workspace Admin |
| `Invalid signature` | Webhook secret mismatch | Regenerate and update both GitHub & Supabase |
| `PR not merged` | Webhook triggered for non-merge event | This is expected - only merged PRs send emails |

---

## Files Created

| File | Purpose |
|------|---------|
| `scripts/gcloud-devops-setup.sh` | Google Cloud setup automation |
| `supabase/functions/github-devops-notify/index.ts` | Main webhook handler |
| `supabase/functions/github-devops-notify/gmail.ts` | Gmail API client with Service Account auth |
| `supabase/functions/github-devops-notify/template.ts` | HTML email template |
| `supabase/functions/github-devops-notify/deno.json` | Deno configuration |
| `GITHUB_DEVOPS_WEBHOOK_SETUP.md` | This setup guide |

---

## Security Notes

1. **Never commit the service account key JSON file** - It's in `.gitignore`
2. **Rotate the webhook secret periodically** - Update both GitHub and Supabase
3. **Monitor webhook deliveries** - Check GitHub for failed deliveries regularly
4. **Limit scope** - The service account only has `gmail.send` permission

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              GITHUB                                      │
│  ┌─────────────────┐                                                    │
│  │   Pull Request  │                                                    │
│  │   Merged to     │                                                    │
│  │   main branch   │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           │ Webhook POST (X-Hub-Signature-256)                          │
└───────────┼─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Edge Function                                 │   │
│  │              github-devops-notify                                │   │
│  │                                                                  │   │
│  │  1. Verify webhook signature (HMAC-SHA256)                      │   │
│  │  2. Parse PR data (author, merger, description, etc.)           │   │
│  │  3. Generate HTML email from template                           │   │
│  │  4. Sign JWT with Service Account private key                   │   │
│  │  5. Get OAuth2 access token from Google                         │   │
│  │  6. Send email via Gmail API                                    │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Secrets:                                                               │
│  - GOOGLE_SERVICE_ACCOUNT_EMAIL                                         │
│  - GOOGLE_PRIVATE_KEY                                                   │
│  - GMAIL_SENDER_EMAIL                                                   │
│  - GITHUB_WEBHOOK_SECRET                                                │
└─────────────────────────────────────────────────────────────────────────┘
            │
            │ OAuth2 JWT Bearer Flow
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GOOGLE CLOUD                                     │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐ │
│  │ Service Account │──────│  Domain-Wide    │──────│   Gmail API     │ │
│  │  (JWT Signing)  │      │  Delegation     │      │  (Send Email)   │ │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
            │
            │ Email sent as ankit@hushh.ai
            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         RECIPIENT                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    dev-ops@hushh.ai                              │   │
│  │                                                                  │   │
│  │  📧 New Email:                                                  │   │
│  │  🚀 [MERGED] PR #192 - docs: Add Claude workflow                │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Maintenance

### Updating the Email Template

Edit `supabase/functions/github-devops-notify/template.ts` and redeploy:

```bash
supabase functions deploy github-devops-notify
```

### Adding More Recipients

Modify the `to` field in `index.ts`:

```typescript
// Send to multiple recipients
const emailResult = await sendGmailNotification({
  to: "dev-ops@hushh.ai, engineering@hushh.ai",
  subject: emailSubject,
  htmlContent: emailHtml,
});
```

### Changing the Sender Email

Update the `GMAIL_SENDER_EMAIL` secret:

```bash
supabase secrets set GMAIL_SENDER_EMAIL="new-sender@hushh.ai"
```

---

---

## Organization-Level Webhook (All Repos)

As of December 26, 2025, we have configured an **organization-level webhook** that automatically applies to all 99 repositories in the `hushh-labs` organization.

### Webhook Details

| Property | Value |
|----------|-------|
| **Webhook ID** | `588385072` |
| **Organization** | `hushh-labs` |
| **Type** | Organization |
| **Active** | `true` |
| **Events** | `pull_request` |
| **URL** | `https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/github-devops-notify` |
| **Created At** | 2025-12-26T21:23:46Z |

### Benefits

1. **Automatic Coverage**: All new repos created in the organization will automatically have the webhook
2. **Single Point of Management**: Update once, affects all repos
3. **Consistent Notifications**: All PRs merged to `main` across all repos will trigger email notifications

### Managing the Webhook

```bash
# List organization webhooks
gh api orgs/hushh-labs/hooks --jq '.[] | {id: .id, active: .active, events: .events}'

# Send a test ping
gh api orgs/hushh-labs/hooks/588385072/pings --method POST

# Check recent deliveries
gh api orgs/hushh-labs/hooks/588385072/deliveries --jq '.[0:5] | .[] | {event: .event, status: .status}'

# Disable webhook (if needed)
gh api orgs/hushh-labs/hooks/588385072 --method PATCH -f active=false

# Delete webhook (if needed)
gh api orgs/hushh-labs/hooks/588385072 --method DELETE
```

### Recipients

Notifications are sent to the DevOps team:
- `manish@hush1one.com`
- `neelesh1@hush1one.com`
- `ankit@hush1one.com`
- `i-akshat@hush1one.com`
- `suresh@hushh.ai`

---

## Support

For issues with this setup:
1. Check the logs: `supabase functions logs github-devops-notify`
2. Check GitHub webhook deliveries
3. Contact: dev-ops@hushh.ai
