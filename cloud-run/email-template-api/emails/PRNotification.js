/**
 * PR Notification Email Template - Gmail-safe (tables + bgcolor + inline styles)
 * - DO NOT use Tailwind / scripts in emails (Gmail strips)
 * - Use tables + bgcolor + inline styles for layout + colors
 */

const colors = {
  primary: "#2563eb",
  primaryDark: "#1d4ed8",
  success: "#10b981",
  danger: "#ef4444",

  bgPage: "#f9fafb",
  bgCard: "#ffffff",
  bgHeader: "#eff6ff",
  bgMuted: "#f3f4f6",

  border: "#e5e7eb",
  textDark: "#111827",
  textMuted: "#6b7280",

  badgeBlueBg: "#dbeafe",
  badgeBlueText: "#1d4ed8",
  badgeGreenBg: "#d1fae5",
  badgeGreenText: "#059669",

  chipBg: "#e5e7eb",
  chipText: "#374151",
};

const FONT_STACK =
  "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, Helvetica, sans-serif";
const MONO_STACK =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(url) {
  if (!url) return "#";
  // very light safety; avoid breaking attributes
  return String(url).replace(/"/g, "%22");
}

function formatInline(text) {
  let html = escapeHtml(text);

  // links: [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) =>
      `<a href="${safeUrl(url)}" style="color:${colors.primary}; text-decoration:underline;">${escapeHtml(
        label
      )}</a>`
  );

  // **bold**
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // `code`
  html = html.replace(
    /`([^`]+)`/g,
    `<span style="font-family:${MONO_STACK}; font-size:12px; background-color:${colors.bgMuted}; padding:2px 6px; border:1px solid ${colors.border};">$1</span>`
  );

  return html;
}

function formatDescription(md) {
  if (!md || !String(md).trim()) {
    return `<p style="margin:0; color:${colors.textMuted}; font-size:14px; line-height:1.6; font-family:${FONT_STACK};">
      No description provided.
    </p>`;
  }

  const lines = String(md).replace(/\r\n/g, "\n").split("\n");
  let out = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // blank line -> paragraph break
    if (!line.trim()) {
      closeLists();
      out.push(`<div style="height:10px; line-height:10px;">&nbsp;</div>`);
      continue;
    }

    // headings
    let m;
    if ((m = line.match(/^###\s+(.+)$/))) {
      closeLists();
      out.push(
        `<h4 style="margin:0 0 8px 0; font-family:${FONT_STACK}; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:${colors.textMuted};">
          ${formatInline(m[1])}
        </h4>`
      );
      continue;
    }
    if ((m = line.match(/^##\s+(.+)$/))) {
      closeLists();
      out.push(
        `<h3 style="margin:14px 0 8px 0; font-family:${FONT_STACK}; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:0.6px; color:${colors.textMuted};">
          ${formatInline(m[1])}
        </h3>`
      );
      continue;
    }
    if ((m = line.match(/^#\s+(.+)$/))) {
      closeLists();
      out.push(
        `<h2 style="margin:14px 0 10px 0; font-family:${FONT_STACK}; font-size:16px; font-weight:800; color:${colors.textDark};">
          ${formatInline(m[1])}
        </h2>`
      );
      continue;
    }

    // unordered list
    if ((m = line.match(/^- (.+)$/))) {
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push(
          `<ul style="margin:0; padding-left:18px; font-family:${FONT_STACK}; font-size:14px; line-height:1.6; color:${colors.textDark};">`
        );
        inUl = true;
      }
      out.push(`<li style="margin:0 0 6px 0;">${formatInline(m[1])}</li>`);
      continue;
    }

    // ordered list
    if ((m = line.match(/^(\d+)\.\s+(.+)$/))) {
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push(
          `<ol style="margin:0; padding-left:18px; font-family:${FONT_STACK}; font-size:14px; line-height:1.6; color:${colors.textDark};">`
        );
        inOl = true;
      }
      out.push(`<li style="margin:0 0 6px 0;">${formatInline(m[2])}</li>`);
      continue;
    }

    // normal paragraph
    closeLists();
    out.push(
      `<p style="margin:0; font-family:${FONT_STACK}; font-size:14px; line-height:1.7; color:${colors.textDark};">
        ${formatInline(line)}
      </p>`
    );
  }

  closeLists();

  return `<div>${out.join("")}</div>`;
}

export function generatePRNotificationEmail(pr) {
  const prNumber = pr?.prNumber ?? "";
  const prTitle = pr?.prTitle ?? "Pull Request";
  const prUrl = safeUrl(pr?.prUrl);
  const repoUrl = safeUrl(pr?.repoUrl);
  const repoName = pr?.repoName ?? "Repository";

  const baseBranch = pr?.baseBranch || "main";
  const headBranch = pr?.headBranch || "feature";

  const authorLogin = pr?.author?.login || "Unknown";
  const mergerLogin = pr?.mergedBy?.login || "Unknown";
  const authorUrl = safeUrl(pr?.author?.profileUrl);
  const mergerUrl = safeUrl(pr?.mergedBy?.profileUrl);

  const authorInitial = (authorLogin[0] || "U").toUpperCase();
  const mergerInitial = (mergerLogin[0] || "U").toUpperCase();

  const createdAt = pr?.createdAt || "N/A";
  const mergedAt = pr?.mergedAt || "N/A";

  const filesChanged = pr?.filesChanged ?? 0;
  const additions = pr?.additions ?? 0;
  const deletions = pr?.deletions ?? 0;

  const descriptionHtml = formatDescription(pr?.prDescription);

  const preheader = `PR #${prNumber} merged to ${baseBranch} • ${authorLogin} → ${mergerLogin}`;

  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PR #${escapeHtml(prNumber)} Merged</title>
</head>
<body style="margin:0; padding:0; background-color:${colors.bgPage};">
  <!-- Preheader (hidden) -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${colors.bgPage}" style="background-color:${colors.bgPage};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <!-- Container -->
        <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0"
               bgcolor="${colors.bgCard}"
               style="width:100%; max-width:680px; background-color:${colors.bgCard}; border:1px solid ${colors.border}; border-collapse:separate; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td bgcolor="${colors.bgHeader}" style="background-color:${colors.bgHeader}; padding:28px 24px; border-bottom:1px solid ${colors.border};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="44" valign="top" style="padding-right:10px;">
                    <div style="font-size:30px; line-height:30px;">🎉</div>
                  </td>
                  <td valign="top">
                    <div style="font-family:${FONT_STACK}; font-size:30px; font-weight:800; color:${colors.textDark}; margin:0;">
                      Pull Request Merged!
                    </div>
                    <div style="height:8px; line-height:8px;">&nbsp;</div>
                    <div style="font-family:${FONT_STACK}; font-size:16px; color:${colors.textMuted}; line-height:1.5;">
                      A new change has been merged to
                      <span style="font-family:${MONO_STACK}; font-size:13px; background-color:${colors.bgMuted}; padding:3px 8px; border:1px solid ${colors.border}; color:${colors.textDark};">
                        ${escapeHtml(baseBranch)}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px;">

              <!-- PR Title -->
              <div style="font-family:${FONT_STACK}; font-size:20px; font-weight:700; color:${colors.textDark}; line-height:1.35;">
                <a href="${prUrl}" style="color:${colors.textDark}; text-decoration:none;">
                  #${escapeHtml(prNumber)} ${escapeHtml(prTitle)}
                </a>
              </div>

              <div style="height:18px; line-height:18px;">&nbsp;</div>

              <!-- Raised/Merged By -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" valign="top" style="padding-right:10px;">
                    <div style="font-family:${FONT_STACK}; font-size:11px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:${colors.textMuted};">
                      Raised By
                    </div>
                    <div style="height:6px; line-height:6px;">&nbsp;</div>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="26" height="26" bgcolor="${colors.badgeBlueBg}"
                            style="background-color:${colors.badgeBlueBg}; text-align:center; vertical-align:middle;">
                          <span style="font-family:${FONT_STACK}; font-size:12px; font-weight:800; color:${colors.badgeBlueText}; line-height:26px;">
                            ${escapeHtml(authorInitial)}
                          </span>
                        </td>
                        <td style="padding-left:8px;">
                          <a href="${authorUrl}" style="font-family:${FONT_STACK}; font-size:14px; font-weight:600; color:${colors.textDark}; text-decoration:none;">
                            ${escapeHtml(authorLogin)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <td width="50%" valign="top" style="padding-left:10px;">
                    <div style="font-family:${FONT_STACK}; font-size:11px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:${colors.textMuted};">
                      Merged By
                    </div>
                    <div style="height:6px; line-height:6px;">&nbsp;</div>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="26" height="26" bgcolor="${colors.badgeGreenBg}"
                            style="background-color:${colors.badgeGreenBg}; text-align:center; vertical-align:middle;">
                          <span style="font-family:${FONT_STACK}; font-size:12px; font-weight:800; color:${colors.badgeGreenText}; line-height:26px;">
                            ${escapeHtml(mergerInitial)}
                          </span>
                        </td>
                        <td style="padding-left:8px;">
                          <a href="${mergerUrl}" style="font-family:${FONT_STACK}; font-size:14px; font-weight:600; color:${colors.textDark}; text-decoration:none;">
                            ${escapeHtml(mergerLogin)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="height:18px; line-height:18px;">&nbsp;</div>

              <!-- Timestamps + Branch box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     bgcolor="${colors.bgPage}"
                     style="background-color:${colors.bgPage}; border:1px solid ${colors.border};">
                <tr>
                  <td style="padding:16px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" valign="top" style="padding-right:10px;">
                          <div style="font-family:${FONT_STACK}; font-size:13px; font-weight:700; color:${colors.primary};">
                            ⏱ PR Raised
                          </div>
                          <div style="height:6px; line-height:6px;">&nbsp;</div>
                          <div style="font-family:${FONT_STACK}; font-size:13px; color:${colors.textMuted}; line-height:1.5;">
                            ${escapeHtml(createdAt)}
                          </div>
                        </td>
                        <td width="50%" valign="top" style="padding-left:10px;">
                          <div style="font-family:${FONT_STACK}; font-size:13px; font-weight:700; color:${colors.success};">
                            ✓ Merged
                          </div>
                          <div style="height:6px; line-height:6px;">&nbsp;</div>
                          <div style="font-family:${FONT_STACK}; font-size:13px; color:${colors.textMuted}; line-height:1.5;">
                            ${escapeHtml(mergedAt)}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <div style="height:12px; line-height:12px;">&nbsp;</div>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${colors.border};">
                      <tr>
                        <td style="padding-top:12px; font-family:${MONO_STACK}; font-size:12px; color:${colors.textDark};">
                          <span style="display:inline-block; background-color:${colors.chipBg}; padding:4px 10px; border:1px solid ${colors.border}; color:${colors.chipText};">
                            ${escapeHtml(headBranch)}
                          </span>
                          <span style="color:${colors.textMuted}; padding:0 8px;">→</span>
                          <span style="display:inline-block; background-color:${colors.badgeBlueBg}; padding:4px 10px; border:1px solid ${colors.border}; color:${colors.badgeBlueText};">
                            ${escapeHtml(baseBranch)}
                          </span>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <div style="height:18px; line-height:18px;">&nbsp;</div>

              <!-- Stats -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" style="padding-right:18px;">
                    <div style="font-family:${FONT_STACK}; font-size:11px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; color:${colors.textMuted};">
                      Files Changed
                    </div>
                    <div style="height:6px; line-height:6px;">&nbsp;</div>
                    <div style="font-family:${FONT_STACK}; font-size:18px; font-weight:800; color:${colors.textDark};">
                      ${escapeHtml(filesChanged)}
                    </div>
                  </td>

                  <td valign="top" style="padding-right:18px;">
                    <div style="font-family:${FONT_STACK}; font-size:11px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; color:${colors.textMuted};">
                      Additions
                    </div>
                    <div style="height:6px; line-height:6px;">&nbsp;</div>
                    <div style="font-family:${FONT_STACK}; font-size:18px; font-weight:800; color:${colors.success};">
                      +${escapeHtml(additions)}
                    </div>
                  </td>

                  <td valign="top">
                    <div style="font-family:${FONT_STACK}; font-size:11px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; color:${colors.textMuted};">
                      Deletions
                    </div>
                    <div style="height:6px; line-height:6px;">&nbsp;</div>
                    <div style="font-family:${FONT_STACK}; font-size:18px; font-weight:800; color:${colors.danger};">
                      -${escapeHtml(deletions)}
                    </div>
                  </td>
                </tr>
              </table>

              <div style="height:22px; line-height:22px;">&nbsp;</div>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid ${colors.border};"></td></tr>
              </table>

              <div style="height:18px; line-height:18px;">&nbsp;</div>

              <!-- Description -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-family:${FONT_STACK}; font-size:18px; font-weight:800; color:${colors.textDark};">
                      📝 Description
                    </div>
                    <div style="height:10px; line-height:10px;">&nbsp;</div>
                    ${descriptionHtml}
                  </td>
                </tr>
              </table>

              <div style="height:24px; line-height:24px;">&nbsp;</div>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="${colors.primary}" style="background-color:${colors.primary};">
                    <a href="${prUrl}" target="_blank"
                       style="display:inline-block; font-family:${FONT_STACK}; font-size:15px; font-weight:700; color:#ffffff; text-decoration:none; padding:12px 18px;">
                      View Pull Request →
                    </a>
                  </td>
                </tr>
              </table>

              <div style="height:22px; line-height:22px;">&nbsp;</div>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${colors.border};">
                <tr>
                  <td style="padding-top:16px;">
                    <div style="font-family:${FONT_STACK}; font-size:13px; color:${colors.textMuted}; line-height:1.6;">
                      This notification was sent by <strong style="color:${colors.textDark};">Hushh DevOps Bot</strong>
                    </div>
                    <div style="height:6px; line-height:6px;">&nbsp;</div>
                    <div style="font-family:${FONT_STACK}; font-size:13px; color:${colors.textMuted};">
                      <a href="${repoUrl}" style="color:${colors.primary}; text-decoration:none;">${escapeHtml(
                        repoName
                      )}</a>
                    </div>
                    <div style="height:10px; line-height:10px;">&nbsp;</div>
                    <div style="font-family:${FONT_STACK}; font-size:11px; color:#9ca3af;">
                      © ${new Date().getFullYear()} Hushh.ai • Privacy-First Technology
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
        <!-- /Container -->
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export default generatePRNotificationEmail;
