/**
 * Sales Notification Email Template - Hushh Fund A
 * Gmail-safe (tables + inline styles)
 * 
 * Used for bulk sales/investor outreach emails
 */

const escapeHtml = (val = "") =>
  String(val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const stripHtml = (val = "") => String(val).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export function generateSalesNotificationEmail(input = {}) {
  const data = input || {};

  const recipientName = escapeHtml(data.recipientName ?? "[Name]");
  const badgeText = escapeHtml(data.badgeText ?? "Hushh Fund A");
  const subtitle = escapeHtml(data.subtitle ?? "ADFW Follow-up");

  const introPrefix = escapeHtml(
    data.introPrefix ??
      "We met briefly in Abu Dhabi during ADFW in December. I've been reflecting on our exchange around"
  );
  const introHighlight = escapeHtml(data.introHighlight ?? "long-duration capital");
  const introSuffix = escapeHtml(
    data.introSuffix ?? "and how sovereign institutions are thinking about durability in the current productivity cycle."
  );

  const visionLabel = escapeHtml(data.visionLabel ?? "The Vision");
  const visionQuote = escapeHtml(
    data.visionQuote ??
      "We are deliberately building Fund A as a concentrated, long-horizon vehicle focused on absolute free cash flow."
  );
  const visionEmphasis = escapeHtml(data.visionEmphasis ?? "Fund A");
  const visionFooter = escapeHtml(data.visionFooter ?? "Preservation • Compounding • Velocity");

  const askLine = escapeHtml(
    data.askLine ??
      "If it would be useful, I would appreciate the opportunity to have a quiet conversation to exchange perspectives sometime in the coming weeks."
  );

  const ctaText = escapeHtml(data.ctaText ?? "Connect");
  const ctaUrl = escapeHtml(data.ctaUrl ?? "https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives");

  const senderName = escapeHtml(data.senderName ?? "Manish");
  const senderTitle = escapeHtml(data.senderTitle ?? "Hushh Fund A");

  const logoUrl = escapeHtml(
    data.logoUrl ??
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAP1TlRJ7GeKOEsEDH3CuMKQAZovvoz7G9nybKPvX9XuNNGwVyY5rwoa10Icqoqn2NqgluIO9BGGvEuyfA-4WlovbmHaLvybfwX7XqARJtJHdLierPXfhUiW2Zzzb9XifxhsDkqrDpIGBIHrhqbl6UGpMgzTmhPcdA-cBVc_2zd_oyR-77zPbSeFssAge5m0oisQq8CzZ4GsRhZCldIB5mmqKysTqEEyePgWpza1IoWzup8vd95Ho1U7w1v3Ct1YmDDmButPikIcA9p"
  );

  const previewText = escapeHtml(data.previewText ?? `${subtitle} — ${badgeText}`);
  const confidentialLeft = escapeHtml(data.confidentialLeft ?? "Private & Confidential");
  const confidentialRight = escapeHtml(data.confidentialRight ?? "© Hushh");

  const subject = escapeHtml(data.subject ?? `${badgeText} — ${subtitle}`);

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#050505;">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;mso-hide:all;">
      ${previewText}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#050505;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:640px;max-width:640px;background-color:#0f0f0f;border:1px solid #141414;">
            <tr>
              <td style="height:4px;line-height:4px;background-color:#C4A661;">&nbsp;</td>
            </tr>

            <tr>
              <td align="center" style="padding:44px 24px 28px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <img src="${logoUrl}" width="80" height="80" alt="Hushh Logo" style="display:block;border:0;outline:none;text-decoration:none;width:80px;height:80px;opacity:1;" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:18px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border:1px solid rgba(229,193,93,0.55);background-color:#050505;">
                        <tr>
                          <td style="padding:10px 18px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#FFF8E1;font-weight:700;white-space:nowrap;">
                            ${badgeText}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#A3A3A3;">
                      ${subtitle}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 24px 0 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding:0 0 18px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:28px;line-height:34px;color:#FFFFFF;">
                      Dear ${recipientName},
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:34px;color:#EDEDED;letter-spacing:0.2px;">
                      ${introPrefix}
                      <span style="color:#FFF8E1;font-weight:700;border-bottom:1px solid rgba(196,166,97,0.55);padding-bottom:2px;">
                        ${introHighlight}
                      </span>
                      ${introSuffix}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:34px 24px 0 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="height:1px;line-height:1px;background-color:#1f1a10;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:34px 14px 34px 14px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:5px;text-transform:uppercase;color:#E5C15D;font-weight:700;padding-bottom:10px;">
                            ${visionLabel}
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="font-family:Georgia,'Times New Roman',Times,serif;font-size:22px;line-height:32px;color:#FFFFFF;font-style:italic;">
                            "We are deliberately building
                            <span style="color:#FFF8E1;font-weight:700;font-style:normal;border-bottom:1px solid rgba(196,166,97,0.55);padding-bottom:2px;">
                              ${visionEmphasis}
                            </span>
                            as a concentrated, long-horizon vehicle focused on absolute free cash flow."
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;letter-spacing:3px;text-transform:uppercase;color:#A3A3A3;font-weight:700;">
                            ${visionFooter}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="height:1px;line-height:1px;background-color:#1f1a10;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:34px 24px 0 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center" style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:34px;color:#EDEDED;letter-spacing:0.2px;max-width:520px;">
                      ${askLine}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:26px 0 0 0;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:#E5C15D;">
                        <tr>
                          <td align="center" style="padding:14px 22px;">
                            <a href="${ctaUrl}" target="_blank" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:800;color:#050505;text-decoration:none;">
                              ${ctaText}
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:42px 24px 24px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" style="padding-bottom:14px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="1">
                        <tr><td style="width:1px;height:40px;line-height:40px;background-color:#2a2a2a;">&nbsp;</td></tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-family:Georgia,'Times New Roman',Times,serif;font-size:22px;line-height:26px;color:#FFFFFF;font-weight:600;">
                      ${senderName}
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#E5C15D;font-weight:800;">
                      ${senderTitle}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 0 0 0;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#000000;">
                  <tr>
                    <td style="height:1px;line-height:1px;background-color:#141414;">&nbsp;</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:18px 24px 22px 24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#A3A3A3;font-weight:700;padding-right:18px;white-space:nowrap;">
                            ${confidentialLeft}
                          </td>
                          <td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#A3A3A3;font-weight:700;white-space:nowrap;">
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
    `${stripHtml(introPrefix)} ${stripHtml(introHighlight)} ${stripHtml(introSuffix)}`,
    "",
    `${stripHtml(visionLabel)}: ${stripHtml(visionQuote)}`,
    `${stripHtml(visionFooter)}`,
    "",
    stripHtml(askLine),
    "",
    `${stripHtml(ctaText)}: ${stripHtml(ctaUrl)}`,
    "",
    `${stripHtml(senderName)}`,
    `${stripHtml(senderTitle)}`,
    "",
    `${stripHtml(confidentialLeft)} • ${stripHtml(confidentialRight)}`
  ].join("\n");

  return { subject, html, text };
}

export default generateSalesNotificationEmail;
