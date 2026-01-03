// cloud-run/email-template-api/emails/SalesNotification.js

export const escapeHtml = (val = "") =>
  String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const stripHtml = (val = "") =>
  String(val)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const withHighlight = (text, term, before, after) => {
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

export function SalesNotification(input = {}) {
  const d = input || {};

  const subject = escapeHtml(d.subject ?? "Hushh Fund A — ADFW Follow-up");

  const recipientName = escapeHtml(d.recipientName ?? "[Name]");
  const badgeText = escapeHtml(d.badgeText ?? "Hushh Fund A");
  const subtitle = escapeHtml(d.subtitle ?? "ADFW Follow-up");

  // NEW: Using Supabase-hosted Hushh logo
  const logoUrl = escapeHtml(
    d.logoUrl ??
      "https://ibsisfnjxeowvdtvgzff.supabase.co/storage/v1/object/public/assets/hushh-logo.png"
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

  // CONSTANT: Signature always shows "Manish" regardless of who sends
  const senderName = escapeHtml("Manish");
  const senderTitle = escapeHtml(d.senderTitle ?? "Hushh Fund A");

  const previewText = escapeHtml(d.previewText ?? `${subtitle} — ${badgeText}`);
  const confidentialLeft = escapeHtml(d.confidentialLeft ?? "Private & Confidential");
  const confidentialRight = escapeHtml(d.confidentialRight ?? "© Hushh");

  // Updated Palette - White/Light Theme (Gmail-safe inline)
  const C = {
    primary: "#000000",
    highlight: "#AD7D56",
    subtle: "#CDB49E",
    panel: "#FFFFFF",
    bg: "#F9FAFB", // Tailwind bg-gray-50 approx
    text: "#000000",
    textMuted: "#555555",
    borderSoft: "rgba(205, 180, 158, 0.20)",
    borderSoft2: "rgba(205, 180, 158, 0.35)",
    shadow: "0 20px 40px -10px rgba(0, 0, 0, 0.05)"
  };

  const topBarGradient = `linear-gradient(to right, #FFFFFF 0%, rgba(173,125,86,0.40) 50%, #FFFFFF 100%)`;
  const luxuryGradient = `linear-gradient(135deg, #AD7D56 0%, #CDB49E 50%, #AD7D56 100%)`;

  const introHtml = withHighlight(
    introText,
    introHighlight,
    `<span style="color:${C.highlight};font-weight:600;border-bottom:1px solid rgba(173,125,86,0.30);padding-bottom:2px;">`,
    `</span>`
  );

  const visionHtml = withHighlight(
    visionQuote,
    visionEmphasis,
    `<span style="color:${C.highlight};font-weight:600;border-bottom:1px solid rgba(173,125,86,0.30);padding-bottom:0px;">`,
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
  <body style="margin:0;padding:0;background-color:${C.bg};">
    <!-- Preheader -->
    <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
      ${previewText}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.bg};">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:640px;max-width:640px;background-color:${C.panel};box-shadow:${C.shadow};border:1px solid ${C.borderSoft};">
            <!-- top gradient bar -->
            <tr>
              <td style="height:4px;line-height:4px;background-color:#FFFFFF;background-image:${topBarGradient};opacity:0.50;">
                &nbsp;
              </td>
            </tr>

            <!-- Header -->
            <tr>
              <td align="center" style="padding:48px 24px 40px 24px;">
                <img src="${logoUrl}" width="80" height="80" alt="Hushh Logo" style="display:block;border:0;outline:none;text-decoration:none;width:80px;height:80px;opacity:1;" />

                <div style="height:22px;line-height:22px;">&nbsp;</div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(173,125,86,0.40);background-color:rgba(205,180,158,0.10);border-radius:999px;">
                  <tr>
                    <td style="padding:8px 18px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.primary};font-weight:600;white-space:nowrap;">
                      ${badgeText}
                    </td>
                  </tr>
                </table>

                <div style="height:12px;line-height:12px;">&nbsp;</div>

                <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:3px;text-transform:uppercase;color:${C.textMuted};font-weight:600;">
                  ${subtitle}
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:0 32px 0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="font-family:Georgia,'Times New Roman',Times,serif;font-size:30px;line-height:36px;color:${C.text};font-weight:400;padding:0 0 18px 0;">
                      Dear ${recipientName},
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:33px;color:rgba(0,0,0,0.90);font-weight:300;letter-spacing:0.3px;">
                      ${introHtml}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Vision block -->
            <tr>
              <td style="padding:34px 32px 0 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="height:1px;line-height:1px;background-color:rgba(205,180,158,0.50);">&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:28px 8px;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:5px;text-transform:uppercase;color:${C.highlight};font-weight:600;">
                        ${visionLabel}
                      </div>

                      <div style="height:12px;line-height:12px;">&nbsp;</div>

                      <div style="font-family:Georgia,'Times New Roman',Times,serif;font-size:22px;line-height:32px;color:${C.text};font-style:italic;text-align:center;">
                        "${visionHtml}"
                      </div>

                      <div style="height:14px;line-height:14px;">&nbsp;</div>

                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;letter-spacing:4px;text-transform:uppercase;color:${C.textMuted};font-weight:600;opacity:0.80;">
                        ${visionFooter}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:1px;line-height:1px;background-color:rgba(205,180,158,0.50);">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Ask + CTA -->
            <tr>
              <td align="center" style="padding:30px 32px 0 32px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:33px;color:rgba(0,0,0,0.90);font-weight:300;letter-spacing:0.3px;text-align:center;max-width:520px;">
                  ${askLine}
                </div>

                <div style="height:20px;line-height:20px;">&nbsp;</div>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.primary};border-radius:2px;box-shadow:0 10px 20px rgba(0,0,0,0.15);">
                  <tr>
                    <td align="center" style="padding:14px 26px;">
                      <a href="${ctaUrl}" target="_blank" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;font-weight:600;color:#FFFFFF;text-decoration:none;">
                        ${ctaText}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Signature -->
            <tr>
              <td align="center" style="padding:48px 32px 28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                  <tr>
                    <td align="center" style="padding-bottom:16px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="1">
                        <tr>
                          <td style="width:1px;height:40px;line-height:40px;background-color:${C.subtle};">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-family:Georgia,'Times New Roman',Times,serif;font-size:18px;line-height:22px;color:${C.text};font-weight:400;">
                      ${senderName}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:${C.highlight};font-weight:600;">
                      ${senderTitle}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:rgba(205,180,158,0.10);">
                  <tr>
                    <td style="height:1px;line-height:1px;background-color:${C.borderSoft};">&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:18px 18px 22px 18px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(85,85,85,0.80);font-weight:600;padding-right:18px;white-space:nowrap;">
                            ${confidentialLeft}
                          </td>
                          <td style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:rgba(85,85,85,0.80);font-weight:600;white-space:nowrap;">
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
};
