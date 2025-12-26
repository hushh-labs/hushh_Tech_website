/**
 * GitHub PR Notification Email Template
 * 
 * This template generates HTML for PR merge notification emails.
 * Uses inline styles for email client compatibility.
 * 
 * Location: Main codebase (not in Edge Function)
 * Called by: Vercel API endpoint → Supabase Edge Function
 */

export interface PRData {
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
  labels: string[];
  repoName: string;
  repoUrl: string;
}

/**
 * Get initials from username
 */
function getInitials(username: string): string {
  return username.charAt(0).toUpperCase();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Format description with basic markdown support
 */
function formatDescription(description: string): string {
  if (!description) return '<p style="color: #6b7280; margin: 0;">No description provided.</p>';
  
  let html = escapeHtml(description);
  
  // Convert ## headers
  html = html.replace(/^## (.+)$/gm, 
    '<h4 style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 24px 0 8px 0;">$1</h4>');
  
  // Convert markdown links [text](url) to HTML
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
    '<a href="$2" style="color: #2563eb; text-decoration: none;">$1</a>');
  
  // Convert **bold** to <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert `code` to <code>
  html = html.replace(/`([^`]+)`/g, 
    '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 12px;">$1</code>');
  
  // Convert bullet points
  html = html.replace(/^- (.+)$/gm, 
    '<li style="margin: 4px 0; color: #374151;">$1</li>');
  
  // Wrap consecutive <li> in <ul>
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
 * Generate email subject line
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
 * Generate the full HTML email content with new UI design
 * Uses inline styles for email client compatibility
 */
export function generateEmailHtml(pr: PRData): string {
  const description = formatDescription(pr.prDescription);
  const authorInitial = getInitials(pr.author.login);
  const mergerInitial = getInitials(pr.mergedBy.login);
  
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
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb; -webkit-font-smoothing: antialiased;">
  
  <!-- Wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 700px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
          
          <!-- Header Section -->
          <tr>
            <td style="background: linear-gradient(to right, #eff6ff, #ffffff); border-bottom: 1px solid #e5e7eb; padding: 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                      <span style="font-size: 36px;">🎉</span>
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #111827;">Pull Request Merged!</h1>
                    </div>
                    <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
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
              <h2 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 600; color: #111827; line-height: 1.4;">
                <a href="${pr.prUrl}" style="color: #111827; text-decoration: none;">#${pr.prNumber} ${escapeHtml(pr.prTitle)}</a>
              </h2>
              
              <!-- Author & Merger Row -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td valign="top" style="padding-right: 32px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">RAISED BY</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="24" height="24" style="background-color: #dbeafe; border-radius: 12px; text-align: center; vertical-align: middle;">
                          <span style="color: #2563eb; font-size: 11px; font-weight: 700; line-height: 24px;">${authorInitial}</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <a href="${pr.author.profileUrl}" style="font-weight: 500; color: #111827; text-decoration: none; font-size: 14px;">${escapeHtml(pr.author.login)}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">MERGED BY</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="24" height="24" style="background-color: #d1fae5; border-radius: 12px; text-align: center; vertical-align: middle;">
                          <span style="color: #059669; font-size: 11px; font-weight: 700; line-height: 24px;">${mergerInitial}</span>
                        </td>
                        <td style="padding-left: 8px;">
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
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 16px;">
                          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="color: #2563eb; font-weight: 600; font-size: 13px;">⏱ PR Raised</span>
                          </div>
                          <p style="margin: 0; font-size: 13px; color: #6b7280;">${pr.createdAt}</p>
                        </td>
                        <td width="50%" valign="top" style="padding-left: 16px;">
                          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="color: #10b981; font-weight: 600; font-size: 13px;">✓ Merged</span>
                          </div>
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
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">FILES CHANGED</p>
                    <span style="font-size: 20px; font-weight: 700; color: #111827;">${pr.filesChanged}</span>
                  </td>
                  <td valign="top" style="padding-right: 32px;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">ADDITIONS</p>
                    <span style="font-size: 20px; font-weight: 700; color: #10b981;">+${pr.additions}</span>
                  </td>
                  <td valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #6b7280;">DELETIONS</p>
                    <span style="font-size: 20px; font-weight: 700; color: #ef4444;">-${pr.deletions}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              
              <!-- Description Section -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                      <span style="font-size: 20px;">📝</span>
                      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">Description</h3>
                    </div>
                    ${description}
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #2563eb;">
                    <a href="${pr.prUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 8px;">
                      View Pull Request <span style="margin-left: 8px;">→</span>
                    </a>
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

export default {
  generateEmailHtml,
  generateEmailSubject,
};
