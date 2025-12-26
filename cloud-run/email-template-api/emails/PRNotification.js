/**
 * PR Notification Email Template - Pure JavaScript (Gmail-Safe)
 * 
 * This generates Gmail-compatible HTML using table-based layout
 * with bgcolor HTML attributes instead of CSS background-color.
 * 
 * Gmail strips: background-color CSS, border-radius, box-shadow, gradients
 * Gmail keeps: bgcolor attribute, border attribute, inline styles on td
 */

// Color palette
const colors = {
  primary: '#2563eb',
  success: '#10b981',
  danger: '#ef4444',
  bgLight: '#f9fafb',
  bgCard: '#ffffff',
  bgMuted: '#f3f4f6',
  bgBlue: '#eff6ff',
  textDark: '#1f2937',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  borderBlue: '#93c5fd',
  bgBlueBadge: '#dbeafe',
  bgGreenBadge: '#d1fae5',
  textBlue: '#1d4ed8',
  textGreen: '#059669',
};

// Helper to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Format description with basic markdown
function formatDescription(description) {
  if (!description) return '<p style="color: #6b7280; margin: 0;">No description provided.</p>';
  
  let html = escapeHtml(description);
  
  // Convert ## headers
  html = html.replace(/^## (.+)$/gm, '<h4 style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 24px 0 8px 0;">$1</h4>');
  
  // Convert markdown links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: none;">$1</a>');
  
  // Convert **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f3f4f6; padding: 2px 6px; font-family: ui-monospace, monospace; font-size: 12px;">$1</code>');
  
  // Convert bullet points
  html = html.replace(/^- (.+)$/gm, '&#8226; $1<br/>');
  
  // Convert numbered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '$1. $2<br/>');
  
  // Convert line breaks
  html = html.replace(/\n/g, '<br/>');
  
  return `<div style="color: #374151; font-size: 14px; line-height: 1.6;">${html}</div>`;
}

/**
 * Generate Gmail-Safe HTML Email using tables with bgcolor
 * @param {Object} pr - PR data object
 * @returns {string} - HTML email string
 */
export function generatePRNotificationEmail(pr) {
  const authorInitial = pr?.author?.login?.charAt(0)?.toUpperCase() || 'U';
  const mergerInitial = pr?.mergedBy?.login?.charAt(0)?.toUpperCase() || 'U';
  const description = formatDescription(pr?.prDescription);

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>PR #${pr?.prNumber} Merged</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Outer Wrapper Table with bgcolor -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" bgcolor="${colors.bgLight}" style="min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main Card Table -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="700" bgcolor="${colors.bgCard}" style="max-width: 700px; border: 1px solid ${colors.border};">
          
          <!-- Header Section -->
          <tr>
            <td bgcolor="${colors.bgBlue}" style="padding: 32px; border-bottom: 1px solid ${colors.border};">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 36px; display: block; margin-bottom: 8px;">🎉</span>
                    <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700; color: ${colors.textDark};">Pull Request Merged!</h1>
                    <p style="margin: 0; color: ${colors.textMuted}; font-size: 16px;">
                      A new change has been merged to <code style="font-family: ui-monospace, monospace; background-color: ${colors.bgMuted}; padding: 4px 8px; font-size: 14px; color: ${colors.textDark};">${escapeHtml(pr?.baseBranch || 'main')}</code>
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
              <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: ${colors.textDark}; line-height: 1.4;">
                <a href="${pr?.prUrl}" style="color: ${colors.textDark}; text-decoration: none;">#${pr?.prNumber} ${escapeHtml(pr?.prTitle)}</a>
              </h2>
              
              <!-- Author & Merger Row -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td valign="top" width="50%" style="padding-right: 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${colors.textMuted};">Raised By</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="24" height="24" bgcolor="${colors.bgBlueBadge}" style="text-align: center; vertical-align: middle;">
                          <span style="color: ${colors.primary}; font-size: 11px; font-weight: 700; line-height: 24px;">${authorInitial}</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <a href="${pr?.author?.profileUrl || '#'}" style="font-weight: 500; color: ${colors.textDark}; text-decoration: none; font-size: 14px;">${escapeHtml(pr?.author?.login || 'Unknown')}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" width="50%">
                    <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${colors.textMuted};">Merged By</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="24" height="24" bgcolor="${colors.bgGreenBadge}" style="text-align: center; vertical-align: middle;">
                          <span style="color: ${colors.textGreen}; font-size: 11px; font-weight: 700; line-height: 24px;">${mergerInitial}</span>
                        </td>
                        <td style="padding-left: 8px;">
                          <a href="${pr?.mergedBy?.profileUrl || '#'}" style="font-weight: 500; color: ${colors.textDark}; text-decoration: none; font-size: 14px;">${escapeHtml(pr?.mergedBy?.login || 'Unknown')}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Timestamps & Branch Box -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" bgcolor="${colors.bgLight}" style="border: 1px solid ${colors.border}; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 16px;">
                          <p style="margin: 0 0 6px 0; color: ${colors.primary}; font-weight: 600; font-size: 13px;">⏱ PR Raised</p>
                          <p style="margin: 0; font-size: 13px; color: ${colors.textMuted};">${pr?.createdAt || 'N/A'}</p>
                        </td>
                        <td width="50%" valign="top" style="padding-left: 16px;">
                          <p style="margin: 0 0 6px 0; color: ${colors.success}; font-weight: 600; font-size: 13px;">✓ Merged</p>
                          <p style="margin: 0; font-size: 13px; color: ${colors.textMuted};">${pr?.mergedAt || 'N/A'}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Branch Flow -->
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid ${colors.border};">
                      <tr>
                        <td>
                          <span style="display: inline-block; background-color: ${colors.border}; color: ${colors.textDark}; padding: 4px 10px; font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(pr?.headBranch || 'feature')}</span>
                          <span style="color: ${colors.textMuted}; padding: 0 8px;">→</span>
                          <span style="display: inline-block; background-color: ${colors.bgBlueBadge}; color: ${colors.textBlue}; padding: 4px 10px; border: 1px solid ${colors.borderBlue}; font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(pr?.baseBranch || 'main')}</span>
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
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${colors.textMuted};">Files Changed</p>
                    <span style="font-size: 18px; font-weight: 700; color: ${colors.textDark};">${pr?.filesChanged || 0}</span>
                  </td>
                  <td valign="top" style="padding-right: 32px;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${colors.textMuted};">Additions</p>
                    <span style="font-size: 18px; font-weight: 700; color: ${colors.success};">+${pr?.additions || 0}</span>
                  </td>
                  <td valign="top">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${colors.textMuted};">Deletions</p>
                    <span style="font-size: 18px; font-weight: 700; color: ${colors.danger};">-${pr?.deletions || 0}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td style="border-top: 1px solid ${colors.border};"></td>
                </tr>
              </table>
              
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
                          <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: ${colors.textDark};">Description</h3>
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
                  <td bgcolor="${colors.primary}" style="padding: 14px 24px;">
                    <a href="${pr?.prUrl}" target="_blank" style="display: inline-block; font-size: 15px; font-weight: 500; color: #ffffff; text-decoration: none;">
                      View Pull Request →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid ${colors.border}; padding-top: 24px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: ${colors.textMuted};">
                      This notification was sent by <strong style="color: ${colors.textDark};">Hushh DevOps Bot</strong>
                    </p>
                    <p style="margin: 0 0 16px 0; font-size: 13px; color: ${colors.textMuted};">
                      <a href="${pr?.repoUrl}" style="color: ${colors.primary}; text-decoration: none;">${escapeHtml(pr?.repoName || 'Repository')}</a>
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

export default generatePRNotificationEmail;
