# Hushh Sales Mailing System - Deployment Guide

**Created:** January 2, 2026  
**Version:** 1.0.0

## Overview

The Hushh Sales Mailing system enables bulk personalized email outreach to investors and leads using the Fund A luxury email template. It reuses the existing email infrastructure (Gmail API + Domain-Wide Delegation).

## Architecture

```
┌─────────────────────┐
│   Dashboard UI      │
│   /sales-mailing    │
└─────────┬───────────┘
          │ POST /functions/v1/sales-mailer
          ▼
┌─────────────────────┐
│  Supabase Edge Fn   │
│   sales-mailer      │
└─────────┬───────────┘
          │ POST /sales-notification
          ▼
┌─────────────────────┐
│  Google Cloud Run   │
│  email-template-api │
└─────────┬───────────┘
          │ Returns HTML
          ▼
┌─────────────────────┐
│     Gmail API       │
│  (Service Account)  │
└─────────────────────┘
```

## Files Created

| File | Description |
|------|-------------|
| `src/pages/sales-mailing/index.tsx` | Dashboard UI for bulk email sending |
| `supabase/functions/sales-mailer/index.ts` | Edge function for processing bulk emails |
| `supabase/functions/sales-mailer/gmail.ts` | Gmail API client with Service Account auth |
| `supabase/functions/sales-mailer/deno.json` | Deno configuration |
| `cloud-run/email-template-api/emails/SalesNotification.js` | Sales email template |
| `cloud-run/email-template-api/index.js` | Updated with `/sales-notification` endpoint |

## Deployment Steps

### 1. Deploy Cloud Run (Email Template API)

The Cloud Run deployment happens automatically on git push:

```bash
# Commit and push changes
git add .
git commit -m "feat: Add Hushh Sales Mailing system"
git push
```

The GitHub Action at `.github/workflows/deploy-cloud-run.yml` will:
1. Build the Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run

**Verify deployment:**
```bash
curl https://email-template-api-53407187172.us-central1.run.app/
# Should return: {"version": "2.2.0", "endpoints": ["/pr-notification", "/sales-notification"]}
```

### 2. Deploy Supabase Edge Function

```bash
# Deploy the sales-mailer function
npx supabase functions deploy sales-mailer --project-ref ibsisfnjxeowvdtvgzff
```

**Required secrets (already configured from github-devops-notify):**
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key
- `GMAIL_SENDER_EMAIL` - Default sender email (optional)

If secrets need to be set:
```bash
npx supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL="your-sa@project.iam.gserviceaccount.com" --project-ref ibsisfnjxeowvdtvgzff
npx supabase secrets set GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..." --project-ref ibsisfnjxeowvdtvgzff
```

### 3. Frontend Deployment

Frontend deploys automatically via Vercel on git push.

**Access the dashboard:**
```
https://hushh.ai/sales-mailing
# or locally
http://localhost:5173/sales-mailing
```

## Usage

### Dashboard Features

1. **From Email**: Select from authorized senders (manish@hushh.ai, ankit@hushh.ai, neelesh@hushh.ai)

2. **To Recipients**: Enter comma-separated email addresses
   - Names are automatically extracted from emails
   - Example: `john.doe@company.com` → "John Doe"

3. **Template Customization** (expandable):
   - Badge Text (default: "Hushh Fund A")
   - Subtitle (default: "ADFW Follow-up")
   - Intro Highlight (underlined phrase)
   - CTA Button Text & URL

4. **Send Button**: Processes all recipients with 200ms delay between emails

### API Request Format

```json
POST https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/sales-mailer
Content-Type: application/json

{
  "from": "manish@hushh.ai",
  "to": "investor1@fund.com, investor2@company.com",
  "salesData": {
    "badgeText": "Hushh Fund A",
    "subtitle": "ADFW Follow-up",
    "introHighlight": "long-duration capital",
    "ctaText": "Connect",
    "ctaUrl": "https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives"
  }
}
```

### API Response Format

```json
{
  "success": true,
  "summary": {
    "total": 10,
    "sent": 9,
    "failed": 1
  },
  "results": [
    {
      "email": "investor1@fund.com",
      "success": true,
      "messageId": "abc123..."
    },
    {
      "email": "invalid@fake.com",
      "success": false,
      "error": "Gmail API error: Invalid recipient"
    }
  ]
}
```

## Email Template

The sales email uses a luxury dark theme with:
- Gold accent color (#C4A661)
- Hushh logo
- Personalized recipient name
- Vision quote section
- Calendly CTA button
- Sender signature

**Template Preview:**
- Background: #050505 (dark)
- Card: #0f0f0f
- Accent: Gold gradient
- Font: Georgia (serif) + Arial (sans-serif)

## Rate Limiting

- **200ms delay** between emails to avoid Gmail API rate limits
- **Max ~300 emails/minute** theoretically (but recommend batches of 50-100)
- Gmail API limits: 2000 emails/day per user

## Troubleshooting

### Email not sending

1. Check Supabase logs:
```bash
npx supabase functions logs sales-mailer --project-ref ibsisfnjxeowvdtvgzff
```

2. Verify secrets are set:
```bash
npx supabase secrets list --project-ref ibsisfnjxeowvdtvgzff
```

3. Check Gmail API quotas in Google Cloud Console

### Template not rendering

1. Test Cloud Run endpoint directly:
```bash
curl -X POST https://email-template-api-53407187172.us-central1.run.app/sales-notification \
  -H "Content-Type: application/json" \
  -d '{"salesData": {"recipientName": "Test User", "senderName": "Manish"}}'
```

2. Check Cloud Run logs in GCP Console

### Authorization errors

- Ensure Domain-Wide Delegation is configured in Google Workspace Admin
- Verify the sender email is in the hushh.ai domain
- Check the Gmail API scopes: `https://www.googleapis.com/auth/gmail.send`

## Security Considerations

1. **No authentication required** on the dashboard currently - consider adding if needed
2. **Rate limiting** is handled per-request but no global limits
3. **Sender emails** are limited to known Hushh team members
4. **Domain-Wide Delegation** only works for hushh.ai domain emails

## Future Improvements

- [ ] Add authentication to dashboard (restrict to Hushh team)
- [ ] Add email analytics/tracking
- [ ] Add template preview before sending
- [ ] Add CSV upload for bulk recipients
- [ ] Add scheduling for delayed sending
- [ ] Add unsubscribe link management

## Quick Test

After deployment, test with:

1. Go to `https://hushh.ai/sales-mailing`
2. Select sender: `ankit@hushh.ai`
3. Enter your test email as recipient
4. Click "Send to 1 Recipient"
5. Check your inbox for the Fund A email

---

**Support:** Contact @ankit for technical issues.
