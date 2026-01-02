/**
 * SalesNotification Email Template
 * Ultra-Luxury Design with EXACT Tailwind color codes
 * Gmail-safe inline styles (table-based layout)
 * 
 * Color Palette (from Tailwind config):
 * - offblack: #020202
 * - panel: #080808
 * - gold: #D4AF37
 * - gold-light: #FBE9B6
 * - gold-lighter: #FFFDF5
 * - gold-dim: #8A7338
 * - ivory: #F9F9F7
 * - gray-100: #F3F4F6
 * - gray-400: #9CA3AF
 * - gray-500: #6B7280
 * - platinum: #E5E4E2
 */

const escapeHtml = (val = "") =>
  String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (val = "") =>
  String(val)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const withHighlight = (text, term, before, after) => {
  const t = String(text ?? "");
  const k = String(term ?? "");
  if (!t || !k) return escapeHtml(t);
  const idx = t.indexOf(k);
  if (idx === -1) return escapeHtml(t);
  const a = escapeHtml(t.slice(0, idx));
  const b = escapeHtml(k);
  const c = escapeHtml(t.slice(idx + k.length));
  return `${a}${before}${b}${after}${c}`;
};

// ES Module export
export function SalesNotification(input = {}) {
  const d = input || {};

  const subject = escapeHtml(d.subject ?? "Hushh Fund A — ADFW Follow-up");

  // Top part - DYNAMIC (recipient name changes per email)
  const recipientName = escapeHtml(d.recipientName ?? "[Name]");
  const badgeText = escapeHtml(d.badgeText ?? "Hushh Fund A");
  const subtitle = escapeHtml(d.subtitle ?? "ADFW Follow-up");

  // Hushh S Logo (Twitter CDN - stable circular logo)
  const logoUrl = escapeHtml(
    d.logoUrl ??
      "https://pbs.twimg.com/profile_images/1884882673063657472/sNXVK9E7_400x400.jpg"
  );

  const introText =
    d.introText ??
    "We met briefly in Abu Dhabi during ADFW in December. I've been reflecting on our exchange around long-duration capital and how sovereign institutions are thinking about durability in the current productivity cycle.";
  const introHighlight = d.introHighlight ?? "long-duration capital";

  const visionLabel = escapeHtml(d.visionLabel ?? "The Vision");
  const visionQuote =
    d.visionQuote ??
    "We are deliberately building Fund A as a concentrated, long-horizon vehicle focused on absolute free cash flow.";
  const visionEmphasis = d.visionEmphasis ?? "Fund A";
  const visionFooter = escapeHtml(d.visionFooter ?? "Preservation • Compounding • Velocity");

  const askLine = escapeHtml(
    d.askLine ??
      "If it would be useful, I would appreciate the opportunity to have a quiet conversation to exchange perspectives sometime in the coming weeks."
  );

  const ctaText = escapeHtml(d.ctaText ?? "Connect");
  const ctaUrl = escapeHtml(d.ctaUrl ?? "https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives");

  // Bottom part - STATIC (always Manish)
  const senderName = escapeHtml(d.senderName ?? "Manish");
  const senderTitle = escapeHtml(d.senderTitle ?? "Hushh Fund A");

  const previewText = escapeHtml(d.previewText ?? `${subtitle} — ${badgeText}`);
  const confidentialLeft = escapeHtml(d.confidentialLeft ?? "Private & Confidential");
  const confidentialRight = escapeHtml(d.confidentialRight ?? "© Hushh");

  // ═══════════════════════════════════════════════════════════════════════════
  // EXACT Tailwind Color Palette (from user's template)
  // ═══════════════════════════════════════════════════════════════════════════
  const C = {
    offblack: "#020202",      // Deepest black for ultra-luxury contrast
    panel: "#080808",         // Slightly lighter panel background
    gold: "#D4AF37",          // Primary gold
    goldLight: "#FBE9B6",     // Very light gold/champagne for better visibility
    goldLighter: "#FFFDF5",   // Almost white gold
    goldDim: "#8A7338",       // Dim gold for accents
    goldAccent: "#FFD700",    // Bright gold accent
    ivory: "#F9F9F7",         // Warm off-white for main text visibility
    gray100: "#F3F4F6",       // Light gray for body text
    gray400: "#9CA3AF",       // Medium gray (subtle)
    gray500: "#6B7280",       // Darker gray for footer
    platinum: "#E5E4E2",      // Platinum for subtle text
    border: "rgba(255,255,255,0.05)",  // Subtle white border
    borderGold: "rgba(212,175,55,0.40)", // Gold border for corners
    divider: "rgba(138,115,56,0.60)"    // Gold divider line
  };

  // Gold sheen gradient (from Tailwind config)
  const goldSheen =
    "linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)";

  const introHtml = withHighlight(
    introText,
    introHighlight,
    `<span style="color:${C.goldLight};font-weight:500;border-bottom:1px solid rgba(212,175,55,0.30);padding-bottom:2px;">`,
    `</span>`
  );

  const visionHtml = withHighlight(
    visionQuote,
    visionEmphasis,
    `<span style="color:${C.goldLight};font-style:normal;border-bottom:1px solid rgba(212,175,55,0.50);padding-bottom:2px;">`,
    `</span>`
  );

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${C.offblack};">
    <!-- Preheader -->
    <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
      ${previewText}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.offblack};">
      <tr>
        <td align="center" style="padding:32px 16px 64px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="620" style="width:620px;max-width:620px;background-color:${C.panel};border:1px solid ${C.border};">
            
            <!-- Top Gold Bar (3px height) -->
            <tr>
              <td style="height:3px;line-height:3px;background-color:${C.gold};background-image:${goldSheen};">
                &nbsp;
              </td>
            </tr>

            <!-- Header spotlight area -->
            <tr>
              <td style="padding:40px 28px 0 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border:1px solid ${C.border};">
                  
                  <!-- Corner markers row (top) -->
                  <tr>
                    <td style="padding:0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td width="16" style="padding:12px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="8" height="8" style="width:8px;height:8px;border-top:1px solid ${C.borderGold};border-left:1px solid ${C.borderGold};">
                              <tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
                            </table>
                          </td>
                          <td style="padding:0;">&nbsp;</td>
                          <td width="16" align="right" style="padding:12px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="8" height="8" style="width:8px;height:8px;border-top:1px solid ${C.borderGold};border-right:1px solid ${C.borderGold};">
                              <tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Logo + badge -->
                  <tr>
                    <td align="center" style="padding:32px 20px 24px 20px;">
                      <img src="${logoUrl}" width="80" height="80" alt="Hushh Logo" style="display:block;border:0;outline:none;text-decoration:none;width:80px;height:80px;border-radius:50%;" />
                      <div style="height:24px;line-height:24px;">&nbsp;</div>

                      <!-- Badge (gradient border look, Gmail-safe) -->
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(138,115,56,0.50);background-color:${C.offblack};">
                        <tr>
                          <td style="padding:10px 24px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${C.goldLight};font-weight:600;white-space:nowrap;">
                            ${badgeText}
                          </td>
                        </tr>
                      </table>

                      <div style="height:18px;line-height:18px;">&nbsp;</div>
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:${C.gray400};font-weight:500;opacity:0.85;">
                        ${subtitle}
                      </div>
                    </td>
                  </tr>

                  <!-- Corner markers row (bottom) -->
                  <tr>
                    <td style="padding:0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td width="16" style="padding:12px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="8" height="8" style="width:8px;height:8px;border-bottom:1px solid ${C.borderGold};border-left:1px solid ${C.borderGold};">
                              <tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
                            </table>
                          </td>
                          <td style="padding:0;">&nbsp;</td>
                          <td width="16" align="right" style="padding:12px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="8" height="8" style="width:8px;height:8px;border-bottom:1px solid ${C.borderGold};border-right:1px solid ${C.borderGold};">
                              <tr><td style="font-size:0;line-height:0;">&nbsp;</td></tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px 32px 0 32px;">
                <div style="font-family:Georgia,'Times New Roman',Times,serif;font-size:28px;line-height:34px;color:${C.ivory};font-weight:500;letter-spacing:0.02em;margin:0 0 24px 0;">
                  Dear ${recipientName},
                </div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:2.1;color:${C.gray100};letter-spacing:0.02em;text-align:left;">
                  ${introHtml}
                </div>
              </td>
            </tr>

            <!-- Vision block -->
            <tr>
              <td style="padding:40px 32px 0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="height:1px;line-height:1px;background:linear-gradient(to right, transparent, ${C.divider}, transparent);">
                      &nbsp;
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:36px 10px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.4em;text-transform:uppercase;color:${C.goldDim};font-weight:600;">
                        ${visionLabel}
                      </div>

                      <div style="height:18px;line-height:18px;">&nbsp;</div>

                      <div style="font-family:Georgia,'Times New Roman',Times,serif;font-size:26px;line-height:1.55;color:${C.goldLighter};font-style:italic;text-align:center;opacity:0.95;">
                        "${visionHtml}"
                      </div>

                      <div style="height:22px;line-height:22px;">&nbsp;</div>

                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                        <tr>
                          <td style="width:24px;height:1px;line-height:1px;background-color:rgba(138,115,56,0.40);">&nbsp;</td>
                          <td style="padding:0 14px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:${C.platinum};font-weight:500;opacity:0.85;white-space:nowrap;">
                            ${visionFooter}
                          </td>
                          <td style="width:24px;height:1px;line-height:1px;background-color:rgba(138,115,56,0.40);">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:1px;line-height:1px;background:linear-gradient(to right, transparent, ${C.divider}, transparent);">
                      &nbsp;
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Ask + CTA -->
            <tr>
              <td align="center" style="padding:40px 32px 0 32px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:2.1;color:${C.gray100};letter-spacing:0.02em;text-align:center;max-width:520px;">
                  ${askLine}
                </div>

                <div style="height:28px;line-height:28px;">&nbsp;</div>

                <!-- CTA button -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.gold};background-image:${goldSheen};box-shadow:0 5px 20px -5px rgba(212,175,55,0.30);">
                  <tr>
                    <td align="center" style="padding:16px 32px;">
                      <a href="${ctaUrl}" target="_blank" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;font-weight:700;color:${C.offblack};text-decoration:none;">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Signature (STATIC - Always Manish) -->
            <tr>
              <td align="center" style="padding:48px 32px 32px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                  <tr>
                    <td align="center" style="padding-bottom:20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="1">
                        <tr>
                          <td style="width:1px;height:56px;line-height:56px;background:linear-gradient(to bottom, transparent, ${C.divider}, transparent);">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-family:Georgia,'Times New Roman',Times,serif;font-size:22px;line-height:28px;color:${C.ivory};font-weight:400;">
                      ${senderName}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${C.goldDim};font-weight:500;">
                      ${senderTitle}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 0 0 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:rgba(0,0,0,0.20);">
                  <tr>
                    <td style="height:1px;line-height:1px;background-color:${C.border};">&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:20px 20px 24px 20px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:${C.gray500};font-weight:500;padding-right:20px;white-space:nowrap;">
                            ${confidentialLeft}
                          </td>
                          <td style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:${C.gray500};font-weight:500;white-space:nowrap;">
                            ${confidentialRight}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Dear ${stripHtml(recipientName)},`,
    "",
    stripHtml(introText),
    "",
    `${stripHtml(visionLabel)}: ${stripHtml(visionQuote)}`,
    stripHtml(visionFooter),
    "",
    stripHtml(askLine),
    "",
    `${stripHtml(ctaText)}: ${stripHtml(ctaUrl)}`,
    "",
    stripHtml(senderName),
    stripHtml(senderTitle),
    "",
    `${stripHtml(confidentialLeft)} • ${stripHtml(confidentialRight)}`
  ].join("\n");

  return { subject, html, text };
}
