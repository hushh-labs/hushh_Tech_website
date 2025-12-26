import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.10.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { 
      email, 
      phone, 
      returnUrl,
      metadata = {} 
    } = body;

    // Get verification flow ID from env or use provided one
    const verificationFlowId = Deno.env.get("STRIPE_VERIFICATION_FLOW_ID") || "vf_1SdqC9LYaD0u4Aj1BB7NFhbN";

    // Create Stripe Identity Verification Session
    const verificationSession = await stripe.identity.verificationSessions.create({
      verification_flow: verificationFlowId,
      provided_details: {
        ...(email && { email }),
        ...(phone && { phone }),
      },
      client_reference_id: user.id,
      return_url: returnUrl || `${Deno.env.get("SITE_URL") || "https://hushhtech.com"}/onboarding/verify-complete`,
      metadata: {
        user_id: user.id,
        ...metadata,
      },
    });

    // Store verification session in database - use stripe_status (existing column name)
    const { data: verificationRecord, error: dbError } = await supabase
      .from("identity_verifications")
      .upsert({
        user_id: user.id,
        stripe_session_id: verificationSession.id,
        stripe_verification_flow_id: verificationFlowId,
        stripe_status: verificationSession.status,
        provided_email: email || null,
        provided_phone: phone || null,
        stripe_response: {
          id: verificationSession.id,
          status: verificationSession.status,
          type: verificationSession.type,
          created: verificationSession.created,
        },
        created_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      // Continue even if DB save fails - verification is more important
    }

    // Return session details to frontend
    return new Response(
      JSON.stringify({
        success: true,
        session: {
          id: verificationSession.id,
          url: verificationSession.url,
          status: verificationSession.status,
          client_secret: verificationSession.client_secret,
        },
        verification_id: verificationRecord?.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error creating verification session:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create verification session",
        details: error.toString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
