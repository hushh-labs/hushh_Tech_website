# 🔧 Email Delivery Debug Guide

## Issue Summary
- **Gmail API returned success** with Email ID: `19b5b283f999d431`
- **Email NOT received** at `dev-ops@hushh.ai`
- **Domain-Wide Delegation** works for `gmail.send` but needs `gmail.readonly` for verification

## 🔍 Immediate Checks Required

### 1. Check Spam Folder at dev-ops@hushh.ai
1. Log into `dev-ops@hushh.ai` Gmail
2. Go to **Spam** folder
3. Look for email from "Hushh DevOps" or "ankit@hushh.ai"
4. Subject contains: "PR #193 Merged"

### 2. Check Sent Folder at ankit@hushh.ai
1. Log into `ankit@hushh.ai` Gmail
2. Go to **Sent** folder
3. Look for email with subject containing "PR #193 Merged"
4. If found → Email was sent successfully but blocked/filtered

### 3. Verify dev-ops@hushh.ai Exists
1. Go to Google Admin Console: https://admin.google.com
2. Directory → Users
3. Confirm `dev-ops@hushh.ai` exists and can receive emails
4. Check if there are any email routing rules/filters

## 🛠️ Fix Domain-Wide Delegation

The DWD needs additional scopes for full functionality. Add these scopes:

### Go to Google Admin Console
1. https://admin.google.com
2. Security → API Controls → Domain-wide delegation
3. Find Client ID: `115893683073531844743`
4. Edit and ADD these scopes (comma-separated):

```
https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.compose
```

## 📧 Alternative: Test with Different Recipient

Send a test email to your own inbox to verify Gmail API is working:

```bash
curl -X POST "https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/github-devops-notify" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{
    "action": "closed",
    "pull_request": {
      "number": 999,
      "title": "Test Email Delivery",
      "merged": true,
      "body": "Testing if emails are delivered",
      "created_at": "2025-12-26T12:00:00Z",
      "merged_at": "2025-12-26T12:05:00Z",
      "user": {"login": "test-user", "avatar_url": "", "html_url": ""},
      "merged_by": {"login": "test-user", "avatar_url": "", "html_url": ""},
      "base": {"ref": "main"},
      "head": {"ref": "test-branch"},
      "changed_files": 1,
      "additions": 10,
      "deletions": 5,
      "labels": [],
      "html_url": "https://github.com/test/test/pull/999"
    },
    "repository": {
      "full_name": "hushh-labs/hushh_Tech_website",
      "html_url": "https://github.com/hushh-labs/hushh_Tech_website"
    }
  }'
```

## 🔄 Possible Causes & Solutions

| Cause | Solution |
|-------|----------|
| Email in spam | Mark as "Not Spam", add ankit@hushh.ai to contacts |
| dev-ops@hushh.ai is a group | Check group settings for external senders |
| Email routing rules | Review Admin Console → Gmail → Routing |
| SPF/DKIM issues | Check email headers for authentication failures |
| Bounce back | Check ankit@hushh.ai for bounce notifications |

## ✅ Quick Verification Steps

1. **Check dev-ops@hushh.ai SPAM folder** - Most likely location
2. **Check ankit@hushh.ai SENT folder** - Confirms email was sent
3. **Search in dev-ops@hushh.ai**: `from:ankit@hushh.ai` or `subject:PR #193`

---

**Service Account**: `hushh-github-notifier@hushone-app.iam.gserviceaccount.com`
**Client ID**: `115893683073531844743`
**Sender**: `ankit@hushh.ai`
**Recipient**: `dev-ops@hushh.ai`
**Email ID**: `19b5b283f999d431`
