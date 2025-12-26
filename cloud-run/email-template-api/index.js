/**
 * Google Cloud Run API for GitHub PR Notification Email Template
 * 
 * This API generates Gmail-compatible HTML emails using pure JavaScript.
 * Uses table-based layout with bgcolor HTML attributes (Gmail-safe).
 * 
 * POST /pr-notification
 * Body: { prData: PRData }
 * Returns: { html: string, subject: string }
 * 
 * GCP Project: hushone-app
 * Updated: Dec 27, 2025
 * - Gmail-safe template with bgcolor attributes
 */

import express from 'express';
import cors from 'cors';
import { generatePRNotificationEmail } from './emails/PRNotification.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Hushh Email Template API',
    version: '2.1.0',
    engine: 'Gmail-Safe Pure JS',
    endpoints: ['/pr-notification']
  });
});

// PR Notification Email Template Endpoint
app.post('/pr-notification', async (req, res) => {
  try {
    const { prData } = req.body;

    if (!prData) {
      return res.status(400).json({ error: 'Missing prData in request body' });
    }

    // Generate email subject
    const subject = generateEmailSubject(prData);
    
    // Generate Gmail-safe HTML email
    const html = generatePRNotificationEmail(prData);

    console.log(`Generated email template for PR #${prData.prNumber}`);

    return res.status(200).json({
      success: true,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error generating email template:', error);
    return res.status(500).json({
      error: 'Failed to generate email template',
      message: error.message,
    });
  }
});

/**
 * Generate email subject line (ASCII only)
 */
function generateEmailSubject(pr) {
  let type = "MERGED";
  const titleLower = (pr.prTitle || '').toLowerCase();
  
  if (titleLower.startsWith("fix") || (pr.labels && pr.labels.includes("bug"))) {
    type = "BUGFIX";
  } else if (titleLower.startsWith("feat") || (pr.labels && pr.labels.includes("feature"))) {
    type = "FEATURE";
  } else if (titleLower.startsWith("docs") || (pr.labels && pr.labels.includes("documentation"))) {
    type = "DOCS";
  } else if (titleLower.startsWith("refactor")) {
    type = "REFACTOR";
  } else if (titleLower.startsWith("chore")) {
    type = "CHORE";
  } else if (titleLower.startsWith("hotfix")) {
    type = "HOTFIX";
  } else if (titleLower.startsWith("release")) {
    type = "RELEASE";
  }

  return `[Hushh DevOps] ${type}: PR #${pr.prNumber} merged to ${pr.baseBranch}`;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email Template API v2.1 (Gmail-Safe) running on port ${PORT}`);
});
