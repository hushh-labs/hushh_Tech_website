/**
 * Hushh Deep Search - Pivot Extract (W9+)
 * 
 * This function is the CORE of the Seed-Based Identity Pivot pattern.
 * When user confirms a profile ("This is me"), this function:
 * 
 * 1. EXTRACTS full data from the confirmed profile using ChatGPT
 * 2. DISCOVERS related profiles (GitHub from LinkedIn bio, Twitter handle, etc.)
 * 3. Returns structured data for chaining to other W1-W8 APIs
 * 
 * This is the key differentiator - we use the confirmed profile as a SEED
 * to build a complete digital portfolio.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input types
interface PivotExtractRequest {
  platform: string;           // "LinkedIn", "GitHub", "Twitter", etc.
  profileUrl: string;         // Full URL to the confirmed profile
  username: string;           // Username/handle on that platform
  name?: string;              // Original search name
  email?: string;             // Original search email
  phone?: string;             // Original search phone
}

// Output types
interface ExtractedData {
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
}

interface DiscoveredProfile {
  platform: string;
  username: string | null;
  url: string | null;
  confidence: number;        // 0-100 how confident we are this is the same person
  discoveryMethod: string;   // "bio_link", "username_match", "ai_inference", etc.
}

interface PivotExtractResponse {
  status: "success" | "partial" | "failed";
  confidence: number;
  seed: {
    platform: string;
    profileUrl: string;
    username: string;
  };
  extractedData: ExtractedData;
  discoveredProfiles: DiscoveredProfile[];
  searchQueries: {
    github: string | null;
    twitter: string | null;
    google: string | null;
    linkedin: string | null;
  };
  rawAIResponse: string;
  timestamp: string;
  error?: string;
}

// Platform-specific extraction prompts
const PLATFORM_PROMPTS: Record<string, string> = {
  LinkedIn: `Analyze this LinkedIn profile and extract information.
A LinkedIn profile typically contains:
- Full name, headline, current position
- Work history with company names, titles, and dates
- Education history
- Skills & endorsements
- Bio/About section (often contains links to GitHub, Twitter, personal site)
- Location
- Certifications`,

  GitHub: `Analyze this GitHub profile and extract information.
A GitHub profile typically contains:
- Display name, username, bio
- Company affiliation
- Location
- Email (if public)
- Personal website/blog (often in bio)
- Twitter handle (linked in profile)
- Organizations they belong to
- Pinned repositories showing expertise`,

  Twitter: `Analyze this Twitter/X profile and extract information.
A Twitter profile typically contains:
- Display name, handle
- Bio (often contains links to other profiles)
- Location
- Website link
- Professional affiliations mentioned in bio
- Content themes indicating profession`,

  Default: `Analyze this social media profile and extract all available information.
Look for:
- Name, username, bio
- Professional information
- Location
- Links to other platforms
- Contact information`,
};

// Build the ChatGPT prompt for pivot extraction
function buildExtractionPrompt(req: PivotExtractRequest): string {
  const platformPrompt = PLATFORM_PROMPTS[req.platform] || PLATFORM_PROMPTS.Default;
  
  return `You are an expert OSINT analyst. A user has CONFIRMED that they own this profile.
Your job is to:
1. EXTRACT as much information as possible from this profile
2. DISCOVER related profiles on other platforms

CONFIRMED PROFILE (100% verified as belonging to the user):
- Platform: ${req.platform}
- URL: ${req.profileUrl}
- Username: ${req.username}
${req.name ? `- Name from initial search: ${req.name}` : ''}
${req.email ? `- Email from initial search: ${req.email}` : ''}
${req.phone ? `- Phone from initial search: ${req.phone}` : ''}

${platformPrompt}

Based on this confirmed profile, provide a comprehensive analysis in this EXACT JSON format:

{
  "extractedData": {
    "fullName": "Full name or null",
    "headline": "Professional headline or null",
    "currentTitle": "Current job title or null",
    "currentCompany": "Current company name or null",
    "location": "City, Country or null",
    "bio": "Biography/about text or null",
    "workHistory": [
      {"title": "...", "company": "...", "duration": "2020-Present", "isCurrent": true}
    ],
    "education": [
      {"institution": "...", "degree": "...", "field": "...", "year": "2020"}
    ],
    "skills": ["skill1", "skill2"],
    "languages": ["English", "Hindi"],
    "certifications": ["AWS Certified", "etc"]
  },
  "discoveredProfiles": [
    {
      "platform": "GitHub",
      "username": "discovered-username",
      "url": "https://github.com/discovered-username",
      "confidence": 85,
      "discoveryMethod": "bio_link"
    },
    {
      "platform": "Twitter",
      "username": "discovered-handle",
      "url": "https://twitter.com/discovered-handle",
      "confidence": 75,
      "discoveryMethod": "username_match"
    },
    {
      "platform": "PersonalSite",
      "username": null,
      "url": "https://example.com",
      "confidence": 90,
      "discoveryMethod": "bio_link"
    }
  ],
  "searchQueries": {
    "github": "search query to find on GitHub",
    "twitter": "search query to find on Twitter",
    "google": "site:linkedin.com OR site:github.com \"name\" \"company\"",
    "linkedin": "search query if not LinkedIn"
  }
}

IMPORTANT RULES:
1. For discoveredProfiles, ONLY include profiles you have HIGH confidence belong to the same person
2. Use these discoveryMethods: "bio_link", "username_match", "email_match", "company_match", "ai_inference"
3. Confidence should be realistic: 90+ for direct links in bio, 70-89 for username matches, 50-69 for AI inference
4. Generate useful searchQueries that can be used to find profiles on other platforms
5. Be factual - if you can't determine something, use null
6. For ${req.platform}, the extractedData should be comprehensive

Respond with ONLY valid JSON, no markdown or extra text.`;
}

// Call OpenAI API
async function callOpenAI(prompt: string, apiKey: string): Promise<any> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert OSINT analyst. Always respond with valid JSON only. Be thorough but factual - only include information you can reasonably infer from the profile.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  // Parse JSON response
  try {
    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanContent);
  } catch (e) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error("Failed to parse AI response as JSON");
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: PivotExtractRequest = await req.json();

    // Validate required fields
    if (!body.platform || !body.profileUrl || !body.username) {
      throw new Error("Missing required fields: platform, profileUrl, username");
    }

    console.log(`[PivotExtract] Starting extraction for ${body.platform}: @${body.username}`);
    console.log(`[PivotExtract] Profile URL: ${body.profileUrl}`);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Build prompt and call OpenAI
    const prompt = buildExtractionPrompt(body);
    console.log(`[PivotExtract] Calling OpenAI for extraction...`);
    
    const aiResult = await callOpenAI(prompt, openaiApiKey);
    console.log(`[PivotExtract] AI extraction complete`);

    // Calculate confidence based on extracted data completeness
    let confidence = 50; // Base confidence for confirmed profile
    
    if (aiResult.extractedData) {
      const ed = aiResult.extractedData;
      if (ed.fullName) confidence += 10;
      if (ed.currentTitle && ed.currentCompany) confidence += 10;
      if (ed.workHistory?.length > 0) confidence += 10;
      if (ed.education?.length > 0) confidence += 5;
      if (ed.skills?.length > 0) confidence += 5;
      if (ed.bio) confidence += 5;
    }
    
    if (aiResult.discoveredProfiles?.length > 0) {
      confidence += Math.min(aiResult.discoveredProfiles.length * 3, 15);
    }

    confidence = Math.min(confidence, 100);

    // Build response
    const response: PivotExtractResponse = {
      status: confidence >= 60 ? "success" : "partial",
      confidence,
      seed: {
        platform: body.platform,
        profileUrl: body.profileUrl,
        username: body.username,
      },
      extractedData: aiResult.extractedData || {
        fullName: null,
        headline: null,
        currentTitle: null,
        currentCompany: null,
        location: null,
        bio: null,
        workHistory: [],
        education: [],
        skills: [],
        languages: [],
        certifications: [],
      },
      discoveredProfiles: aiResult.discoveredProfiles || [],
      searchQueries: aiResult.searchQueries || {
        github: null,
        twitter: null,
        google: null,
        linkedin: null,
      },
      rawAIResponse: JSON.stringify(aiResult),
      timestamp: new Date().toISOString(),
    };

    console.log(`[PivotExtract] Done! Confidence: ${confidence}%, Discovered ${response.discoveredProfiles.length} profiles`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[PivotExtract] Error:", error);
    
    return new Response(JSON.stringify({
      status: "failed",
      confidence: 0,
      seed: null,
      extractedData: null,
      discoveredProfiles: [],
      searchQueries: null,
      rawAIResponse: null,
      timestamp: new Date().toISOString(),
      error: error.message,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
