// Delete User Account Edge Function
// Securely deletes all user data and the auth account

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create a Supabase client with the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // User client to verify the user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Admin client for deletion operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Get the current user
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userId = user.id
    console.log(`Deleting account for user: ${userId}`)

    // Delete user data from all tables in the correct order (respecting foreign keys)
    // Order: child tables first, parent tables last

    // 1. Delete agent_messages (child of investor_agents)
    const { error: agentMessagesError } = await adminClient
      .from('agent_messages')
      .delete()
      .eq('user_id', userId)
    
    if (agentMessagesError) {
      console.error('Error deleting agent_messages:', agentMessagesError)
    }

    // 2. Delete investor_agents
    const { error: investorAgentsError } = await adminClient
      .from('investor_agents')
      .delete()
      .eq('user_id', userId)
    
    if (investorAgentsError) {
      console.error('Error deleting investor_agents:', investorAgentsError)
    }

    // 3. Delete public_chat_messages
    const { error: chatMessagesError } = await adminClient
      .from('public_chat_messages')
      .delete()
      .eq('user_id', userId)
    
    if (chatMessagesError) {
      console.error('Error deleting public_chat_messages:', chatMessagesError)
    }

    // 4. Delete background_tasks
    const { error: backgroundTasksError } = await adminClient
      .from('background_tasks')
      .delete()
      .eq('user_id', userId)
    
    if (backgroundTasksError) {
      console.error('Error deleting background_tasks:', backgroundTasksError)
    }

    // 5. Delete investor_profiles
    const { error: investorProfilesError } = await adminClient
      .from('investor_profiles')
      .delete()
      .eq('user_id', userId)
    
    if (investorProfilesError) {
      console.error('Error deleting investor_profiles:', investorProfilesError)
    }

    // 6. Delete identity_verifications
    const { error: identityVerificationsError } = await adminClient
      .from('identity_verifications')
      .delete()
      .eq('user_id', userId)
    
    if (identityVerificationsError) {
      console.error('Error deleting identity_verifications:', identityVerificationsError)
    }

    // 7. Delete ceo_meeting_payments
    const { error: ceoMeetingPaymentsError } = await adminClient
      .from('ceo_meeting_payments')
      .delete()
      .eq('user_id', userId)
    
    if (ceoMeetingPaymentsError) {
      console.error('Error deleting ceo_meeting_payments:', ceoMeetingPaymentsError)
    }

    // 8. Delete kyc-related tables
    const { error: kycAttestationsError } = await adminClient
      .from('kyc_attestations')
      .delete()
      .eq('user_id', userId)
    
    if (kycAttestationsError) {
      console.error('Error deleting kyc_attestations:', kycAttestationsError)
    }

    const { error: kycRequestsError } = await adminClient
      .from('kyc_requests')
      .delete()
      .eq('user_id', userId)
    
    if (kycRequestsError) {
      console.error('Error deleting kyc_requests:', kycRequestsError)
    }

    // 9. Delete onboarding_data
    const { error: onboardingDataError } = await adminClient
      .from('onboarding_data')
      .delete()
      .eq('user_id', userId)
    
    if (onboardingDataError) {
      console.error('Error deleting onboarding_data:', onboardingDataError)
    }

    // 10. Delete members (last since other tables might reference it)
    const { error: membersError } = await adminClient
      .from('members')
      .delete()
      .eq('user_id', userId)
    
    if (membersError) {
      console.error('Error deleting members:', membersError)
    }

    // Finally, delete the auth user using admin API
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId)
    
    if (deleteAuthError) {
      console.error('Error deleting auth user:', deleteAuthError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete user account', 
          details: deleteAuthError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`Successfully deleted account for user: ${userId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account and all associated data have been permanently deleted' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
