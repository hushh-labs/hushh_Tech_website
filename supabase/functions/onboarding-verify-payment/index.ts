// Verify Stripe Payment for CEO Meeting + Award 100 Hushh Coins
// Called after user returns from Stripe checkout

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Get Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Retrieve Stripe session to verify payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment not completed',
          status: session.payment_status
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the session belongs to this user
    if (session.metadata?.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Session does not match user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Payment successful - update record and award 100 Hushh Coins
    const { data: updated, error: updateError } = await supabase
      .from('ceo_meeting_payments')
      .update({
        payment_status: 'completed',
        stripe_payment_intent: session.payment_intent as string,
        hushh_coins_awarded: 100,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('stripe_session_id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      // Try upsert if record doesn't exist
      const { error: upsertError } = await supabase
        .from('ceo_meeting_payments')
        .upsert({
          user_id: user.id,
          stripe_session_id: sessionId,
          stripe_payment_intent: session.payment_intent as string,
          payment_status: 'completed',
          hushh_coins_awarded: 100,
          amount_cents: 100,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });
        
      if (upsertError) {
        throw new Error(`Failed to update payment record: ${upsertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        paymentVerified: true,
        hushhCoinsAwarded: 100,
        message: 'Payment verified! You have earned 100 Hushh Coins.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verify payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
