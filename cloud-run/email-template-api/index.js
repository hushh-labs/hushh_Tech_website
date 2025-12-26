/**
 * Google Cloud Run API for GitHub PR Notification Email Template
 * 
 * This API receives PR data and returns the HTML email template.
 * The Supabase Edge Function calls this to get the email UI.
 * 
 * POST /pr-notification
 * Body: { prData: PRData }
 * Returns: { html: string, subject: string }
 * 
 * GCP Project: hushone-app
 * Created: Dec 26, 2025
 */

import express from 'express';
import cors from 'cors';

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
    version: '1.0.0',
    endpoints: ['/pr-notification']
  });
});

// PR Notification Email Template Endpoint
app.post('/pr-notification', (req, res) => {
  try {
    const { prData } = req.body;

    if (!prData) {
      return res.status(400).json({ error: 'Missing prData in request body' });
    }

    // Generate email subject and HTML
    const subject = generateEmailSubject(prData);
    const html = generateEmailHtml(prData);

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
  const titleLower = pr.prTitle.toLowerCase();
  
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

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Get initials from username
 */
function getInitials(username) {
  return username.charAt(0).toUpperCase();
}

/**
 * Format description with markdown support
 */
function formatDescription(description) {
  if (!description) return '<p style="color: #6b7280; margin: 0;">No description provided.</p>';
  
  let html = escapeHtml(description);
  
  // Convert ## headers
  html = html.replace(/^## (.+)$/gm, 
    '<h4 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 24px 0 8px 0;">$1</h4>');
  
  // Convert markdown links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" style="color: #2563eb; text-decoration: none;">$1</a>');
  
  // Convert **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert `code`
  html = html.replace(/`([^`]+)`/g, 
    '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 12px;">$1</code>');
  
  // Convert bullet points
  html = html.replace(/^- (.+)$/gm, 
    '<li style="margin: 4px 0; color: #374151;">$1</li>');
  
  // Wrap <li> in <ul>
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, 
    '<ul style="margin: 8px 0 8px 20px; padding: 0; list-style-type: disc;">$&</ul>');
  
  // Convert numbered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, 
    '<li style="margin: 4px 0; color: #374151;">$2</li>');
  
  // Convert line breaks
  html = html.replace(/\n(?!<)/g, '<br>');
  
  return `<div style="color: #374151; font-size: 14px; line-height: 1.6;">${html}</div>`;
}

/**
 * Generate the full HTML email content - Tailwind-inspired UI
 */
function generateEmailHtml(pr) {
  const description = formatDescription(pr.prDescription);
  const authorInitial = getInitials(pr.author?.login || 'U');
  const mergerInitial = getInitials(pr.mergedBy?.login || 'U');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>PR #${pr.prNumber} Merged</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; -webkit-font-smoothing: antialiased; min-height: 100vh;">
  
  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 700px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
          
          <!-- Header Section - Gradient Background -->
          <tr>
            <td style="background: linear-gradient(to right, #eff6ff, #ffffff); border-bottom: 1px solid #e5e7eb; padding: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <span style="font-size: 36px;">🎉</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #111827;">Pull Request Merged!</h1>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                      A new change has been merged to <code style="font-family: ui-monospace, monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 6px; font-size: 14px; color: #374151;">${escapeHtml(pr.baseBranch)}</code>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              
              <!-- PR Title -->
              <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: #111827; line-height: 1.4;">
                <a href="${pr.prUrl}" style="color: #111827; text-decoration: none;">#${pr.prNumber} ${escapeHtml(pr.prTitle)}</a>
              </h2>
              
              <!-- Author & Merger Row -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td valign="top" style="padding-right: 48px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Raised By</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="24" height="24" style="background-color: #dbeafe; border-radius: 50%; text-align: center; vertical-align: middle;">
                          <span style="color: #2563eb; font-size: 11px; font-weight: 700; line-height: 24px;">${authorInitial}</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <a href="${pr.author?.profileUrl || '#'}" style="font-weight: 500; color: #111827; text-decoration: none; font-size: 14px;">${escapeHtml(pr.author?.login || 'Unknown')}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Merged By</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="24" height="24" style="background-color: #d1fae5; border-radius: 50%; text-align: center; vertical-align: middle;">
                          <span style="color: #059669; font-size: 11px; font-weight: 700; line-height: 24px;">${mergerInitial}</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <a href="${pr.mergedBy?.profileUrl || '#'}" style="font-weight: 500; color: #111827; text-decoration: none; font-size: 14px;">${escapeHtml(pr.mergedBy?.login || 'Unknown')}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Timestamps & Branch Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 16px;">
                          <p style="margin: 0 0 6px 0; color: #2563eb; font-weight: 600; font-size: 13px;">⏱ PR Raised</p>
                          <p style="margin: 0; font-size: 13px; color: #6b7280;">${pr.createdAt}</p>
                        </td>
                        <td width="50%" valign="top" style="padding-left: 16px;">
                          <p style="margin: 0 0 6px 0; color: #10b981; font-weight: 600; font-size: 13px;">✓ Merged</p>
                          <p style="margin: 0; font-size: 13px; color: #6b7280;">${pr.mergedAt}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Branch Flow -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td>
                          <span style="display: inline-block; background: #e5e7eb; color: #374151; padding: 4px 10px; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(pr.headBranch)}</span>
                          <span style="display: inline-block; color: #9ca3af; padding: 0 8px;">→</span>
                          <span style="display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 10px; border-radius: 4px; border: 1px solid #93c5fd; font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(pr.baseBranch)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Stats Row -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td valign="top" style="padding-right: 32px;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Files Changed</p>
                    <span style="font-size: 18px; font-weight: 700; color: #111827;">${pr.filesChanged || 0}</span>
                  </td>
                  <td valign="top" style="padding-right: 32px;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Additions</p>
                    <span style="font-size: 18px; font-weight: 700; color: #10b981;">+${pr.additions || 0}</span>
                  </td>
                  <td valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">Deletions</p>
                    <span style="font-size: 18px; font-weight: 700; color: #ef4444;">-${pr.deletions || 0}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              
              <!-- Description Section -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 8px;">
                          <span style="font-size: 20px;">📝</span>
                        </td>
                        <td style="vertical-align: middle;">
                          <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">Description</h3>
                        </td>
                      </tr>
                    </table>
                    ${description}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0 40px 0;">
                <tr>
                  <td>
                    <a href="${pr.prUrl}" target="_blank" style="display: inline-block; padding: 14px 24px; font-size: 15px; font-weight: 500; color: #ffffff; background-color: #2563eb; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
                      View Pull Request <span style="margin-left: 8px;">→</span>
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                      This notification was sent by <strong style="color: #111827;">Hushh DevOps Bot</strong>
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
                      <a href="${pr.repoUrl}" style="color: #2563eb; text-decoration: none;">${escapeHtml(pr.repoName)}</a>
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                      © ${new Date().getFullYear()} Hushh.ai • Privacy-First Technology
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
        </table>
        <!-- End Main Card -->
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email Template API running on port ${PORT}`);
});
