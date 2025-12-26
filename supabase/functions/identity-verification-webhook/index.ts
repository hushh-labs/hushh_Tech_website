import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_IDENTITY_WEBHOOK_SECRET");
    
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Get Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return new Response(
          JSON.stringify({ error: "Webhook signature verification failed" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // For development/testing without signature verification
      event = JSON.parse(rawBody);
    }

    console.log("Received webhook event:", event.type);

    // Handle Identity verification events
    switch (event.type) {
      case "identity.verification_session.verified": {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        await handleVerificationComplete(supabase, stripe, session, "verified");
        break;
      }

      case "identity.verification_session.requires_input": {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        await handleVerificationComplete(supabase, stripe, session, "requires_input");
        break;
      }

      case "identity.verification_session.canceled": {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        await handleVerificationComplete(supabase, stripe, session, "canceled");
        break;
      }

      case "identity.verification_session.processing": {
        const session = event.data.object as Stripe.Identity.VerificationSession;
        await handleVerificationComplete(supabase, stripe, session, "processing");
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Webhook error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleVerificationComplete(
  supabase: any,
  stripe: Stripe,
  session: Stripe.Identity.VerificationSession,
  status: string
) {
  console.log(`Processing verification session ${session.id} with status: ${status}`);

  // Get user ID from metadata or client_reference_id
  const userId = session.metadata?.user_id || session.client_reference_id;
  
  if (!userId) {
    console.error("No user_id found in session metadata or client_reference_id");
    return;
  }

  // Prepare update data - use stripe_status (existing column name)
  const updateData: any = {
    stripe_status: status,
    stripe_response: session,
    updated_at: new Date().toISOString(),
  };

  // If verified, extract verified data
  if (status === "verified" && session.verified_outputs) {
    const outputs = session.verified_outputs;
    
    // Extract document data
    if (outputs.id_number) {
      updateData.verified_id_number = outputs.id_number;
    }
    
    // Extract name from document
    if (outputs.first_name) {
      updateData.verified_first_name = outputs.first_name;
    }
    if (outputs.last_name) {
      updateData.verified_last_name = outputs.last_name;
    }
    
    // Extract date of birth
    if (outputs.dob) {
      const dob = outputs.dob;
      updateData.verified_date_of_birth = `${dob.year}-${String(dob.month).padStart(2, '0')}-${String(dob.day).padStart(2, '0')}`;
    }
    
    // Extract address if available
    if (outputs.address) {
      updateData.verified_address_line1 = outputs.address.line1;
      updateData.verified_address_city = outputs.address.city;
      updateData.verified_address_state = outputs.address.state;
      updateData.verified_address_postal_code = outputs.address.postal_code;
      updateData.verified_address_country = outputs.address.country;
    }
    
    // Set verification flags
    updateData.document_verified = true;
    updateData.verified_at = new Date().toISOString();
  }

  // Check if selfie was verified (from last_verification_report)
  if (session.last_verification_report) {
    try {
      const report = await stripe.identity.verificationReports.retrieve(
        session.last_verification_report as string
      );
      
      if (report.selfie) {
        updateData.selfie_verified = report.selfie.status === "verified";
      }
      
      if (report.document) {
        updateData.verified_document_type = report.document.type;
        updateData.verified_document_country = report.document.issuing_country;
      }
      
      // Extract email/phone verification status from report
      if (report.email) {
        updateData.email_verified = report.email.status === "verified";
      }
      if (report.phone) {
        updateData.phone_verified = report.phone.status === "verified";
      }
    } catch (err) {
      console.error("Error fetching verification report:", err);
    }
  }

  // Update identity_verifications table
  const { error: updateError } = await supabase
    .from("identity_verifications")
    .update(updateData)
    .eq("stripe_session_id", session.id);

  if (updateError) {
    console.error("Error updating identity_verifications:", updateError);
    // Try to insert if update failed (might not exist yet)
    await supabase.from("identity_verifications").upsert({
      user_id: userId,
      stripe_session_id: session.id,
      ...updateData,
    });
  }

  // If verified, also update onboarding_data
  if (status === "verified") {
    const { error: onboardingError } = await supabase
      .from("onboarding_data")
      .update({
        identity_verified: true,
        identity_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (onboardingError) {
      console.error("Error updating onboarding_data:", onboardingError);
    }

    console.log(`User ${userId} verification complete!`);
  }
}
