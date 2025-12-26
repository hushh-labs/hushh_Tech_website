/**
 * Gmail API Client with Service Account Authentication
 * 
 * Uses Google Service Account with Domain-Wide Delegation to send emails
 * as ankit@hushh.ai to dev-ops@hushh.ai
 */

// Base64URL encoding utilities
function base64urlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Create a signed JWT for Google Service Account authentication
 */
async function createSignedJWT(
  serviceAccountEmail: string,
  privateKey: string,
  userToImpersonate: string,
  scopes: string[]
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 3600; // 1 hour expiry

  // JWT Header
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  // JWT Payload (Claims)
  const payload = {
    iss: serviceAccountEmail,
    sub: userToImpersonate, // User to impersonate (Domain-Wide Delegation)
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: exp,
    scope: scopes.join(" "),
  };

  // Encode header and payload
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(payload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  // Parse private key and sign
  const privateKeyPem = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const privateKeyBuffer = Uint8Array.from(atob(privateKeyPem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = base64urlEncode(new Uint8Array(signature));

  return `${signatureInput}.${encodedSignature}`;
}

/**
 * Get an access token using the Service Account JWT
 */
async function getAccessToken(
  serviceAccountEmail: string,
  privateKey: string,
  userToImpersonate: string
): Promise<string> {
  const scopes = ["https://www.googleapis.com/auth/gmail.send"];

  const signedJwt = await createSignedJWT(
    serviceAccountEmail,
    privateKey,
    userToImpersonate,
    scopes
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to get access token:", error);
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Encode subject with RFC 2047 for proper UTF-8/ASCII handling
 */
function encodeSubject(subject: string): string {
  // Check if subject contains only ASCII characters
  const isAscii = /^[\x00-\x7F]*$/.test(subject);
  if (isAscii) {
    return subject;
  }
  // Encode non-ASCII subjects using RFC 2047 Base64 encoding
  const encoded = btoa(unescape(encodeURIComponent(subject)));
  return `=?UTF-8?B?${encoded}?=`;
}

/**
 * Create RFC 2822 formatted email message with multiple recipients support
 */
function createEmailMessage(
  from: string,
  recipients: string[],
  subject: string,
  htmlContent: string
): string {
  const boundary = `boundary_${Date.now()}`;
  const encodedSubject = encodeSubject(subject);
  
  // Join all recipients with comma for the To header
  const toHeader = recipients.join(", ");
  
  const emailLines = [
    `From: Hushh DevOps <${from}>`,
    `To: ${toHeader}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    `This email requires HTML support. Please view in an HTML-capable email client.`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    htmlContent,
    ``,
    `--${boundary}--`,
  ];

  return emailLines.join("\r\n");
}

/**
 * Send email using Gmail API
 */
interface EmailParams {
  to: string | string[];  // Single recipient or array of recipients
  subject: string;
  htmlContent: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendGmailNotification(params: EmailParams): Promise<EmailResult> {
  try {
    // Get environment variables
    const serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
    const privateKey = Deno.env.get("GOOGLE_PRIVATE_KEY");
    const senderEmail = Deno.env.get("GMAIL_SENDER_EMAIL") || "ankit@hushh.ai";

    if (!serviceAccountEmail || !privateKey) {
      console.error("Missing Google Service Account credentials");
      return {
        success: false,
        error: "Missing Google Service Account credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY.",
      };
    }

    // Handle newlines in private key (they may be escaped in env vars)
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

    // Normalize recipients to array
    const recipients = Array.isArray(params.to) ? params.to : [params.to];
    
    console.log(`Sending email from ${senderEmail} to ${recipients.join(", ")}`);

    // Get access token
    const accessToken = await getAccessToken(
      serviceAccountEmail,
      formattedPrivateKey,
      senderEmail
    );

    // Create email message with multiple recipients
    const rawMessage = createEmailMessage(
      senderEmail,
      recipients,
      params.subject,
      params.htmlContent
    );

    // Base64URL encode the message
    const encodedMessage = base64urlEncode(rawMessage);

    // Send via Gmail API
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gmail API error:", error);
      return {
        success: false,
        error: `Gmail API error: ${error}`,
      };
    }

    const result = await response.json();
    console.log(`Email sent successfully to ${recipients.length} recipients, message ID:`, result.id);

    return {
      success: true,
      messageId: result.id,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
