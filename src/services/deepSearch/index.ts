/**
 * Hushh Deep Search - Frontend Service
 * Connects the UI to the Orchestrator API
 */

import { DeepSearchInput, DeepSearchSession, DeepSearchResult, APIResult, API_NAMES } from '../../types/deepSearch';

// Supabase Edge Functions URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ibsisfnjxeowvdtvgzff.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlic2lzZm5qeGVvd3ZkdHZnemZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTk1NzgsImV4cCI6MjA4MDEzNTU3OH0.K16sO1R9L2WZGPueDP0mArs2eDYZc-TnIk2LApDw_fs';

// API Endpoints
const ORCHESTRATOR_URL = `${SUPABASE_URL}/functions/v1/deepsearch-orchestrator`;

// Types for API response
interface OrchestratorResponse {
  searchId: string;
  status: 'processing' | 'complete' | 'partial' | 'failed';
  currentPhase: 1 | 2 | 3;
  overallConfidence: number;
  apis: Record<string, {
    apiName: string;
    brandedName: string;
    status: string;
    confidence: number;
    executionTimeMs: number;
    data: Record<string, unknown> | null;
    error?: string;
  }>;
  mergedProfile: {
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
  };
  executionTimeMs: number;
  phasesCompleted: number[];
  error?: string;
}

// Pivot profile for seed-based identity search
interface PivotProfile {
  platform: string;
  profileUrl: string;
  username: string;
}

/**
 * Run a deep search using the Orchestrator API
 * @param input - The search input (name, email, phone)
 * @param runAllPhases - Whether to run all phases regardless of confidence
 * @param pivotProfile - Optional: A confirmed profile to use as the seed for pivot mode
 */
export async function runDeepSearch(
  input: DeepSearchInput,
  runAllPhases = true,
  pivotProfile?: PivotProfile
): Promise<DeepSearchSession> {
  const startTime = Date.now();
  
  try {
    // Build request body
    const requestBody: {
      name: string;
      email?: string;
      phone?: string;
      runAllPhases: boolean;
      pivotProfile?: PivotProfile;
    } = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      runAllPhases,
    };
    
    // Add pivot profile for seed-based search if provided
    if (pivotProfile) {
      requestBody.pivotProfile = pivotProfile;
      console.log(`[DeepSearch] 🎯 PIVOT MODE - Using ${pivotProfile.platform}: @${pivotProfile.username} as seed`);
    }
    
    // Call the Orchestrator API
    const response = await fetch(ORCHESTRATOR_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_ANON_KEY && { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }),
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Search failed: ${response.status} - ${errorText}`);
    }
    
    const data: OrchestratorResponse = await response.json();
    
    // Transform the response to match our DeepSearchSession type
    return transformToSession(data, input);
    
  } catch (error) {
    console.error('[DeepSearch] Error:', error);
    
    // Return a failed session
    const errorSession: DeepSearchSession = {
      id: `ds_error_${Date.now()}`,
      input,
      status: 'failed',
      currentPhase: 1,
      apis: createEmptyAPIs(),
      createdAt: new Date().toISOString(),
    };
    
    return errorSession;
  }
}

/**
 * Transform Orchestrator response to DeepSearchSession
 */
function transformToSession(
  response: OrchestratorResponse,
  input: DeepSearchInput
): DeepSearchSession {
  // Transform APIs
  const apis: DeepSearchSession['apis'] = {
    codeGraph: transformAPIResult(response.apis.codeGraph, 'codeGraph'),
    commitTrail: transformAPIResult(response.apis.commitTrail, 'commitTrail'),
    socialMap: transformAPIResult(response.apis.socialMap, 'socialMap'),
    webCrawl: transformAPIResult(response.apis.webCrawl, 'webCrawl'),
    proConnect: transformAPIResult(response.apis.proConnect, 'proConnect'),
    govVerify: transformAPIResult(response.apis.govVerify, 'govVerify'),
    phoneIntel: transformAPIResult(response.apis.phoneIntel, 'phoneIntel'),
  };
  
  // Build result if search completed
  let result: DeepSearchResult | undefined;
  if (response.status === 'complete' || response.status === 'partial') {
    result = {
      id: `result_${response.searchId}`,
      searchId: response.searchId,
      verifiedName: response.mergedProfile.verifiedName || undefined,
      verifiedEmails: response.mergedProfile.verifiedEmails,
      verifiedPhones: response.mergedProfile.verifiedPhones,
      profilePhotos: response.mergedProfile.profilePhotos,
      location: response.mergedProfile.location.city ? {
        city: response.mergedProfile.location.city,
        state: response.mergedProfile.location.state || undefined,
        country: response.mergedProfile.location.country || undefined,
      } : undefined,
      currentCompany: response.mergedProfile.currentCompany || undefined,
      currentTitle: response.mergedProfile.currentTitle || undefined,
      workHistory: [],
      education: [],
      skills: response.mergedProfile.skills,
      socialProfiles: response.mergedProfile.socialProfiles,
      overallConfidence: response.overallConfidence,
      confidenceBreakdown: Object.fromEntries(
        Object.entries(response.apis).map(([key, api]) => [key, api.confidence])
      ),
      sources: Object.fromEntries(
        Object.entries(apis).map(([key, api]) => [key, api])
      ),
      createdAt: new Date().toISOString(),
      status: response.status === 'complete' ? 'complete' : 'partial',
    };
  }
  
  return {
    id: response.searchId,
    input,
    status: response.status === 'complete' ? 'complete' : 
            response.status === 'partial' ? 'complete' : 'failed',
    currentPhase: response.currentPhase,
    apis,
    result,
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}

/**
 * Transform API result from response to our type
 */
function transformAPIResult(
  apiResponse: OrchestratorResponse['apis'][string] | undefined,
  apiName: keyof typeof API_NAMES
): APIResult {
  const apiInfo = API_NAMES[apiName];
  
  if (!apiResponse) {
    return {
      apiName,
      brandedName: apiInfo.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    };
  }
  
  return {
    apiName,
    brandedName: apiInfo.branded,
    status: apiResponse.status as APIResult['status'],
    confidence: apiResponse.confidence,
    data: apiResponse.data || {},
    executionTimeMs: apiResponse.executionTimeMs,
    error: apiResponse.error,
  };
}

/**
 * Create empty APIs object for error state
 */
function createEmptyAPIs(): DeepSearchSession['apis'] {
  return {
    codeGraph: {
      apiName: 'codeGraph',
      brandedName: API_NAMES.codeGraph.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    },
    commitTrail: {
      apiName: 'commitTrail',
      brandedName: API_NAMES.commitTrail.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    },
    socialMap: {
      apiName: 'socialMap',
      brandedName: API_NAMES.socialMap.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    },
    webCrawl: {
      apiName: 'webCrawl',
      brandedName: API_NAMES.webCrawl.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    },
    proConnect: {
      apiName: 'proConnect',
      brandedName: API_NAMES.proConnect.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    },
    govVerify: {
      apiName: 'govVerify',
      brandedName: API_NAMES.govVerify.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    },
    phoneIntel: {
      apiName: 'phoneIntel',
      brandedName: API_NAMES.phoneIntel.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    },
  };
}

/**
 * Get a previous search result by ID
 */
export async function getSearchResult(searchId: string): Promise<DeepSearchResult | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/osint_profiles?search_id=eq.${searchId}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data.length === 0) {
      return null;
    }
    
    const profile = data[0];
    
    return {
      id: profile.id,
      searchId: profile.search_id,
      verifiedName: profile.verified_name,
      verifiedEmails: profile.verified_emails || [],
      verifiedPhones: profile.verified_phones || [],
      profilePhotos: profile.profile_photos || [],
      location: {
        city: profile.location_city,
        state: profile.location_state,
        country: profile.location_country,
      },
      currentCompany: profile.current_company,
      currentTitle: profile.current_title,
      workHistory: [],
      education: [],
      skills: profile.skills || [],
      socialProfiles: profile.social_profiles || [],
      overallConfidence: profile.overall_confidence,
      confidenceBreakdown: {},
      sources: {},
      createdAt: profile.created_at,
      status: 'complete',
    };
    
  } catch (error) {
    console.error('[DeepSearch] Error fetching result:', error);
    return null;
  }
}

/**
 * Get search history
 */
export async function getSearchHistory(limit = 10): Promise<Array<{
  id: string;
  name: string;
  status: string;
  confidence: number;
  createdAt: string;
}>> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/osint_searches?order=created_at.desc&limit=${limit}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    return data.map((search: {
      id: string;
      input_name: string;
      status: string;
      overall_confidence: number;
      created_at: string;
    }) => ({
      id: search.id,
      name: search.input_name,
      status: search.status,
      confidence: search.overall_confidence,
      createdAt: search.created_at,
    }));
    
  } catch (error) {
    console.error('[DeepSearch] Error fetching history:', error);
    return [];
  }
}
