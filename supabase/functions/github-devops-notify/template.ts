/**
 * Email Template for GitHub PR Merge Notifications
 * 
 * Generates beautiful HTML emails for PR merge notifications
 * following Hushh brand guidelines
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
 * Convert markdown-style links and formatting to HTML
 */
function formatDescription(description: string): string {
  if (!description) return "<p style='color: #6B7280;'>No description provided.</p>";
  
  let html = escapeHtml(description);
  
  // Convert markdown links [text](url) to HTML
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #4F46E5;">$1</a>');
  
  // Convert **bold** to <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert `code` to <code>
  html = html.replace(/`([^`]+)`/g, '<code style="background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
  
  // Convert line breaks to <br>
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

/**
 * Generate the full HTML email content
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
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1E1E1E 0%, #2D2D2D 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
              <img src="https://hushh.ai/images/hushh-logo-white.png" alt="Hushh" style="height: 40px; margin-bottom: 20px;" />
              <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600;">
                🎉 Pull Request Merged!
              </h1>
              <p style="color: #A3A3A3; margin: 10px 0 0 0; font-size: 14px;">
                A new change has been merged to <code style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 4px; color: #10B981;">${pr.baseBranch}</code>
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 30px; border-left: 1px solid #E5E7EB; border-right: 1px solid #E5E7EB;">
              
              <!-- PR Title & Number -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td>
                    <a href="${pr.prUrl}" style="text-decoration: none;">
                      <h2 style="color: #111827; margin: 0; font-size: 20px; font-weight: 600;">
                        <span style="color: #6366F1;">#${pr.prNumber}</span> ${escapeHtml(pr.prTitle)}
                      </h2>
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Labels -->
              ${pr.labels.length > 0 ? `
              <table role="presentation" style="width: 100%; margin-bottom: 20px;">
                <tr>
                  <td>
                    ${pr.labels.map(label => `
                      <span style="display: inline-block; background: #EEF2FF; color: #4F46E5; padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 500; margin-right: 6px; margin-bottom: 6px;">
                        ${escapeHtml(label)}
                      </span>
                    `).join('')}
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Author & Merger Info -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <!-- Created By -->
                  <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                    <div style="background: #F9FAFB; border-radius: 8px; padding: 16px;">
                      <p style="color: #6B7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Raised By</p>
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="width: 40px; vertical-align: middle;">
                            <img src="${pr.author.avatarUrl}" alt="${pr.author.login}" style="width: 36px; height: 36px; border-radius: 50%;" />
                          </td>
                          <td style="vertical-align: middle; padding-left: 10px;">
                            <a href="${pr.author.profileUrl}" style="color: #111827; text-decoration: none; font-weight: 500;">${pr.author.login}</a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                  
                  <!-- Merged By -->
                  <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                    <div style="background: #ECFDF5; border-radius: 8px; padding: 16px;">
                      <p style="color: #059669; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Merged By</p>
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="width: 40px; vertical-align: middle;">
                            <img src="${pr.mergedBy.avatarUrl}" alt="${pr.mergedBy.login}" style="width: 36px; height: 36px; border-radius: 50%;" />
                          </td>
                          <td style="vertical-align: middle; padding-left: 10px;">
                            <a href="${pr.mergedBy.profileUrl}" style="color: #111827; text-decoration: none; font-weight: 500;">${pr.mergedBy.login}</a>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Timestamps -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; background: #FEF3C7; border-radius: 8px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="width: 50%;">
                          <p style="color: #92400E; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">⏰ PR Raised</p>
                          <p style="color: #451A03; font-size: 13px; margin: 4px 0 0 0; font-weight: 500;">${pr.createdAt}</p>
                        </td>
                        <td style="width: 50%;">
                          <p style="color: #92400E; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">✅ Merged</p>
                          <p style="color: #451A03; font-size: 13px; margin: 4px 0 0 0; font-weight: 500;">${pr.mergedAt}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Branch Flow -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center; padding: 16px; background: #F3F4F6; border-radius: 8px;">
                    <code style="background: #374151; color: #F9FAFB; padding: 6px 12px; border-radius: 6px; font-size: 13px;">${escapeHtml(pr.headBranch)}</code>
                    <span style="color: #9CA3AF; margin: 0 12px; font-size: 18px;">→</span>
                    <code style="background: #10B981; color: #FFFFFF; padding: 6px 12px; border-radius: 6px; font-size: 13px;">${escapeHtml(pr.baseBranch)}</code>
                  </td>
                </tr>
              </table>
              
              <!-- Stats -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="width: 33.33%; text-align: center; padding: 16px; background: #F3F4F6; border-radius: 8px 0 0 8px;">
                    <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Files Changed</p>
                    <p style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">${pr.filesChanged}</p>
                  </td>
                  <td style="width: 33.33%; text-align: center; padding: 16px; background: #ECFDF5;">
                    <p style="color: #059669; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Additions</p>
                    <p style="color: #059669; font-size: 24px; font-weight: 700; margin: 0;">+${pr.additions}</p>
                  </td>
                  <td style="width: 33.33%; text-align: center; padding: 16px; background: #FEF2F2; border-radius: 0 8px 8px 0;">
                    <p style="color: #DC2626; font-size: 12px; margin: 0 0 4px 0; text-transform: uppercase;">Deletions</p>
                    <p style="color: #DC2626; font-size: 24px; font-weight: 700; margin: 0;">-${pr.deletions}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Description -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td>
                    <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      📝 Description
                    </h3>
                    <div style="background: #F9FAFB; border-radius: 8px; padding: 16px; border-left: 4px solid #6366F1;">
                      <div style="color: #374151; font-size: 14px;">
                        ${description}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center; padding: 20px 0;">
                    <a href="${pr.prUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: #FFFFFF; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);">
                      View Pull Request →
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #1E1E1E; border-radius: 0 0 12px 12px; padding: 24px 30px; text-align: center;">
              <p style="color: #9CA3AF; font-size: 13px; margin: 0 0 8px 0;">
                This notification was sent by <strong style="color: #FFFFFF;">Hushh DevOps Bot</strong>
              </p>
              <p style="color: #6B7280; font-size: 12px; margin: 0;">
                <a href="${pr.repoUrl}" style="color: #6366F1; text-decoration: none;">${pr.repoName}</a>
              </p>
              <p style="color: #6B7280; font-size: 11px; margin: 16px 0 0 0;">
                © ${new Date().getFullYear()} Hushh.ai • Privacy-First Technology
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
