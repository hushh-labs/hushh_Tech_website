// cloud-run/email-template-api/emails/SalesNotification.js
// Gmail-Safe Email Template - Hushh Technologies
// Converted from Tailwind HTML to table-based layout

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

export function SalesNotification(input = {}) {
  const d = input || {};

  const subject = escapeHtml(d.subject ?? "Hushh Technologies — Investment Opportunity");
  const recipientName = escapeHtml(d.recipientName ?? "");
  
  // Supabase-hosted Hushh logo
  const logoUrl = escapeHtml(
    d.logoUrl ?? "https://ibsisfnjxeowvdtvgzff.supabase.co/storage/v1/object/public/assets/hushh-logo.png"
  );

  // Content sections - customizable
  const whoWeAreText = escapeHtml(
    d.whoWeAreText ?? 
    "Hushh Technologies is an investment management firm dedicated to redefining the financial landscape through innovation and integrity. We bridge the gap between complex market data and actionable investment strategies."
  );

  const inspirationItems = d.inspirationItems ?? [
    "Driven by a passion for financial excellence.",
    "Inspired by global market dynamics.",
    "Commitment to sustainable growth."
  ];

  const coreValues = d.coreValues ?? [
    { title: "Integrity First", desc: "Upholding the highest standards in every decision." },
    { title: "Radical Innovation", desc: "Embracing new technologies to stay ahead." },
    { title: "Client Focus", desc: "Your financial goals are our primary mission." }
  ];

  const approachIntro = escapeHtml(
    d.approachIntro ?? "We employ a rigorous, data-centric methodology to navigate volatility."
  );

  const approachItems = d.approachItems ?? [
    "Algorithmic analysis of market trends.",
    "Risk mitigation through diversified assets.",
    "Transparent reporting and continuous monitoring."
  ];

  const whyItems = d.whyItems ?? [
    "Proprietary AI-driven investment models.",
    "A team of seasoned financial experts.",
    "Adaptive strategies for any market condition."
  ];

  const quoteText = escapeHtml(
    d.quoteText ?? "Welcome to the future of investment management, where tradition meets innovation."
  );

  const ctaText = escapeHtml(d.ctaText ?? "Connect");
  const ctaUrl = escapeHtml(d.ctaUrl ?? "https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives");

  // Always Manish Sainani signature
  const senderName = "Manish Sainani";
  const senderTitle = "Co-Founder, CEO & CIO";
  const companyName = "Hushh Technologies LLC";

  // Color palette matching Tailwind design
  const C = {
    primary: "#0088cc",
    offBlack: "#000000",
    bodyText: "#666666",
    mutedText: "#979797",
    sectionGray: "#eeeeee",
    bg: "#F9FAFB",
    white: "#FFFFFF",
    lightBlue: "#f0f9ff",
    borderLight: "#f0f0f0"
  };

  // Build inspiration list HTML
  const inspirationHtml = inspirationItems.map(item => `
    <tr>
      <td style="padding:10px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top" style="width:32px;padding-right:12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.white};border-radius:50%;width:28px;height:28px;">
                <tr>
                  <td align="center" valign="middle" style="width:28px;height:28px;font-size:14px;color:${C.primary};">✓</td>
                </tr>
              </table>
            </td>
            <td valign="middle" style="font-family:'Manrope',Arial,sans-serif;font-size:15px;line-height:24px;color:${C.bodyText};font-weight:500;">
              ${escapeHtml(item)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  // Build core values HTML
  const coreValuesHtml = coreValues.map((val, idx) => `
    <tr>
      <td style="padding:${idx === 0 ? '0' : '20px'} 0 ${idx === coreValues.length - 1 ? '0' : '20px'} 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top" style="width:64px;padding-right:20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.white};border-radius:16px;width:48px;height:48px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td align="center" valign="middle" style="width:48px;height:48px;font-family:'Manrope',Arial,sans-serif;font-size:18px;color:${C.primary};font-weight:700;">
                    ${idx + 1}
                  </td>
                </tr>
              </table>
            </td>
            <td valign="middle">
              <div style="font-family:'Manrope',Arial,sans-serif;font-size:17px;font-weight:700;color:${C.offBlack};margin-bottom:4px;">
                ${escapeHtml(val.title)}
              </div>
              <div style="font-family:'Manrope',Arial,sans-serif;font-size:15px;line-height:24px;color:${C.bodyText};">
                ${escapeHtml(val.desc)}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  // Build approach items HTML
  const approachHtml = approachItems.map(item => `
    <tr>
      <td style="padding:8px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top" style="width:24px;padding-right:12px;padding-top:6px;">
              <div style="width:10px;height:10px;border-radius:50%;background-color:${C.primary};"></div>
            </td>
            <td valign="middle" style="font-family:'Manrope',Arial,sans-serif;font-size:15px;line-height:24px;color:${C.bodyText};">
              ${escapeHtml(item)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  // Build why items HTML
  const whyHtml = whyItems.map(item => `
    <tr>
      <td style="padding:10px 12px;border-radius:16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top" style="width:28px;padding-right:12px;">
              <span style="font-size:18px;color:${C.primary};">✓</span>
            </td>
            <td valign="middle" style="font-family:'Manrope',Arial,sans-serif;font-size:15px;line-height:24px;color:${C.bodyText};font-weight:500;">
              ${escapeHtml(item)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

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
      Hushh Technologies — Investment Management Excellence
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.bg};">
      <tr>
        <td align="center" style="padding:20px 10px 40px 10px;">
          <!-- Main Container - Mobile-like card -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="420" style="width:420px;max-width:420px;background-color:${C.white};border-radius:40px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.15);overflow:hidden;">
            
            <!-- Header Bar -->
            <tr>
              <td style="padding:16px 24px;border-bottom:1px solid ${C.borderLight};background-color:${C.white};">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td width="48" valign="middle">
                      <span style="font-size:24px;color:${C.offBlack};">←</span>
                    </td>
                    <td align="center" valign="middle" style="font-family:'Manrope',Arial,sans-serif;font-size:17px;font-weight:700;color:${C.offBlack};letter-spacing:-0.5px;">
                      Hushh Technologies
                    </td>
                    <td width="48">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Logo Section - Teal Background -->
            <tr>
              <td align="center" style="padding:32px 24px;background-color:${C.primary};">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:rgba(255,255,255,0.15);border-radius:24px;padding:8px;">
                  <tr>
                    <td align="center" style="padding:16px 24px;">
                      <img src="${logoUrl}" width="64" height="64" alt="Hushh Logo" style="display:block;border:0;outline:none;text-decoration:none;width:64px;height:64px;border-radius:16px;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Who We Are Section -->
            <tr>
              <td style="padding:40px 24px 32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:24px;font-weight:700;color:${C.offBlack};margin-bottom:16px;letter-spacing:-0.5px;">
                        Who we are
                      </div>
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:15px;line-height:26px;color:${C.bodyText};font-weight:500;text-align:justify;">
                        ${whoWeAreText}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Our Inspiration Section - Gray Card -->
            <tr>
              <td style="padding:0 24px 32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.sectionGray};border-radius:24px;padding:28px;">
                  <tr>
                    <td style="padding:24px;">
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:24px;font-weight:700;color:${C.offBlack};margin-bottom:20px;letter-spacing:-0.5px;">
                        Our Inspiration
                      </div>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        ${inspirationHtml}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Core Values Section -->
            <tr>
              <td style="padding:0 24px 32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:24px;font-weight:700;color:${C.offBlack};margin-bottom:28px;letter-spacing:-0.5px;">
                        Core Values
                      </div>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        ${coreValuesHtml}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Our Approach Section -->
            <tr>
              <td style="padding:0 24px 32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:24px;font-weight:700;color:${C.offBlack};margin-bottom:16px;letter-spacing:-0.5px;">
                        Our Approach
                      </div>
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:15px;line-height:24px;color:${C.bodyText};margin-bottom:20px;">
                        ${approachIntro}
                      </div>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        ${approachHtml}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Why Hushh Technologies Section - Light Blue Card -->
            <tr>
              <td style="padding:0 24px 32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${C.lightBlue};border-radius:24px;border:1px solid rgba(0,136,204,0.1);">
                  <tr>
                    <td style="padding:28px;">
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:24px;font-weight:700;color:${C.offBlack};margin-bottom:24px;letter-spacing:-0.5px;">
                        Why Hushh Technologies?
                      </div>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        ${whyHtml}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Quote Section -->
            <tr>
              <td style="padding:24px 32px 40px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td align="center">
                      <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:32px;color:${C.primary};font-style:italic;text-align:center;font-weight:700;">
                        "${quoteText}"
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding:0 24px 48px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.primary};border-radius:9999px;box-shadow:0 10px 30px rgba(0,136,204,0.3);">
                  <tr>
                    <td align="center" style="padding:16px 48px;">
                      <a href="${ctaUrl}" target="_blank" style="display:inline-block;font-family:'Manrope',Arial,sans-serif;font-size:16px;font-weight:700;color:${C.white};text-decoration:none;">
                        ${ctaText} →
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer / Signature -->
            <tr>
              <td style="padding:40px 24px 48px 24px;border-top:1px solid ${C.sectionGray};background-color:${C.white};">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:15px;color:${C.mutedText};font-weight:500;margin-bottom:20px;">
                        Warm regards,
                      </div>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td valign="middle" style="width:56px;padding-right:16px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:56px;height:56px;background-color:#f8f8f8;border-radius:50%;border:1px solid ${C.white};box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                              <tr>
                                <td align="center" valign="middle" style="font-family:'Manrope',Arial,sans-serif;font-size:16px;font-weight:700;color:${C.mutedText};">
                                  MS
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td valign="middle">
                            <div style="font-family:'Manrope',Arial,sans-serif;font-size:17px;font-weight:700;color:${C.offBlack};margin-bottom:4px;">
                              ${escapeHtml(senderName)}
                            </div>
                            <div style="font-family:'Manrope',Arial,sans-serif;font-size:10px;font-weight:700;color:${C.primary};text-transform:uppercase;letter-spacing:1.5px;">
                              ${escapeHtml(senderTitle)}
                            </div>
                          </td>
                        </tr>
                      </table>
                      <div style="font-family:'Manrope',Arial,sans-serif;font-size:13px;color:${C.mutedText};margin-top:12px;padding-left:72px;">
                        ${escapeHtml(companyName)}
                      </div>
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

  // Plain text version
  const text = [
    "HUSHH TECHNOLOGIES",
    "==================",
    "",
    "WHO WE ARE",
    "-----------",
    stripHtml(whoWeAreText),
    "",
    "OUR INSPIRATION",
    "---------------",
    ...inspirationItems.map(item => `• ${stripHtml(item)}`),
    "",
    "CORE VALUES",
    "-----------",
    ...coreValues.map((val, idx) => `${idx + 1}. ${val.title}: ${val.desc}`),
    "",
    "OUR APPROACH",
    "------------",
    stripHtml(approachIntro),
    ...approachItems.map(item => `• ${stripHtml(item)}`),
    "",
    "WHY HUSHH TECHNOLOGIES?",
    "-----------------------",
    ...whyItems.map(item => `✓ ${stripHtml(item)}`),
    "",
    `"${stripHtml(quoteText)}"`,
    "",
    `${ctaText}: ${ctaUrl}`,
    "",
    "---",
    "Warm regards,",
    senderName,
    senderTitle,
    companyName
  ].join("\n");

  return { subject, html, text };
}
