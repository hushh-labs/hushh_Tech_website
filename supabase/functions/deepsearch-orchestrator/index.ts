/**
 * Hushh Deep Search - Orchestrator
 * Central coordination for all OSINT WAYs
 * 
 * Features:
 * - Phase-based execution (Phase 1: fast APIs, Phase 2: medium, Phase 3: slow)
 * - Confidence-based fallback (if Phase 1 < 50%, run Phase 2; if < 70%, run Phase 3)
 * - Truecaller-first enrichment for Indian numbers
 * - Database persistence for search sessions and results
 * - Real-time progress streaming
 */

import { corsHeaders } from '../_shared/cors.ts';
import { enrichWithTruecaller, type TruecallerEnrichment } from '../_shared/truecaller.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Types
interface OrchestratorRequest {
  name: string;
  email?: string;
  phone?: string;
  runAllPhases?: boolean; // Force run all phases regardless of confidence
  // NEW: Pivot mode - when user confirms a profile
  pivotProfile?: {
    platform: string;
    profileUrl: string;
    username: string;
  };
}

// Pivot Extract response type
interface PivotExtractResponse {
  status: "success" | "partial" | "failed";
  confidence: number;
  seed: {
    platform: string;
    profileUrl: string;
    username: string;
  };
  extractedData: {
    fullName: string | null;
    headline: string | null;
    currentTitle: string | null;
    currentCompany: string | null;
    location: string | null;
    bio: string | null;
    workHistory: Array<{
      title: string;
      company: string;
      duration: string;
      isCurrent: boolean;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      year: string;
    }>;
    skills: string[];
    languages: string[];
    certifications: string[];
  };
  discoveredProfiles: Array<{
    platform: string;
    username: string | null;
    url: string | null;
    confidence: number;
    discoveryMethod: string;
  }>;
  searchQueries: {
    github: string | null;
    twitter: string | null;
    google: string | null;
    linkedin: string | null;
  };
  error?: string;
}

interface APIResult {
  apiName: string;
  brandedName: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'partial' | 'skipped';
  confidence: number;
  executionTimeMs: number;
  data: Record<string, unknown> | null;
  error?: string;
}

interface MergedProfile {
  verifiedName: string | null;
  verifiedEmails: string[];
  verifiedPhones: string[];
  profilePhotos: string[];
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
  };
  currentCompany: string | null;
  currentTitle: string | null;
  socialProfiles: Array<{
    platform: string;
    url: string;
    username?: string;
    verified: boolean;
  }>;
  skills: string[];
  bio: string | null;
}

interface OrchestratorResponse {
  searchId: string;
  status: 'processing' | 'complete' | 'partial' | 'failed';
  currentPhase: 1 | 2 | 3;
  overallConfidence: number;
  apis: Record<string, APIResult>;
  mergedProfile: MergedProfile;
  executionTimeMs: number;
  phasesCompleted: number[];
}

// API Endpoints (internal function calls)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Phase configuration
const PHASES = {
  1: ['phoneIntel', 'codeGraph', 'socialMap'], // Fast: PhoneIntel, CodeGraph, SocialMap
  2: ['webCrawl', 'commitTrail'], // Medium: WebCrawl (SerpAPI), CommitTrail
  3: ['proConnect', 'govVerify'], // Slow: ProConnect, GovVerify
} as const;

const PHASE_THRESHOLDS = {
  PHASE_1_TO_2: 50, // If Phase 1 confidence < 50, run Phase 2
  PHASE_2_TO_3: 70, // If Phase 2 confidence < 70, run Phase 3
};

// API Names mapping
const API_NAMES: Record<string, { branded: string; endpoint: string }> = {
  phoneIntel: { branded: 'Hushh PhoneIntel', endpoint: 'deepsearch-phoneintel' },
  codeGraph: { branded: 'Hushh CodeGraph', endpoint: 'deepsearch-codegraph' },
  webCrawl: { branded: 'Hushh WebCrawl', endpoint: 'deepsearch-webcrawl' },
  socialMap: { branded: 'Hushh SocialMap', endpoint: 'deepsearch-socialmap' },
  commitTrail: { branded: 'Hushh CommitTrail', endpoint: 'deepsearch-committrail' },
  proConnect: { branded: 'Hushh ProConnect', endpoint: 'deepsearch-proconnect' },
  govVerify: { branded: 'Hushh GovVerify', endpoint: 'deepsearch-govverify' },
};

/**
 * Generate a unique search ID
 */
function generateSearchId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ds_${timestamp}_${random}`;
}

/**
 * Call the PivotExtract function to extract data from confirmed profile
 * This is the CORE of the Seed-Based Identity Pivot pattern
 */
async function callPivotExtract(
  pivotProfile: OrchestratorRequest['pivotProfile'],
  name: string,
  email?: string,
  phone?: string
): Promise<PivotExtractResponse | null> {
  if (!pivotProfile) return null;
  
  console.log(`[Orchestrator] Calling PivotExtract for ${pivotProfile.platform}: @${pivotProfile.username}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/deepsearch-pivotextract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        platform: pivotProfile.platform,
        profileUrl: pivotProfile.profileUrl,
        username: pivotProfile.username,
        name,
        email,
        phone,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Orchestrator] PivotExtract error:', response.status, errorText);
      return null;
    }
    
    const result: PivotExtractResponse = await response.json();
    console.log(`[Orchestrator] PivotExtract success: ${result.discoveredProfiles?.length || 0} profiles discovered`);
    return result;
    
  } catch (error) {
    console.error('[Orchestrator] PivotExtract error:', error);
    return null;
  }
}

/**
 * Chain API calls based on discovered profiles from PivotExtract
 * Maps discovered platforms to appropriate W1-W8 APIs
 */
async function chainAPIsFromDiscoveredProfiles(
  searchId: string,
  pivotResult: PivotExtractResponse,
  name: string,
  email?: string,
  phone?: string
): Promise<Record<string, APIResult>> {
  const chainedResults: Record<string, APIResult> = {};
  
  // Map platforms to API functions
  const PLATFORM_TO_API: Record<string, string> = {
    'GitHub': 'codeGraph',
    'github': 'codeGraph',
    'LinkedIn': 'proConnect',
    'linkedin': 'proConnect',
    'Twitter': 'socialMap',
    'twitter': 'socialMap',
    'X': 'socialMap',
    'PersonalSite': 'webCrawl',
    'Website': 'webCrawl',
    'Blog': 'webCrawl',
  };
  
  console.log(`[Orchestrator] Chaining APIs for ${pivotResult.discoveredProfiles.length} discovered profiles`);
  
  // Run API calls in parallel for discovered profiles
  const promises = pivotResult.discoveredProfiles.map(async (profile) => {
    const apiName = PLATFORM_TO_API[profile.platform];
    if (!apiName) {
      console.log(`[Orchestrator] No API mapping for platform: ${profile.platform}`);
      return null;
    }
    
    // Skip if confidence is too low
    if (profile.confidence < 50) {
      console.log(`[Orchestrator] Skipping ${profile.platform} - confidence too low: ${profile.confidence}%`);
      return null;
    }
    
    console.log(`[Orchestrator] Chaining ${apiName} for discovered ${profile.platform}: @${profile.username}`);
    
    // Call the API with discovered profile info
    const startTime = Date.now();
    const apiInfo = API_NAMES[apiName];
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${apiInfo.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          searchId,
          name: pivotResult.extractedData?.fullName || name,
          email,
          phone,
          // Pass discovered username/URL for targeted search
          targetUsername: profile.username,
          targetUrl: profile.url,
          discoverySource: 'pivot',
        }),
      });
      
      if (!response.ok) {
        return {
          apiName,
          result: {
            apiName,
            brandedName: apiInfo.branded,
            status: 'failed' as const,
            confidence: 0,
            executionTimeMs: Date.now() - startTime,
            data: null,
            error: `API returned ${response.status}`,
          },
        };
      }
      
      const result = await response.json();
      return {
        apiName,
        result: {
          apiName,
          brandedName: apiInfo.branded,
          status: result.status || 'success',
          confidence: Math.min(result.confidence + 10, 100), // Boost confidence for chained results
          executionTimeMs: result.executionTimeMs || (Date.now() - startTime),
          data: result.data || null,
          error: result.error,
        } as APIResult,
      };
      
    } catch (error) {
      return {
        apiName,
        result: {
          apiName,
          brandedName: apiInfo.branded,
          status: 'failed' as const,
          confidence: 0,
          executionTimeMs: Date.now() - startTime,
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        } as APIResult,
      };
    }
  });
  
  const results = await Promise.all(promises);
  
  for (const item of results) {
    if (item) {
      chainedResults[item.apiName] = item.result;
    }
  }
  
  return chainedResults;
}

/**
 * Merge PivotExtract data into MergedProfile
 */
function mergePivotDataIntoProfile(
  profile: MergedProfile,
  pivotResult: PivotExtractResponse
): MergedProfile {
  const extracted = pivotResult.extractedData;
  
  // Update name
  if (extracted.fullName && !profile.verifiedName) {
    profile.verifiedName = extracted.fullName;
  }
  
  // Update current position
  if (extracted.currentTitle && !profile.currentTitle) {
    profile.currentTitle = extracted.currentTitle;
  }
  if (extracted.currentCompany && !profile.currentCompany) {
    profile.currentCompany = extracted.currentCompany;
  }
  
  // Update location
  if (extracted.location && !profile.location.city) {
    // Try to parse "City, Country" format
    const parts = extracted.location.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      profile.location.city = parts[0];
      profile.location.country = parts[parts.length - 1];
    } else {
      profile.location.city = extracted.location;
    }
  }
  
  // Update bio
  if (extracted.bio && !profile.bio) {
    profile.bio = extracted.bio;
  }
  
  // Merge skills
  if (extracted.skills?.length > 0) {
    const existingSkills = new Set(profile.skills);
    for (const skill of extracted.skills) {
      if (!existingSkills.has(skill)) {
        profile.skills.push(skill);
      }
    }
  }
  
  // Add seed profile to social profiles
  profile.socialProfiles.push({
    platform: pivotResult.seed.platform,
    url: pivotResult.seed.profileUrl,
    username: pivotResult.seed.username,
    verified: true, // User confirmed this profile
  });
  
  // Add discovered profiles
  for (const discovered of pivotResult.discoveredProfiles) {
    if (discovered.url && !profile.socialProfiles.some(p => p.url === discovered.url)) {
      profile.socialProfiles.push({
        platform: discovered.platform,
        url: discovered.url,
        username: discovered.username || undefined,
        verified: discovered.confidence >= 90,
      });
    }
  }
  
  return profile;
}

/**
 * Call an individual WAY API
 */
async function callWayAPI(
  apiName: string,
  searchId: string,
  name: string,
  email?: string,
  phone?: string,
  truecallerEnrichment?: TruecallerEnrichment
): Promise<APIResult> {
  const startTime = Date.now();
  const apiInfo = API_NAMES[apiName];
  
  if (!apiInfo) {
    return {
      apiName,
      brandedName: apiName,
      status: 'failed',
      confidence: 0,
      executionTimeMs: Date.now() - startTime,
      data: null,
      error: 'Unknown API',
    };
  }
  
  try {
    // Build the internal function URL
    const functionUrl = `${SUPABASE_URL}/functions/v1/${apiInfo.endpoint}`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        searchId,
        name,
        email,
        phone,
        truecallerEnrichment,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Orchestrator] ${apiName} error:`, response.status, errorText);
      return {
        apiName,
        brandedName: apiInfo.branded,
        status: 'failed',
        confidence: 0,
        executionTimeMs: Date.now() - startTime,
        data: null,
        error: `API returned ${response.status}`,
      };
    }
    
    const result = await response.json();
    
    return {
      apiName,
      brandedName: apiInfo.branded,
      status: result.status || 'success',
      confidence: result.confidence || 0,
      executionTimeMs: result.executionTimeMs || (Date.now() - startTime),
      data: result.data || null,
      error: result.error,
    };
    
  } catch (error) {
    console.error(`[Orchestrator] ${apiName} error:`, error);
    return {
      apiName,
      brandedName: apiInfo.branded,
      status: 'failed',
      confidence: 0,
      executionTimeMs: Date.now() - startTime,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run a phase of APIs in parallel
 */
async function runPhase(
  phase: 1 | 2 | 3,
  searchId: string,
  name: string,
  email?: string,
  phone?: string,
  truecallerEnrichment?: TruecallerEnrichment
): Promise<Record<string, APIResult>> {
  const apis = PHASES[phase];
  const results: Record<string, APIResult> = {};
  
  console.log(`[Orchestrator] Running Phase ${phase} with APIs: ${apis.join(', ')}`);
  
  // Run all APIs in the phase in parallel
  const promises = apis.map(async (apiName) => {
    const result = await callWayAPI(
      apiName,
      searchId,
      name,
      email,
      phone,
      truecallerEnrichment
    );
    return { apiName, result };
  });
  
  const phaseResults = await Promise.all(promises);
  
  for (const { apiName, result } of phaseResults) {
    results[apiName] = result;
  }
  
  return results;
}

/**
 * Calculate overall confidence from all API results
 */
function calculateOverallConfidence(apis: Record<string, APIResult>): number {
  const results = Object.values(apis).filter(r => r.status !== 'pending' && r.status !== 'skipped');
  
  if (results.length === 0) return 0;
  
  // Weighted average based on status
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const result of results) {
    let weight = 1;
    if (result.status === 'success') weight = 1.5;
    else if (result.status === 'partial') weight = 1;
    else if (result.status === 'failed') weight = 0.5;
    
    weightedSum += result.confidence * weight;
    totalWeight += weight;
  }
  
  return Math.round(weightedSum / totalWeight);
}

/**
 * Merge profiles from all API results
 */
function mergeProfiles(
  apis: Record<string, APIResult>,
  truecallerEnrichment?: TruecallerEnrichment
): MergedProfile {
  const merged: MergedProfile = {
    verifiedName: null,
    verifiedEmails: [],
    verifiedPhones: [],
    profilePhotos: [],
    location: {
      city: null,
      state: null,
      country: null,
    },
    currentCompany: null,
    currentTitle: null,
    socialProfiles: [],
    skills: [],
    bio: null,
  };
  
  // Start with Truecaller data if available
  if (truecallerEnrichment?.truecallerFound) {
    merged.verifiedName = truecallerEnrichment.verifiedName;
    if (truecallerEnrichment.additionalEmails.length > 0) {
      merged.verifiedEmails.push(...truecallerEnrichment.additionalEmails);
    }
    merged.location = {
      city: truecallerEnrichment.location.city,
      state: truecallerEnrichment.location.state,
      country: truecallerEnrichment.location.country,
    };
    if (truecallerEnrichment.photoUrl) {
      merged.profilePhotos.push(truecallerEnrichment.photoUrl);
    }
  }
  
  // Merge data from each API
  for (const [apiName, result] of Object.entries(apis)) {
    if (!result.data || result.status === 'failed') continue;
    
    const data = result.data as Record<string, unknown>;
    
    // Merge based on API type
    switch (apiName) {
      case 'phoneIntel':
        if (data.verifiedName && !merged.verifiedName) {
          merged.verifiedName = data.verifiedName as string;
        }
        if (data.additionalEmails) {
          const emails = data.additionalEmails as string[];
          merged.verifiedEmails.push(...emails.filter(e => !merged.verifiedEmails.includes(e)));
        }
        if (data.photoUrl && !merged.profilePhotos.includes(data.photoUrl as string)) {
          merged.profilePhotos.push(data.photoUrl as string);
        }
        break;
        
      case 'codeGraph':
        if (data.verifiedName && !merged.verifiedName) {
          merged.verifiedName = data.verifiedName as string;
        }
        if (data.verifiedEmail) {
          const email = data.verifiedEmail as string;
          if (!merged.verifiedEmails.includes(email)) {
            merged.verifiedEmails.push(email);
          }
        }
        if (data.company && !merged.currentCompany) {
          merged.currentCompany = data.company as string;
        }
        if (data.location) {
          const loc = data.location as string;
          if (!merged.location.city) {
            merged.location.city = loc;
          }
        }
        if (data.bio && !merged.bio) {
          merged.bio = data.bio as string;
        }
        // Add GitHub profile
        if (data.profileUrls) {
          const urls = data.profileUrls as string[];
          for (const url of urls) {
            if (!merged.socialProfiles.some(p => p.url === url)) {
              merged.socialProfiles.push({
                platform: 'github',
                url,
                username: url.split('/').pop(),
                verified: true,
              });
            }
          }
        }
        break;
        
      case 'webCrawl':
        if (data.extractedProfiles) {
          const profiles = data.extractedProfiles as Array<{
            platform: string;
            url: string;
            username?: string;
            verified: boolean;
          }>;
          for (const profile of profiles) {
            if (!merged.socialProfiles.some(p => p.url === profile.url)) {
              merged.socialProfiles.push(profile);
            }
          }
        }
        if (data.relatedCompanies && !merged.currentCompany) {
          const companies = data.relatedCompanies as string[];
          if (companies.length > 0) {
            merged.currentCompany = companies[0];
          }
        }
        if (data.relatedLocations && !merged.location.city) {
          const locations = data.relatedLocations as string[];
          if (locations.length > 0) {
            merged.location.city = locations[0];
            merged.location.country = 'India';
          }
        }
        break;
    }
  }
  
  return merged;
}

/**
 * Save search session to database
 */
async function saveSearchSession(
  supabase: ReturnType<typeof createClient>,
  searchId: string,
  input: OrchestratorRequest,
  result: OrchestratorResponse
): Promise<void> {
  try {
    // Save to osint_searches table
    await supabase.from('osint_searches').upsert({
      id: searchId,
      input_name: input.name,
      input_email: input.email,
      input_phone: input.phone,
      status: result.status,
      current_phase: result.currentPhase,
      overall_confidence: result.overallConfidence,
      phases_completed: result.phasesCompleted,
      execution_time_ms: result.executionTimeMs,
      created_at: new Date().toISOString(),
    });
    
    // Save merged profile to osint_profiles table
    await supabase.from('osint_profiles').upsert({
      search_id: searchId,
      verified_name: result.mergedProfile.verifiedName,
      verified_emails: result.mergedProfile.verifiedEmails,
      verified_phones: result.mergedProfile.verifiedPhones,
      profile_photos: result.mergedProfile.profilePhotos,
      location_city: result.mergedProfile.location.city,
      location_state: result.mergedProfile.location.state,
      location_country: result.mergedProfile.location.country,
      current_company: result.mergedProfile.currentCompany,
      current_title: result.mergedProfile.currentTitle,
      social_profiles: result.mergedProfile.socialProfiles,
      skills: result.mergedProfile.skills,
      bio: result.mergedProfile.bio,
      overall_confidence: result.overallConfidence,
      updated_at: new Date().toISOString(),
    });
    
    // Save individual API results to osint_api_calls table
    for (const [apiName, apiResult] of Object.entries(result.apis)) {
      await supabase.from('osint_api_calls').upsert({
        search_id: searchId,
        api_name: apiName,
        branded_name: apiResult.brandedName,
        status: apiResult.status,
        confidence: apiResult.confidence,
        execution_time_ms: apiResult.executionTimeMs,
        response_data: apiResult.data,
        error_message: apiResult.error,
        created_at: new Date().toISOString(),
      });
    }
    
    console.log(`[Orchestrator] Saved search session ${searchId} to database`);
  } catch (error) {
    console.error('[Orchestrator] Error saving to database:', error);
  }
}

/**
 * Main handler for Orchestrator API
 */
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  const searchId = generateSearchId();
  
  try {
    // Parse request
    const body: OrchestratorRequest = await req.json();
    const { name, email, phone, runAllPhases, pivotProfile } = body;
    
    if (!name) {
      return new Response(
        JSON.stringify({
          searchId,
          status: 'failed',
          error: 'Name is required',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Initialize API results
    const apis: Record<string, APIResult> = {};
    for (const apiName of Object.keys(API_NAMES)) {
      apis[apiName] = {
        apiName,
        brandedName: API_NAMES[apiName].branded,
        status: 'pending',
        confidence: 0,
        executionTimeMs: 0,
        data: null,
      };
    }
    
    let mergedProfile: MergedProfile;
    let phasesCompleted: number[] = [];
    let currentPhase: 1 | 2 | 3 = 1;
    let overallConfidence = 0;
    
    // ========================================
    // PIVOT MODE: Seed-Based Identity Search
    // ========================================
    if (pivotProfile) {
      console.log(`[Orchestrator] 🎯 PIVOT MODE - Starting seed-based search for confirmed ${pivotProfile.platform}: @${pivotProfile.username}`);
      
      // Step 1: Call PivotExtract to analyze the confirmed profile
      const pivotResult = await callPivotExtract(pivotProfile, name, email, phone);
      
      if (pivotResult && pivotResult.status !== 'failed') {
        console.log(`[Orchestrator] PivotExtract found ${pivotResult.discoveredProfiles.length} related profiles`);
        
        // Add pivotExtract as a "virtual" API result
        apis['pivotExtract'] = {
          apiName: 'pivotExtract',
          brandedName: 'Hushh PivotExtract',
          status: pivotResult.status === 'success' ? 'success' : 'partial',
          confidence: pivotResult.confidence,
          executionTimeMs: 1000, // Approximate
          data: {
            extractedData: pivotResult.extractedData,
            discoveredProfiles: pivotResult.discoveredProfiles,
            searchQueries: pivotResult.searchQueries,
          },
        };
        
        // Step 2: Chain APIs based on discovered profiles
        console.log(`[Orchestrator] Chaining W1-W8 APIs for discovered profiles...`);
        const chainedResults = await chainAPIsFromDiscoveredProfiles(
          searchId,
          pivotResult,
          name,
          email,
          phone
        );
        
        // Merge chained results into apis
        for (const [apiName, result] of Object.entries(chainedResults)) {
          apis[apiName] = result;
        }
        
        // Step 3: Build merged profile starting with pivot data
        mergedProfile = {
          verifiedName: null,
          verifiedEmails: email ? [email] : [],
          verifiedPhones: phone ? [phone.replace(/[\s\-\(\)\.]/g, '')] : [],
          profilePhotos: [],
          location: { city: null, state: null, country: null },
          currentCompany: null,
          currentTitle: null,
          socialProfiles: [],
          skills: [],
          bio: null,
        };
        
        // Merge pivot data first
        mergedProfile = mergePivotDataIntoProfile(mergedProfile, pivotResult);
        
        // Then merge API results
        const apiMergedData = mergeProfiles(apis);
        
        // Combine - pivot data takes priority
        if (!mergedProfile.verifiedName && apiMergedData.verifiedName) {
          mergedProfile.verifiedName = apiMergedData.verifiedName;
        }
        if (!mergedProfile.currentCompany && apiMergedData.currentCompany) {
          mergedProfile.currentCompany = apiMergedData.currentCompany;
        }
        if (!mergedProfile.currentTitle && apiMergedData.currentTitle) {
          mergedProfile.currentTitle = apiMergedData.currentTitle;
        }
        if (!mergedProfile.bio && apiMergedData.bio) {
          mergedProfile.bio = apiMergedData.bio;
        }
        
        // Merge arrays
        for (const email of apiMergedData.verifiedEmails) {
          if (!mergedProfile.verifiedEmails.includes(email)) {
            mergedProfile.verifiedEmails.push(email);
          }
        }
        for (const phone of apiMergedData.verifiedPhones) {
          if (!mergedProfile.verifiedPhones.includes(phone)) {
            mergedProfile.verifiedPhones.push(phone);
          }
        }
        for (const photo of apiMergedData.profilePhotos) {
          if (!mergedProfile.profilePhotos.includes(photo)) {
            mergedProfile.profilePhotos.push(photo);
          }
        }
        for (const skill of apiMergedData.skills) {
          if (!mergedProfile.skills.includes(skill)) {
            mergedProfile.skills.push(skill);
          }
        }
        for (const profile of apiMergedData.socialProfiles) {
          if (!mergedProfile.socialProfiles.some(p => p.url === profile.url)) {
            mergedProfile.socialProfiles.push(profile);
          }
        }
        
        // Calculate confidence - higher for pivot mode since user confirmed
        overallConfidence = Math.min(
          pivotResult.confidence + 20 + calculateOverallConfidence(chainedResults),
          100
        );
        
        phasesCompleted = [1, 2, 3]; // Mark all phases complete for pivot
        currentPhase = 3;
        
        console.log(`[Orchestrator] 🎯 PIVOT MODE complete - confidence: ${overallConfidence}%`);
        
      } else {
        console.log(`[Orchestrator] PivotExtract failed, falling back to normal search`);
        // Fall through to normal search
      }
    }
    
    // ========================================
    // NORMAL MODE: Phase-based discovery
    // ========================================
    if (phasesCompleted.length === 0) {
      console.log(`[Orchestrator] Starting normal phase-based search ${searchId} for: ${name}`);
      
      // Step 1: Get Truecaller enrichment FIRST for Indian numbers
      let truecallerEnrichment: TruecallerEnrichment | undefined;
      if (phone) {
        console.log(`[Orchestrator] Getting Truecaller enrichment for phone`);
        truecallerEnrichment = await enrichWithTruecaller(phone, name);
        console.log(`[Orchestrator] Truecaller found: ${truecallerEnrichment.truecallerFound}`);
      }
      
      // Step 2: Run Phase 1 (fast APIs)
      const phase1Results = await runPhase(1, searchId, name, email, phone, truecallerEnrichment);
      Object.assign(apis, phase1Results);
      
      phasesCompleted = [1];
      currentPhase = 1;
      overallConfidence = calculateOverallConfidence(apis);
      
      console.log(`[Orchestrator] Phase 1 complete, confidence: ${overallConfidence}%`);
      
      // Step 3: Run Phase 2 if confidence < 50% or runAllPhases is true
      if (overallConfidence < PHASE_THRESHOLDS.PHASE_1_TO_2 || runAllPhases) {
        console.log(`[Orchestrator] Running Phase 2 (confidence ${overallConfidence}% < ${PHASE_THRESHOLDS.PHASE_1_TO_2}%)`);
        
        const phase2Results = await runPhase(2, searchId, name, email, phone, truecallerEnrichment);
        Object.assign(apis, phase2Results);
        
        phasesCompleted.push(2);
        currentPhase = 2;
        overallConfidence = calculateOverallConfidence(apis);
        
        console.log(`[Orchestrator] Phase 2 complete, confidence: ${overallConfidence}%`);
      }
      
      // Step 4: Run Phase 3 if confidence < 70% or runAllPhases is true
      if ((overallConfidence < PHASE_THRESHOLDS.PHASE_2_TO_3 || runAllPhases) && PHASES[3].length > 0) {
        console.log(`[Orchestrator] Running Phase 3 (confidence ${overallConfidence}% < ${PHASE_THRESHOLDS.PHASE_2_TO_3}%)`);
        
        const phase3Results = await runPhase(3, searchId, name, email, phone, truecallerEnrichment);
        Object.assign(apis, phase3Results);
        
        phasesCompleted.push(3);
        currentPhase = 3;
        overallConfidence = calculateOverallConfidence(apis);
        
        console.log(`[Orchestrator] Phase 3 complete, confidence: ${overallConfidence}%`);
      }
      
      // Step 5: Merge all profiles
      mergedProfile = mergeProfiles(apis, truecallerEnrichment);
      
      // Step 6: Add phone to verified phones if provided
      if (phone) {
        const parsedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        if (!mergedProfile.verifiedPhones.includes(parsedPhone)) {
          mergedProfile.verifiedPhones.push(parsedPhone);
        }
      }
    }
    
    // Determine final status
    let status: 'processing' | 'complete' | 'partial' | 'failed' = 'complete';
    const successCount = Object.values(apis).filter(a => a.status === 'success').length;
    const failedCount = Object.values(apis).filter(a => a.status === 'failed').length;
    
    if (failedCount === Object.keys(apis).length) {
      status = 'failed';
    } else if (successCount < Object.values(apis).filter(a => a.status !== 'pending' && a.status !== 'skipped').length) {
      status = 'partial';
    }
    
    // Build response
    const response: OrchestratorResponse = {
      searchId,
      status,
      currentPhase,
      overallConfidence,
      apis,
      mergedProfile: mergedProfile!,
      executionTimeMs: Date.now() - startTime,
      phasesCompleted,
    };
    
    // Save to database
    await saveSearchSession(supabase, searchId, body, response);
    
    console.log(`[Orchestrator] Search ${searchId} complete - ${pivotProfile ? '🎯 PIVOT MODE' : 'NORMAL'} - confidence: ${overallConfidence}%, phases: ${phasesCompleted.join(',')}, time: ${response.executionTimeMs}ms`);
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('[Orchestrator] Error:', error);
    
    return new Response(
      JSON.stringify({
        searchId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
