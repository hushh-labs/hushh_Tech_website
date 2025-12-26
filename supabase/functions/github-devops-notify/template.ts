/**
 * Email Template for GitHub PR Merge Notifications
 * 
 * Email-safe HTML using table-based layout with inline styles
 * Compatible with Gmail, Outlook, and other email clients
 */

interface PRData {
  prNumber: number;
  prTitle: string;
  prUrl: string;
  prDescription: string;
  author: {
    login: string;
    avatarUrl: string;
    profileUrl: string;
  };
  mergedBy: {
    login: string;
    avatarUrl: string;
    profileUrl: string;
  };
  createdAt: string;
  mergedAt: string;
  baseBranch: string;
  headBranch: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  commits: Array<{
    sha: string;
    message: string;
    author: string;
  }>;
  labels: string[];
  repoName: string;
  repoUrl: string;
}

/**
 * Generate email subject line (ASCII only - no emojis to avoid encoding issues)
 */
export function generateEmailSubject(pr: PRData): string {
  let type = "MERGED";
  const titleLower = pr.prTitle.toLowerCase();
  
  if (titleLower.startsWith("fix") || pr.labels.includes("bug")) {
    type = "BUGFIX";
  } else if (titleLower.startsWith("feat") || pr.labels.includes("feature")) {
    type = "FEATURE";
  } else if (titleLower.startsWith("docs") || pr.labels.includes("documentation")) {
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
function escapeHtml(text: string): string {
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
function getInitials(username: string): string {
  return username.charAt(0).toUpperCase();
}

/**
 * Convert markdown-style formatting to HTML for description
 */
function formatDescription(description: string): string {
  if (!description) return '<p style="color: #6b7280; margin: 0;">No description provided.</p>';
  
  let html = escapeHtml(description);
  
  // Convert ## headers to styled sections
  html = html.replace(/^## (.+)$/gm, '</p><h4 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 20px 0 8px 0;">$1</h4><p style="color: #374151; margin: 0;">');
  
  // Convert markdown links [text](url) to HTML
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: none;">$1</a>');
  
  // Convert **bold** to <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert `code` to <code>
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 12px;">$1</code>');
  
  // Convert bullet points - wrap in table for better email support
  html = html.replace(/^- (.+)$/gm, '<tr><td style="padding: 2px 0; color: #374151;">• $1</td></tr>');
  
  // Wrap consecutive bullet items
  html = html.replace(/(<tr><td[^>]*>•[^<]*<\/td><\/tr>\n?)+/g, '<table role="presentation" cellpadding="0" cellspacing="0" style="margin: 8px 0 8px 16px;">$&</table>');
  
  // Convert numbered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<tr><td style="padding: 2px 0; color: #374151;">$1. $2</td></tr>');
  
  // Convert line breaks
  html = html.replace(/\n(?!<)/g, '<br>');
  
  return `<p style="color: #374151; margin: 0;">${html}</p>`;
}

/**
 * Generate the full HTML email content - Email-safe table-based layout
 */
export function generateEmailHtml(pr: PRData): string {
  const description = formatDescription(pr.prDescription);
  
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PR #${pr.prNumber} Merged</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; -webkit-font-smoothing: antialiased;">
  
  <!-- Wrapper Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 700px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
          
          <!-- Header Section -->
          <tr>
            <td style="background-color: #eff6ff; border-bottom: 1px solid #e5e7eb; padding: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50" valign="top" style="padding-right: 12px;">
                    <span style="font-size: 32px;">🎉</span>
                  </td>
                  <td valign="top">
                    <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: bold; color: #111827; line-height: 1.2;">Pull Request Merged!</h1>
                    <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                      A new change has been merged to <code style="font-family: monospace; background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 14px; color: #374151;">${escapeHtml(pr.baseBranch)}</code>
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
              <h2 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #111827; line-height: 1.4;">
                <a href="${pr.prUrl}" style="color: #111827; text-decoration: none;">#${pr.prNumber} ${escapeHtml(pr.prTitle)}</a>
              </h2>
              
              <!-- Author & Merger Row -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <!-- Raised By -->
                  <td width="50%" valign="top" style="padding-right: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">RAISED BY</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" height="28" style="background-color: #dbeafe; border-radius: 14px; text-align: center; vertical-align: middle;">
                          <span style="color: #2563eb; font-size: 12px; font-weight: bold; line-height: 28px;">${getInitials(pr.author.login)}</span>
                        </td>
                        <td style="padding-left: 10px;">
                          <a href="${pr.author.profileUrl}" style="font-weight: 500; color: #111827; text-decoration: none; font-size: 14px;">${escapeHtml(pr.author.login)}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Merged By -->
                  <td width="50%" valign="top" style="padding-left: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">MERGED BY</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="28" height="28" style="background-color: #d1fae5; border-radius: 14px; text-align: center; vertical-align: middle;">
                          <span style="color: #059669; font-size: 12px; font-weight: bold; line-height: 28px;">${getInitials(pr.mergedBy.login)}</span>
                        </td>
                        <td style="padding-left: 10px;">
                          <a href="${pr.mergedBy.profileUrl}" style="font-weight: 500; color: #111827; text-decoration: none; font-size: 14px;">${escapeHtml(pr.mergedBy.login)}</a>
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
                    <!-- Timestamps Row -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 12px;">
                          <p style="margin: 0 0 4px 0; color: #2563eb; font-weight: 600; font-size: 13px;">⏱ PR Raised</p>
                          <p style="margin: 0; font-size: 13px; color: #6b7280;">${pr.createdAt}</p>
                        </td>
                        <td width="50%" valign="top" style="padding-left: 12px;">
                          <p style="margin: 0 0 4px 0; color: #059669; font-weight: 600; font-size: 13px;">✓ Merged</p>
                          <p style="margin: 0; font-size: 13px; color: #6b7280;">${pr.mergedAt}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Branch Flow -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <tr>
                        <td>
                          <span style="display: inline-block; background: #e5e7eb; color: #374151; padding: 4px 10px; border-radius: 4px; font-family: monospace; font-size: 13px;">${escapeHtml(pr.headBranch)}</span>
                          <span style="display: inline-block; color: #9ca3af; padding: 0 8px;">→</span>
                          <span style="display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 10px; border-radius: 4px; border: 1px solid #93c5fd; font-family: monospace; font-size: 13px;">${escapeHtml(pr.baseBranch)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Stats Row -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td width="33%" valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">FILES CHANGED</p>
                    <span style="font-size: 20px; font-weight: bold; color: #111827;">${pr.filesChanged}</span>
                  </td>
                  <td width="33%" valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">ADDITIONS</p>
                    <span style="font-size: 20px; font-weight: bold; color: #10b981;">+${pr.additions}</span>
                  </td>
                  <td width="33%" valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">DELETIONS</p>
                    <span style="font-size: 20px; font-weight: bold; color: #ef4444;">-${pr.deletions}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td style="border-top: 1px solid #e5e7eb; height: 1px; font-size: 0; line-height: 0;">&nbsp;</td>
                </tr>
              </table>
              
              <!-- Description Section -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                      <tr>
                        <td width="30" valign="middle">
                          <span style="font-size: 20px;">📝</span>
                        </td>
                        <td valign="middle">
                          <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #111827;">Description</h3>
                        </td>
                      </tr>
                    </table>
                    <div style="color: #374151; font-size: 14px; line-height: 1.6;">
                      ${description}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #2563eb;">
                    <a href="${pr.prUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 6px;">View Pull Request →</a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 16px;">
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
