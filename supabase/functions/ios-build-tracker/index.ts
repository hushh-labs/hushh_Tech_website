// iOS Build Tracker Edge Function
// Stores App Store Connect credentials and tracks build status
// Actual iOS build must run locally (requires Xcode/macOS)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BuildRecord {
  build_number: number
  version: string
  status: 'pending' | 'building' | 'uploading' | 'processing' | 'ready' | 'failed'
  started_at: string
  completed_at?: string
  error_message?: string
  ipa_size?: string
  triggered_by?: string
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Get App Store Connect credentials from secrets
    const apiKeyId = Deno.env.get('APP_STORE_API_KEY_ID')
    const issuerId = Deno.env.get('APP_STORE_ISSUER_ID')
    const teamId = Deno.env.get('APPLE_TEAM_ID')
    const bundleId = Deno.env.get('APPLE_BUNDLE_ID')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    switch (action) {
      case 'get-credentials': {
        // Return credentials for local build script (without exposing p8 key)
        if (!apiKeyId || !issuerId) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'App Store Connect credentials not configured',
              setup_instructions: 'Run: npx supabase secrets set APP_STORE_API_KEY_ID=xxx APP_STORE_ISSUER_ID=xxx'
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            credentials: {
              api_key_id: apiKeyId,
              issuer_id: issuerId,
              team_id: teamId || 'WVDK9JW99C',
              bundle_id: bundleId || 'ai.hushh.app'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'start-build': {
        // Record a new build start
        const body = await req.json()
        const { build_number, version, triggered_by } = body

        const buildRecord: BuildRecord = {
          build_number,
          version: version || '1.0.0',
          status: 'building',
          started_at: new Date().toISOString(),
          triggered_by: triggered_by || 'manual'
        }

        const { data, error } = await supabase
          .from('ios_builds')
          .insert([buildRecord])
          .select()
          .single()

        if (error) {
          console.error('Error recording build start:', error)
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Build ${build_number} started`,
            build: data || buildRecord
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update-status': {
        // Update build status
        const body = await req.json()
        const { build_number, status, error_message, ipa_size } = body

        const updateData: Partial<BuildRecord> = { status }
        
        if (status === 'ready' || status === 'failed') {
          updateData.completed_at = new Date().toISOString()
        }
        if (error_message) {
          updateData.error_message = error_message
        }
        if (ipa_size) {
          updateData.ipa_size = ipa_size
        }

        const { data, error } = await supabase
          .from('ios_builds')
          .update(updateData)
          .eq('build_number', build_number)
          .select()
          .single()

        if (error) {
          console.error('Error updating build status:', error)
        }

        // Send notification for completed builds
        if (status === 'ready') {
          console.log(`🎉 Build ${build_number} deployed to TestFlight!`)
          // Could add email/Slack notification here
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Build ${build_number} status updated to ${status}`,
            build: data
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get-latest': {
        // Get latest build info
        const { data, error } = await supabase
          .from('ios_builds')
          .select('*')
          .order('build_number', { ascending: false })
          .limit(1)
          .single()

        return new Response(
          JSON.stringify({
            success: true,
            latest_build: data || null
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'list-builds': {
        // List recent builds
        const limit = parseInt(url.searchParams.get('limit') || '10')
        
        const { data, error } = await supabase
          .from('ios_builds')
          .select('*')
          .order('build_number', { ascending: false })
          .limit(limit)

        return new Response(
          JSON.stringify({
            success: true,
            builds: data || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default: {
        // Default: return status and info
        return new Response(
          JSON.stringify({
            success: true,
            service: 'iOS Build Tracker',
            version: '1.0.0',
            actions: [
              'get-credentials - Get App Store Connect API credentials',
              'start-build - Record a new build start',
              'update-status - Update build status',
              'get-latest - Get latest build info',
              'list-builds - List recent builds'
            ],
            credentials_configured: !!(apiKeyId && issuerId),
            app_info: {
              team_id: teamId || 'WVDK9JW99C',
              bundle_id: bundleId || 'ai.hushh.app'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

  } catch (error) {
    console.error('Error in ios-build-tracker:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
