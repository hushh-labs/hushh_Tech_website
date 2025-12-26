/**
 * Email Template for GitHub PR Merge Notifications
 * 
 * Generates professional HTML emails for PR merge notifications
 * following modern design principles with clean blue accent
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
  // Detect type from PR title or labels
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

  // Clean subject - ASCII only, no emojis
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
  html = html.replace(/^## (.+)$/gm, '<h4 style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin: 20px 0 8px 0;">$1</h4>');
  
  // Convert markdown links [text](url) to HTML
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: none;">$1</a>');
  
  // Convert **bold** to <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert `code` to <code>
  html = html.replace(/`([^`]+)`/g, '<code style="background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-family: monospace; font-size: 12px;">$1</code>');
  
  // Convert bullet points
  html = html.replace(/^- (.+)$/gm, '<li style="margin: 4px 0;">$1</li>');
  
  // Wrap consecutive <li> items in <ul>
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="list-style: disc; padding-left: 20px; margin: 8px 0;">$&</ul>');
  
  // Convert numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li style="margin: 4px 0;">$1</li>');
  
  // Convert line breaks to <br> (but not after block elements)
  html = html.replace(/\n(?!<)/g, '<br>');
  
  return html;
}

/**
 * Generate the full HTML email content - Professional clean design
 */
export function generateEmailHtml(pr: PRData): string {
  const description = formatDescription(pr.prDescription);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PR #${pr.prNumber} Merged - ${escapeHtml(pr.prTitle)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; line-height: 1.5;">
  
  <!-- Main Container -->
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Email Card -->
        <table role="presentation" style="width: 100%; max-width: 700px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(to right, #eff6ff, #ffffff); border-bottom: 1px solid #e5e7eb; padding: 32px;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                      <span style="font-size: 32px;">🎉</span>
                      <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Pull Request Merged!</h1>
                    </div>
                    <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 16px;">
                      A new change has been merged to <code style="font-family: monospace; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 14px; color: #374151;">${escapeHtml(pr.baseBranch)}</code>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 24px 32px;">
              
              <!-- PR Title -->
              <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: #111827; line-height: 1.4;">
                <a href="${pr.prUrl}" style="color: #111827; text-decoration: none;">#${pr.prNumber} ${escapeHtml(pr.prTitle)}</a>
              </h2>
              
              <!-- Author Info Row -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 16px;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Raised By</p>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${getInitials(pr.author.login)}</div>
                      <a href="${pr.author.profileUrl}" style="font-weight: 500; color: #111827; text-decoration: none;">${escapeHtml(pr.author.login)}</a>
                    </div>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 16px;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Merged By</p>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; background: #d1fae5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${getInitials(pr.mergedBy.login)}</div>
                      <a href="${pr.mergedBy.profileUrl}" style="font-weight: 500; color: #111827; text-decoration: none;">${escapeHtml(pr.mergedBy.login)}</a>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Timestamps & Branch Info Box -->
              <table role="presentation" style="width: 100%; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 50%; vertical-align: top; padding-right: 12px;">
                          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <span style="color: #2563eb; font-weight: 600; font-size: 13px;">⏱ PR Raised</span>
                          </div>
                          <p style="margin: 0; font-size: 13px; color: #6b7280;">${pr.createdAt}</p>
                        </td>
                        <td style="width: 50%; vertical-align: top; padding-left: 12px;">
                          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                            <span style="color: #059669; font-weight: 600; font-size: 13px;">✓ Merged</span>
                          </div>
                          <p style="margin: 0; font-size: 13px; color: #6b7280;">${pr.mergedAt}</p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Branch Flow -->
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <div style="display: flex; align-items: center; gap: 8px; font-family: monospace; font-size: 13px;">
                        <span style="background: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 4px;">${escapeHtml(pr.headBranch)}</span>
                        <span style="color: #9ca3af;">→</span>
                        <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; border: 1px solid #93c5fd;">${escapeHtml(pr.baseBranch)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Stats Row -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="width: 33.33%; text-align: left;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Files Changed</p>
                    <span style="font-size: 18px; font-weight: 700; color: #111827;">${pr.filesChanged}</span>
                  </td>
                  <td style="width: 33.33%; text-align: left;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Additions</p>
                    <span style="font-size: 18px; font-weight: 700; color: #059669;">+${pr.additions}</span>
                  </td>
                  <td style="width: 33.33%; text-align: left;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">Deletions</p>
                    <span style="font-size: 18px; font-weight: 700; color: #dc2626;">-${pr.deletions}</span>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <!-- Description Section -->
              <div style="margin-bottom: 24px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                  <span style="font-size: 18px;">📝</span>
                  <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">Description</h3>
                </div>
                <div style="color: #374151; font-size: 14px; line-height: 1.6;">
                  ${description}
                </div>
              </div>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td>
                    <a href="${pr.prUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500; font-size: 15px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                      View Pull Request →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer within card -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 16px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                  This notification was sent by <strong style="color: #111827;">Hushh DevOps Bot</strong>
                </p>
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
                  <a href="${pr.repoUrl}" style="color: #2563eb; text-decoration: none;">${escapeHtml(pr.repoName)}</a>
                </p>
                <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                  © ${new Date().getFullYear()} Hushh.ai • Privacy-First Technology
                </p>
              </div>
              
            </td>
          </tr>
          
        </table>
        <!-- End Email Card -->
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}
