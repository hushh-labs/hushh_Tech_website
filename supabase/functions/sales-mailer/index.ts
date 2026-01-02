/**
 * Sales Mailer - Supabase Edge Function
 * 
 * Receives bulk email requests from frontend and sends personalized emails
 * to multiple recipients using the Sales Notification template.
 * 
 * Flow:
 * 1. Frontend sends: { from, to[], subject, salesData }
 * 2. Extract recipient name from email
 * 3. Call Cloud Run for HTML template
 * 4. Send via Gmail API
 * 
 * Updated: Jan 2, 2026
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendGmailNotification } from "./gmail.ts";

// CORS headers for preflight requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Google Cloud Run API endpoint for email template
const EMAIL_TEMPLATE_API = "https://email-template-api-53407187172.us-central1.run.app/sales-notification";

/**
 * Extract name from email address
 * ankit@hushh.ai → Ankit
 * john.doe@gmail.com → John Doe
 * manish_sainani@company.com → Manish Sainani
 */
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  
  // Replace dots, underscores, and hyphens with spaces
  const name = localPart
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return name;
}

/**
 * Extract sender name from email
 * manish@hushh.ai → Manish Sainani (mapped)
 */
function getSenderName(email: string): string {
  const senderMap: Record<string, string> = {
    "manish@hushh.ai": "Manish Sainani",
    "ankit@hushh.ai": "Ankit Kumar Singh",
    "neelesh@hushh.ai": "Neelesh Meena",
    "suresh@hushh.ai": "Suresh",
  };
  
  return senderMap[email.toLowerCase()] || extractNameFromEmail(email);
}

/**
 * Validate email address
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse recipients from comma-separated string or array
 */
function parseRecipients(input: string | string[]): string[] {
  if (Array.isArray(input)) {
    return input.map(e => e.trim()).filter(e => isValidEmail(e));
  }
  return input.split(',').map(e => e.trim()).filter(e => isValidEmail(e));
}

/**
 * Fetch email template from Google Cloud Run API
 */
async function fetchEmailTemplate(salesData: Record<string, unknown>): Promise<{ subject: string; html: string; text: string } | null> {
  try {
    console.log(`Fetching sales email template from ${EMAIL_TEMPLATE_API}`);
    
    const response = await fetch(EMAIL_TEMPLATE_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ salesData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch email template: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.html || !data.subject) {
      console.error("Invalid response from email template API:", data);
      return null;
    }

    console.log("Email template fetched successfully");
    return {
      subject: data.subject,
      html: data.html,
      text: data.text || "",
    };
  } catch (error) {
    console.error("Error fetching email template:", error);
    return null;
  }
}

/**
 * Delay helper for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface SendResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    
    const {
      from,
      to,
      salesData = {},
    } = body;

    // Validate required fields
    if (!from) {
      return new Response(JSON.stringify({ error: "Missing 'from' field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!to) {
      return new Response(JSON.stringify({ error: "Missing 'to' field" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse recipients
    const recipients = parseRecipients(to);
    
    if (recipients.length === 0) {
      return new Response(JSON.stringify({ error: "No valid email addresses provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing bulk email from ${from} to ${recipients.length} recipients`);

    // Get sender name
    const senderName = getSenderName(from);
    
    // Results tracking
    const results: SendResult[] = [];
    let successCount = 0;
    let failCount = 0;

    // Process each recipient
    for (const recipientEmail of recipients) {
      try {
        // Extract recipient name from email
        const recipientName = extractNameFromEmail(recipientEmail);
        
        // Prepare sales data with recipient info
        const personalizedSalesData = {
          ...salesData,
          recipientName,
          senderName,
          senderTitle: salesData.senderTitle || "Hushh Fund A",
        };

        // Fetch personalized template
        const emailTemplate = await fetchEmailTemplate(personalizedSalesData);
        
        if (!emailTemplate) {
          results.push({
            email: recipientEmail,
            success: false,
            error: "Failed to generate email template",
          });
          failCount++;
          continue;
        }

        // Send email
        const emailResult = await sendGmailNotification({
          to: recipientEmail,
          subject: emailTemplate.subject,
          htmlContent: emailTemplate.html,
          senderEmail: from,
        });

        if (emailResult.success) {
          results.push({
            email: recipientEmail,
            success: true,
            messageId: emailResult.messageId,
          });
          successCount++;
          console.log(`✓ Email sent to ${recipientEmail}`);
        } else {
          results.push({
            email: recipientEmail,
            success: false,
            error: emailResult.error,
          });
          failCount++;
          console.error(`✗ Failed to send to ${recipientEmail}: ${emailResult.error}`);
        }

        // Rate limiting: wait 200ms between emails to avoid Gmail API limits
        if (recipients.length > 1) {
          await delay(200);
        }

      } catch (error) {
        results.push({
          email: recipientEmail,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        failCount++;
      }
    }

    console.log(`Bulk email complete: ${successCount} sent, ${failCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total: recipients.length,
        sent: successCount,
        failed: failCount,
      },
      results,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
