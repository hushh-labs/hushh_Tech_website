// Create Stripe Checkout Session for CEO Meeting Access
// $1 payment for booking meeting with CEO Manish Sainani + 100 Hushh Coins

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

    // Check if user already has a completed payment
    const { data: existingPayment } = await supabase
      .from('ceo_meeting_payments')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingPayment?.payment_status === 'completed') {
      return new Response(
        JSON.stringify({ 
          error: 'Already paid', 
          alreadyPaid: true,
          message: 'You have already completed the payment' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current URL for success/cancel redirects
    const origin = req.headers.get('origin') || 'https://hushhtech.com';
    const successUrl = `${origin}/onboarding/meet-ceo?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/onboarding/meet-ceo?payment=cancel`;

    // Create Stripe Checkout Session - email is optional (handle edge case where user has no email)
    const checkoutConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Meet CEO Manish Sainani',
              description: 'Book a meeting with the CEO & Co-Founder of Hushh Technologies + Get 100 Hushh Coins',
            },
            unit_amount: 100, // $1.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        purpose: 'ceo_meeting',
        hushh_coins: '100',
      },
    };

    // Only prepopulate email if user has one (handle edge case where user has no email)
    if (user.email) {
      checkoutConfig.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(checkoutConfig);

    // Upsert payment record with pending status
    const { error: upsertError } = await supabase
      .from('ceo_meeting_payments')
      .upsert({
        user_id: user.id,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
        payment_status: 'pending',
        amount_cents: 100,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('Database error:', upsertError);
      // Continue anyway - payment is more important
    }

    return new Response(
      JSON.stringify({ 
        checkoutUrl: session.url,
        sessionId: session.id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Create checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
