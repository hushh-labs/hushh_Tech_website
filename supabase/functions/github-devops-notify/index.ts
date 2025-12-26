/**
 * GitHub DevOps Notify - Supabase Edge Function
 * 
 * Receives GitHub webhook events for PR merges and sends email notifications
 * to the DevOps team with PR details.
 * 
 * FROM: ankit@hushh.ai
 * TO: DevOps Team (manish@, neelesh1@, ankit@, i-akshat@, suresh@)
 * 
 * Updated: Dec 26, 2025
 * - Fixed subject line encoding (removed emojis, ASCII only)
 * - Added support for multiple recipients
 * - Professional formatting
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendGmailNotification } from "./gmail.ts";
import { generateEmailHtml, generateEmailSubject } from "./template.ts";

// CORS headers for preflight requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Hub-Signature-256, X-GitHub-Event, X-GitHub-Delivery",
};

/**
 * Verify GitHub webhook signature using HMAC-SHA256
 */
async function verifyGitHubSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) {
    console.error("No signature provided");
    return false;
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );

  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = "sha256=" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

  return signature === expectedSignature;
}

/**
 * Format timestamp to IST (Indian Standard Time)
 */
function formatToIST(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "long",
  });
}

/**
 * Extract relevant PR data from GitHub webhook payload
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

function extractPRData(payload: any): PRData | null {
  try {
    const pr = payload.pull_request;
    const repo = payload.repository;

    if (!pr || !repo) {
      console.error("Missing pull_request or repository in payload");
      return null;
    }

    return {
      prNumber: pr.number,
      prTitle: pr.title,
      prUrl: pr.html_url,
      prDescription: pr.body || "No description provided.",
      author: {
        login: pr.user?.login || "unknown",
        avatarUrl: pr.user?.avatar_url || "",
        profileUrl: pr.user?.html_url || "",
      },
      mergedBy: {
        login: pr.merged_by?.login || pr.user?.login || "unknown",
        avatarUrl: pr.merged_by?.avatar_url || "",
        profileUrl: pr.merged_by?.html_url || "",
      },
      createdAt: formatToIST(pr.created_at),
      mergedAt: formatToIST(pr.merged_at),
      baseBranch: pr.base?.ref || "main",
      headBranch: pr.head?.ref || "unknown",
      filesChanged: pr.changed_files || 0,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      commits: [], // Will be populated from commits API if needed
      labels: pr.labels?.map((l: any) => l.name) || [],
      repoName: repo.full_name,
      repoUrl: repo.html_url,
    };
  } catch (error) {
    console.error("Error extracting PR data:", error);
    return null;
  }
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
    // Get headers
    const githubEvent = req.headers.get("X-GitHub-Event");
    const githubSignature = req.headers.get("X-Hub-Signature-256");
    const githubDelivery = req.headers.get("X-GitHub-Delivery");

    console.log(`Received GitHub event: ${githubEvent}, Delivery ID: ${githubDelivery}`);

    // Only process pull_request events
    if (githubEvent !== "pull_request") {
      console.log(`Ignoring event type: ${githubEvent}`);
      return new Response(JSON.stringify({ 
        message: `Event type '${githubEvent}' ignored. Only 'pull_request' events are processed.` 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the raw body for signature verification
    const rawBody = await req.text();
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get("GITHUB_WEBHOOK_SECRET");
    if (webhookSecret) {
      const isValid = await verifyGitHubSignature(rawBody, githubSignature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.log("Webhook signature verified successfully");
    } else {
      console.warn("GITHUB_WEBHOOK_SECRET not set - skipping signature verification");
    }

    // Parse the payload
    const payload = JSON.parse(rawBody);

    // Only process merged PRs to main branch
    const action = payload.action;
    const isMerged = payload.pull_request?.merged === true;
    const baseBranch = payload.pull_request?.base?.ref;

    console.log(`PR action: ${action}, merged: ${isMerged}, base branch: ${baseBranch}`);

    if (action !== "closed" || !isMerged) {
      console.log("PR not merged, ignoring");
      return new Response(JSON.stringify({ 
        message: "PR not merged. Only merged PRs trigger notifications." 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (baseBranch !== "main" && baseBranch !== "master") {
      console.log(`PR merged to ${baseBranch}, not main/master. Ignoring.`);
      return new Response(JSON.stringify({ 
        message: `PR merged to '${baseBranch}'. Only merges to main/master trigger notifications.` 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract PR data
    const prData = extractPRData(payload);
    if (!prData) {
      return new Response(JSON.stringify({ error: "Failed to extract PR data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing merged PR #${prData.prNumber}: ${prData.prTitle}`);

    // Generate email content
    const emailSubject = generateEmailSubject(prData);
    const emailHtml = generateEmailHtml(prData);

    // DevOps team recipients
    const devOpsTeam = [
      "manish@hushh.ai",
      "neelesh1@hushh.ai",
      "ankit@hushh.ai",
      "i-akshat@hush1one.com",
      "suresh@hushh.ai",
    ];

    // Send email notification to all team members
    const emailResult = await sendGmailNotification({
      to: devOpsTeam,
      subject: emailSubject,
      htmlContent: emailHtml,
    });

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      return new Response(JSON.stringify({ 
        error: "Failed to send email notification",
        details: emailResult.error 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Email sent successfully for PR #${prData.prNumber}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Notification sent for PR #${prData.prNumber}`,
      prTitle: prData.prTitle,
      mergedBy: prData.mergedBy.login,
      emailId: emailResult.messageId,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
