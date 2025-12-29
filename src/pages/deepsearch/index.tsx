/**
 * Hushh Deep Search Page
 * OSINT Intelligence Lookup - No Authentication Required
 * Route: /deepsearch
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Progress,
  Badge,
  Divider,
  Avatar,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Icon,
  Flex,
  SimpleGrid,
  Card,
  CardBody,
  useToast,
  Spinner,
  Link,
  Tooltip,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DeepSearchInput,
  DeepSearchSession,
  DeepSearchResult,
  APIResult,
  APIStatus,
  API_NAMES,
  CONFIDENCE_THRESHOLDS,
} from '../../types/deepSearch';
import { runDeepSearch } from '../../services/deepSearch';

// Motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

// Country codes for phone
const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
];

// API Icons
const API_ICONS: Record<string, string> = {
  codeGraph: '💻',
  commitTrail: '📝',
  socialMap: '🌐',
  webCrawl: '🔍',
  proConnect: '💼',
  govVerify: '🏛️',
  phoneIntel: '📱',
};

// Screen types
type ScreenType = 'input' | 'processing' | 'verification' | 'results';

// Profile selection status
interface ProfileSelection {
  id: string;
  platform: string;
  username: string;
  url?: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

// Confirmed Identity Pivot - the anchor for refined search
interface ConfirmedPivot {
  platform: string;
  username: string;
  profileUrl?: string;
  confirmedAt: Date;
}

// Initialize empty API results
const initializeAPIResults = (): Record<string, APIResult> => {
  const results: Record<string, APIResult> = {};
  Object.entries(API_NAMES).forEach(([key, value]) => {
    results[key] = {
      apiName: key,
      brandedName: value.branded,
      status: 'pending',
      confidence: 0,
      data: {},
    };
  });
  return results;
};

// Status color mapping
const getStatusColor = (status: APIStatus): string => {
  switch (status) {
    case 'pending': return 'gray';
    case 'running': return 'blue';
    case 'success': return 'green';
    case 'failed': return 'red';
    case 'skipped': return 'orange';
    default: return 'gray';
  }
};

// Status icon mapping
const getStatusIcon = (status: APIStatus): string => {
  switch (status) {
    case 'pending': return '⏳';
    case 'running': return '🔄';
    case 'success': return '✅';
    case 'failed': return '❌';
    case 'skipped': return '⏭️';
    default: return '⏳';
  }
};

// Confidence color
const getConfidenceColor = (confidence: number): string => {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'green';
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'yellow';
  if (confidence >= CONFIDENCE_THRESHOLDS.LOW) return 'orange';
  return 'red';
};

// Main Component
const DeepSearchPage: React.FC = () => {
  const toast = useToast();
  
  // State
  const [screen, setScreen] = useState<ScreenType>('input');
  const [input, setInput] = useState<DeepSearchInput>({
    name: '',
    email: '',
    phone: '',
    countryCode: '+91',
  });
  const [apiResults, setApiResults] = useState<Record<string, APIResult>>(initializeAPIResults());
  const [overallConfidence, setOverallConfidence] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [result, setResult] = useState<DeepSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Profile verification state
  const [profileSelections, setProfileSelections] = useState<ProfileSelection[]>([]);
  const [rejectedSearches, setRejectedSearches] = useState<string[]>([]);
  const [searchIteration, setSearchIteration] = useState(1);
  const [isRefining, setIsRefining] = useState(false);
  
  // Pivot state - the confirmed identity anchor for enhanced search
  const [confirmedPivot, setConfirmedPivot] = useState<ConfirmedPivot | null>(null);
  const [isPivotSearch, setIsPivotSearch] = useState(false);

  // Extract profiles from result for verification
  const extractProfilesForVerification = useCallback((searchResult: DeepSearchResult): ProfileSelection[] => {
    const profiles: ProfileSelection[] = [];
    
    // Extract social profiles
    if (searchResult.socialProfiles) {
      searchResult.socialProfiles.forEach((profile, index) => {
        profiles.push({
          id: `social_${profile.platform}_${index}`,
          platform: profile.platform,
          username: profile.username || 'Unknown',
          url: profile.url,
          status: 'pending',
        });
      });
    }
    
    return profiles;
  }, []);

  // Handle confirming a profile ("This is me") - PIVOT SEARCH PATTERN
  // When user confirms a profile, we lock it as the PIVOT/ANCHOR
  // and re-run ALL W1-W9 APIs with this verified identity for higher accuracy
  const handleConfirmProfile = useCallback(async (profileId: string) => {
    const profile = profileSelections.find(p => p.id === profileId);
    if (!profile) return;
    
    // Mark this profile as confirmed in the UI
    setProfileSelections(prev =>
      prev.map(p =>
        p.id === profileId
          ? { ...p, status: 'confirmed' as const }
          : p
      )
    );
    
    // Set this profile as the PIVOT - the anchor for enhanced search
    const pivot: ConfirmedPivot = {
      platform: profile.platform,
      username: profile.username,
      profileUrl: profile.url,
      confirmedAt: new Date(),
    };
    setConfirmedPivot(pivot);
    setIsPivotSearch(true);
    
    // Show identity locked animation
    toast({
      title: '🔒 Identity Locked!',
      description: `Using @${profile.username} on ${profile.platform} as anchor`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Small delay for visual feedback, then trigger pivot-based search
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Navigate to processing screen and re-run ALL APIs with pivot
    setScreen('processing');
    await handleStartSearch(false, pivot);
  }, [profileSelections, toast]);

  // Handle rejecting a profile ("Not me")
  const handleRejectProfile = useCallback((profileId: string) => {
    setProfileSelections(prev =>
      prev.map(p =>
        p.id === profileId
          ? { ...p, status: 'rejected' as const }
          : p
      )
    );
    
    // Add to rejected searches for refinement
    const profile = profileSelections.find(p => p.id === profileId);
    if (profile) {
      setRejectedSearches(prev => [...prev, `${profile.platform}:${profile.username}`]);
    }
    
    toast({
      title: '✗ Profile Rejected',
      description: 'This profile has been marked as not yours',
      status: 'info',
      duration: 2000,
    });
  }, [profileSelections, toast]);

  // Handle rejecting all profiles and triggering refined search
  const handleRejectAllAndRefine = useCallback(async () => {
    // Mark all pending as rejected
    setProfileSelections(prev =>
      prev.map(p => ({ ...p, status: 'rejected' as const }))
    );
    
    // Add all to rejected list
    const allRejected = profileSelections.map(p => `${p.platform}:${p.username}`);
    setRejectedSearches(prev => [...prev, ...allRejected]);
    
    // Increment search iteration
    setSearchIteration(prev => prev + 1);
    setIsRefining(true);
    
    toast({
      title: '🔄 Refining Search...',
      description: 'Searching again with better filters',
      status: 'loading',
      duration: 3000,
    });
    
    // Trigger refined search
    setScreen('processing');
    await handleStartSearch(true); // Pass true for refined search
    setIsRefining(false);
  }, [profileSelections, toast]);

  // Proceed to results with verified profiles
  const handleProceedToResults = useCallback(() => {
    // Update result with verified profiles
    if (result) {
      const confirmedProfiles = profileSelections.filter(p => p.status === 'confirmed');
      const updatedSocialProfiles = result.socialProfiles.map(sp => {
        const verified = confirmedProfiles.find(
          cp => cp.platform === sp.platform && cp.username === sp.username
        );
        return { ...sp, verified: !!verified };
      });
      
      setResult({
        ...result,
        socialProfiles: updatedSocialProfiles,
      });
    }
    
    setScreen('results');
  }, [result, profileSelections]);

  // Handle input change
  const handleInputChange = (field: keyof DeepSearchInput, value: string) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  // Simulate API call (will be replaced with real API)
  const simulateAPICall = async (apiKey: string, delay: number): Promise<APIResult> => {
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate random success/failure
    const success = Math.random() > 0.2;
    const confidence = success ? Math.floor(Math.random() * 40) + 10 : 0;
    
    return {
      apiName: apiKey,
      brandedName: API_NAMES[apiKey as keyof typeof API_NAMES]?.branded || apiKey,
      status: success ? 'success' : 'failed',
      confidence,
      data: success ? { found: true, details: `Mock data from ${apiKey}` } : {},
      executionTimeMs: delay,
    };
  };

  // Run Phase 1 APIs (Fast APIs)
  const runPhase1 = async () => {
    const phase1APIs = ['codeGraph', 'commitTrail', 'phoneIntel'];
    
    for (const apiKey of phase1APIs) {
      setApiResults(prev => ({
        ...prev,
        [apiKey]: { ...prev[apiKey], status: 'running' },
      }));
      
      const result = await simulateAPICall(apiKey, 1000 + Math.random() * 1000);
      
      setApiResults(prev => ({
        ...prev,
        [apiKey]: result,
      }));
    }
  };

  // Run Phase 2 APIs
  const runPhase2 = async () => {
    const phase2APIs = ['socialMap', 'webCrawl'];
    
    for (const apiKey of phase2APIs) {
      setApiResults(prev => ({
        ...prev,
        [apiKey]: { ...prev[apiKey], status: 'running' },
      }));
      
      const result = await simulateAPICall(apiKey, 1500 + Math.random() * 1500);
      
      setApiResults(prev => ({
        ...prev,
        [apiKey]: result,
      }));
    }
  };

  // Run Phase 3 APIs
  const runPhase3 = async () => {
    const phase3APIs = ['proConnect', 'govVerify'];
    
    for (const apiKey of phase3APIs) {
      setApiResults(prev => ({
        ...prev,
        [apiKey]: { ...prev[apiKey], status: 'running' },
      }));
      
      const result = await simulateAPICall(apiKey, 2000 + Math.random() * 2000);
      
      setApiResults(prev => ({
        ...prev,
        [apiKey]: result,
      }));
    }
  };

  // Calculate overall confidence
  const calculateConfidence = (results: Record<string, APIResult>): number => {
    let total = 0;
    let count = 0;
    
    Object.values(results).forEach(r => {
      if (r.status === 'success') {
        total += r.confidence;
        count++;
      }
    });
    
    return count > 0 ? Math.min(total, 100) : 0;
  };

  // Generate mock result
  const generateMockResult = (): DeepSearchResult => {
    return {
      id: `result_${Date.now()}`,
      searchId: `search_${Date.now()}`,
      verifiedName: input.name,
      verifiedEmails: input.email ? [input.email] : [],
      verifiedPhones: input.phone ? [`${input.countryCode}${input.phone}`] : [],
      profilePhotos: ['https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200'],
      location: {
        city: 'Unknown',
        state: 'Unknown',
        country: 'Unknown',
      },
      currentCompany: 'Unknown',
      currentTitle: 'Unknown',
      workHistory: [],
      education: [],
      skills: [],
      socialProfiles: [
        { platform: 'GitHub', url: '#', username: input.email?.split('@')[0], verified: false },
        { platform: 'LinkedIn', url: '#', verified: false },
        { platform: 'Twitter', url: '#', verified: false },
      ],
      overallConfidence,
      confidenceBreakdown: Object.fromEntries(
        Object.entries(apiResults).map(([k, v]) => [k, v.confidence])
      ),
      sources: apiResults,
      createdAt: new Date().toISOString(),
      status: 'complete',
    };
  };

  // Start search - Now uses real Orchestrator API
  // pivot: Optional confirmed identity to use as anchor for enhanced search
  const handleStartSearch = async (isRefinedSearch: boolean = false, pivot?: ConfirmedPivot) => {
    if (!input.name) {
      toast({
        title: 'Name is required',
        description: 'Please enter at least a name to search',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsSearching(true);
    setScreen('processing');
    setApiResults(initializeAPIResults());
    setOverallConfidence(0);
    setCurrentPhase(1);

    // Set all APIs to "running" for visual effect
    Object.keys(API_NAMES).forEach(key => {
      setApiResults(prev => ({
        ...prev,
        [key]: { ...prev[key], status: 'running' },
      }));
    });

    try {
      // Prepare phone with country code
      const fullPhone = input.phone ? `${input.countryCode}${input.phone}` : undefined;
      
      // Build pivot profile for seed-based search if provided
      const pivotProfile = pivot ? {
        platform: pivot.platform,
        profileUrl: pivot.profileUrl || '',
        username: pivot.username,
      } : undefined;
      
      if (pivotProfile) {
        console.log(`[DeepSearch] 🎯 Starting PIVOT MODE search with ${pivot?.platform}: @${pivot?.username}`);
      }
      
      // Call the real Orchestrator API with pivot profile
      const session = await runDeepSearch(
        {
          name: input.name,
          email: input.email || undefined,
          phone: fullPhone,
          countryCode: input.countryCode,
          // Pass rejected profiles to exclude from refined search
          excludeProfiles: isRefinedSearch ? rejectedSearches : undefined,
        } as any,
        true, // runAllPhases = true
        pivotProfile // Pass pivot profile for seed-based search
      );

      // Update API results from session
      if (session.apis) {
        setApiResults(session.apis as Record<string, APIResult>);
      }

      // Update phase and confidence
      setCurrentPhase(session.currentPhase || 3);
      const finalConfidence = session.result?.overallConfidence || 
        calculateConfidence(session.apis as Record<string, APIResult>);
      setOverallConfidence(finalConfidence);

      // Set result - if pivot search, go directly to results; otherwise go to verification
      if (session.result) {
        setResult(session.result);
        
        // Extract profiles for verification
        const profiles = extractProfilesForVerification(session.result);
        setProfileSelections(profiles);
        
        // PIVOT SEARCH: Go directly to results (pivot already confirmed)
        // NORMAL SEARCH: Go to verification screen to let user confirm profiles
        if (pivot || isPivotSearch) {
          // Pivot search complete - go directly to results
          setScreen('results');
          toast({
            title: '🎯 Pivot Search Complete!',
            description: `Enhanced search found ${finalConfidence}% confidence match`,
            status: 'success',
            duration: 3000,
          });
        } else if (profiles.length > 0) {
          // Normal search - go to verification
          setScreen('verification');
          toast({
            title: 'Profiles Found',
            description: 'Please verify which profiles belong to you',
            status: 'info',
            duration: 3000,
          });
        } else {
          setScreen('results');
          toast({
            title: 'Search Complete',
            description: `Found ${finalConfidence}% confidence match`,
            status: 'success',
            duration: 3000,
          });
        }
      } else if (session.status === 'failed') {
        // Handle failure - fall back to mock for demo
        console.warn('API call failed, using mock data for demo');
        const mockResult = generateMockResult();
        setResult(mockResult);
        
        // Extract profiles for verification
        const profiles = extractProfilesForVerification(mockResult);
        setProfileSelections(profiles);
        
        // PIVOT SEARCH: Go directly to results
        // NORMAL SEARCH: Go to verification
        if (pivot || isPivotSearch) {
          setScreen('results');
        } else if (profiles.length > 0) {
          setScreen('verification');
        } else {
          setScreen('results');
        }
        
        toast({
          title: 'Search Complete (Demo Mode)',
          description: 'Using demo data - API connection pending',
          status: 'info',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Fallback to mock for demo purposes
      const mockResult = generateMockResult();
      setResult(mockResult);
      
      // Extract profiles for verification
      const profiles = extractProfilesForVerification(mockResult);
      setProfileSelections(profiles);
      
      // PIVOT SEARCH: Go directly to results
      // NORMAL SEARCH: Go to verification
      if (pivot || isPivotSearch) {
        setScreen('results');
      } else if (profiles.length > 0) {
        setScreen('verification');
      } else {
        setScreen('results');
      }
      
      toast({
        title: 'Search Complete (Demo Mode)',
        description: 'Using demo data while API connection is being established',
        status: 'info',
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Reset search
  const handleReset = () => {
    setScreen('input');
    setInput({ name: '', email: '', phone: '', countryCode: '+91' });
    setApiResults(initializeAPIResults());
    setOverallConfidence(0);
    setCurrentPhase(1);
    setResult(null);
    // Reset verification state
    setProfileSelections([]);
    setRejectedSearches([]);
    setSearchIteration(1);
    setIsRefining(false);
    // Reset pivot state
    setConfirmedPivot(null);
    setIsPivotSearch(false);
  };

  // Render Input Screen
  const renderInputScreen = () => (
    <MotionVStack
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      spacing={8}
      w="full"
      maxW="500px"
      mx="auto"
    >
      {/* Header */}
      <VStack spacing={2} textAlign="center">
        <Heading
          size="2xl"
          bgGradient="linear(to-r, #E54D60, #A342FF)"
          bgClip="text"
        >
          🔍 Hushh Deep Search
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Find anyone on the internet with minimal information
        </Text>
      </VStack>

      {/* Form */}
      <VStack
        spacing={5}
        w="full"
        p={8}
        bg="rgba(255,255,255,0.03)"
        borderRadius="2xl"
        border="1px solid rgba(255,255,255,0.1)"
      >
        <FormControl isRequired>
          <FormLabel color="gray.300">Full Name</FormLabel>
          <Input
            placeholder="Enter full name"
            value={input.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            size="lg"
            bg="rgba(0,0,0,0.3)"
            border="1px solid rgba(255,255,255,0.1)"
            _focus={{ borderColor: '#E54D60' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel color="gray.300">Email Address</FormLabel>
          <Input
            type="email"
            placeholder="Enter email"
            value={input.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            size="lg"
            bg="rgba(0,0,0,0.3)"
            border="1px solid rgba(255,255,255,0.1)"
            _focus={{ borderColor: '#E54D60' }}
          />
        </FormControl>

        <FormControl>
          <FormLabel color="gray.300">Phone Number</FormLabel>
          <HStack>
            <Select
              value={input.countryCode}
              onChange={(e) => handleInputChange('countryCode', e.target.value)}
              w="140px"
              size="lg"
              bg="rgba(0,0,0,0.3)"
              border="1px solid rgba(255,255,255,0.1)"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code} style={{ background: '#1a1a2e' }}>
                  {c.flag} {c.code}
                </option>
              ))}
            </Select>
            <Input
              type="tel"
              placeholder="Phone number"
              value={input.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              size="lg"
              bg="rgba(0,0,0,0.3)"
              border="1px solid rgba(255,255,255,0.1)"
              _focus={{ borderColor: '#E54D60' }}
            />
          </HStack>
        </FormControl>

        <Button
          w="full"
          size="lg"
          bgGradient="linear(to-r, #E54D60, #A342FF)"
          color="white"
          _hover={{ transform: 'scale(1.02)', boxShadow: '0 0 30px rgba(229, 77, 96, 0.4)' }}
          _active={{ transform: 'scale(0.98)' }}
          onClick={() => handleStartSearch()}
          isLoading={isSearching}
          loadingText="Searching..."
          mt={4}
        >
          🔍 Hushh Deep Search
        </Button>
      </VStack>

      {/* Info */}
      <Text fontSize="sm" color="gray.500" textAlign="center">
        Powered by 7 intelligence sources • No login required
      </Text>
    </MotionVStack>
  );

  // Render Processing Screen
  const renderProcessingScreen = () => (
    <MotionVStack
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      spacing={6}
      w="full"
      maxW="600px"
      mx="auto"
    >
      {/* Pivot Banner - Shows when we have a confirmed identity anchor */}
      {isPivotSearch && confirmedPivot && (
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          w="full"
          p={4}
          bgGradient="linear(to-r, green.600, teal.500)"
          borderRadius="xl"
          border="2px solid"
          borderColor="green.400"
          boxShadow="0 0 20px rgba(72, 187, 120, 0.4)"
        >
          <HStack justify="center" spacing={3}>
            <Text fontSize="2xl">🔒</Text>
            <VStack spacing={0} align="start">
              <Text color="white" fontWeight="bold" fontSize="sm">
                IDENTITY PIVOT LOCKED
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="whiteAlpha" variant="solid">
                  {confirmedPivot.platform}
                </Badge>
                <Text color="whiteAlpha.900" fontWeight="medium">
                  @{confirmedPivot.username}
                </Text>
              </HStack>
            </VStack>
            <Text fontSize="lg">🎯</Text>
          </HStack>
          <Text fontSize="xs" color="whiteAlpha.800" textAlign="center" mt={2}>
            Enhanced search using verified identity as anchor • Higher accuracy results
          </Text>
        </MotionBox>
      )}

      {/* Header */}
      <VStack spacing={2}>
        <Heading size="lg" color="white">
          {isPivotSearch ? '🎯 Pivot-Enhanced Search...' : '🔄 Searching Intelligence Sources...'}
        </Heading>
        <Text color="gray.400">
          Searching for: <strong>{input.name}</strong>
        </Text>
        {isPivotSearch && (
          <Text fontSize="sm" color="green.400">
            Using @{confirmedPivot?.username} as identity anchor for higher accuracy
          </Text>
        )}
      </VStack>

      {/* Overall Progress */}
      <Box w="full" p={4} bg="rgba(255,255,255,0.03)" borderRadius="xl">
        <HStack justify="space-between" mb={2}>
          <Text color="gray.300">Overall Confidence</Text>
          <Badge colorScheme={getConfidenceColor(overallConfidence)} fontSize="md">
            {overallConfidence}%
          </Badge>
        </HStack>
        <Progress
          value={overallConfidence}
          colorScheme={getConfidenceColor(overallConfidence)}
          borderRadius="full"
          size="lg"
          hasStripe
          isAnimated
        />
        <Text fontSize="sm" color="gray.500" mt={2}>
          Phase {currentPhase} of 3
        </Text>
      </Box>

      {/* API Status Cards */}
      <VStack spacing={3} w="full">
        {Object.entries(API_NAMES).map(([key, value]) => {
          const apiResult = apiResults[key];
          return (
            <HStack
              key={key}
              w="full"
              p={4}
              bg="rgba(255,255,255,0.02)"
              borderRadius="lg"
              border="1px solid"
              borderColor={apiResult.status === 'running' ? 'blue.500' : 'rgba(255,255,255,0.1)'}
              justify="space-between"
            >
              <HStack spacing={3}>
                <Text fontSize="xl">{API_ICONS[key]}</Text>
                <VStack align="start" spacing={0}>
                  <Text color="white" fontWeight="medium">
                    {value.branded}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {value.description}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing={3}>
                {apiResult.status === 'running' && <Spinner size="sm" color="blue.400" />}
                <Badge colorScheme={getStatusColor(apiResult.status)}>
                  {getStatusIcon(apiResult.status)} {apiResult.status}
                </Badge>
                {apiResult.status === 'success' && (
                  <Badge colorScheme="green">+{apiResult.confidence}</Badge>
                )}
              </HStack>
            </HStack>
          );
        })}
      </VStack>
    </MotionVStack>
  );

  // Platform icons for verification
  const PLATFORM_ICONS: Record<string, string> = {
    GitHub: '💻',
    LinkedIn: '💼',
    Twitter: '🐦',
    Facebook: '📘',
    Instagram: '📸',
    YouTube: '🎬',
    TikTok: '🎵',
    Website: '🌐',
    Blog: '📝',
    Unknown: '🔗',
  };

  // Render Verification Screen - User confirms/rejects found profiles
  const renderVerificationScreen = () => {
    const pendingCount = profileSelections.filter(p => p.status === 'pending').length;
    const confirmedCount = profileSelections.filter(p => p.status === 'confirmed').length;
    const rejectedCount = profileSelections.filter(p => p.status === 'rejected').length;

    return (
      <MotionVStack
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        spacing={6}
        w="full"
        maxW="700px"
        mx="auto"
      >
        {/* Header */}
        <VStack spacing={2} textAlign="center">
          <Heading
            size="lg"
            bgGradient="linear(to-r, #E54D60, #A342FF)"
            bgClip="text"
          >
            🔍 Verify Your Profiles
          </Heading>
          <Text color="gray.400">
            We found {profileSelections.length} profiles. Please confirm which ones belong to you.
          </Text>
          {searchIteration > 1 && (
            <Badge colorScheme="purple" fontSize="sm">
              Search Iteration #{searchIteration}
            </Badge>
          )}
        </VStack>

        {/* Progress Summary */}
        <HStack
          w="full"
          p={4}
          bg="rgba(255,255,255,0.03)"
          borderRadius="xl"
          justify="space-around"
        >
          <VStack spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.300">
              {pendingCount}
            </Text>
            <Text fontSize="xs" color="gray.500">Pending</Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="green.400">
              {confirmedCount}
            </Text>
            <Text fontSize="xs" color="gray.500">Confirmed</Text>
          </VStack>
          <VStack spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="red.400">
              {rejectedCount}
            </Text>
            <Text fontSize="xs" color="gray.500">Rejected</Text>
          </VStack>
        </HStack>

        {/* Profile Cards */}
        <VStack spacing={4} w="full">
          {profileSelections.map((profile) => (
            <Box
              key={profile.id}
              w="full"
              p={5}
              bg={
                profile.status === 'confirmed'
                  ? 'rgba(72, 187, 120, 0.1)'
                  : profile.status === 'rejected'
                  ? 'rgba(245, 101, 101, 0.1)'
                  : 'rgba(255,255,255,0.03)'
              }
              borderRadius="xl"
              border="2px solid"
              borderColor={
                profile.status === 'confirmed'
                  ? 'green.500'
                  : profile.status === 'rejected'
                  ? 'red.500'
                  : 'rgba(255,255,255,0.1)'
              }
              transition="all 0.3s"
            >
              <HStack justify="space-between" align="center">
                {/* Profile Info */}
                <HStack spacing={4}>
                  <Flex
                    w="50px"
                    h="50px"
                    bg="rgba(255,255,255,0.05)"
                    borderRadius="lg"
                    align="center"
                    justify="center"
                    fontSize="2xl"
                  >
                    {PLATFORM_ICONS[profile.platform] || PLATFORM_ICONS.Unknown}
                  </Flex>
                  <VStack align="start" spacing={0}>
                    <Text color="white" fontWeight="bold" fontSize="lg">
                      {profile.platform}
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      @{profile.username}
                    </Text>
                    {profile.url && profile.url !== '#' && (
                      <Link
                        href={profile.url}
                        isExternal
                        color="blue.400"
                        fontSize="xs"
                      >
                        View Profile →
                      </Link>
                    )}
                  </VStack>
                </HStack>

                {/* Action Buttons */}
                <HStack spacing={2}>
                  {profile.status === 'pending' ? (
                    <>
                      <Tooltip label="This is me" placement="top">
                        <Button
                          size="md"
                          colorScheme="green"
                          variant="solid"
                          onClick={() => handleConfirmProfile(profile.id)}
                          leftIcon={<span>✓</span>}
                        >
                          This is me
                        </Button>
                      </Tooltip>
                      <Tooltip label="Not me" placement="top">
                        <Button
                          size="md"
                          colorScheme="red"
                          variant="outline"
                          onClick={() => handleRejectProfile(profile.id)}
                          leftIcon={<span>✗</span>}
                        >
                          Not me
                        </Button>
                      </Tooltip>
                    </>
                  ) : (
                    <Badge
                      colorScheme={profile.status === 'confirmed' ? 'green' : 'red'}
                      fontSize="md"
                      px={3}
                      py={1}
                    >
                      {profile.status === 'confirmed' ? '✓ Confirmed' : '✗ Rejected'}
                    </Badge>
                  )}
                </HStack>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* Action Buttons */}
        <VStack spacing={3} w="full" pt={4}>
          {/* Proceed to Results */}
          {confirmedCount > 0 || rejectedCount === profileSelections.length ? (
            <Button
              w="full"
              size="lg"
              bgGradient="linear(to-r, #E54D60, #A342FF)"
              color="white"
              _hover={{ transform: 'scale(1.02)', boxShadow: '0 0 30px rgba(229, 77, 96, 0.4)' }}
              onClick={handleProceedToResults}
              leftIcon={<span>✓</span>}
            >
              Continue to Results
            </Button>
          ) : null}

          {/* Reject All and Search Again */}
          <Button
            w="full"
            size="lg"
            variant="outline"
            colorScheme="orange"
            onClick={handleRejectAllAndRefine}
            isLoading={isRefining}
            loadingText="Refining search..."
            leftIcon={<span>🔄</span>}
          >
            None of these are me - Search Again
          </Button>

          {/* Start Over */}
          <Button
            w="full"
            size="md"
            variant="ghost"
            colorScheme="gray"
            onClick={handleReset}
            leftIcon={<span>←</span>}
          >
            Start New Search
          </Button>
        </VStack>

        {/* Rejected Profiles History */}
        {rejectedSearches.length > 0 && (
          <Box w="full" p={4} bg="rgba(255,255,255,0.02)" borderRadius="lg">
            <Text fontSize="sm" color="gray.500" mb={2}>
              Previously rejected profiles ({rejectedSearches.length}):
            </Text>
            <Wrap>
              {rejectedSearches.map((rejected, i) => (
                <WrapItem key={i}>
                  <Tag size="sm" colorScheme="red" variant="subtle">
                    <TagLabel>{rejected}</TagLabel>
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}
      </MotionVStack>
    );
  };

  // Render Results Screen
  const renderResultsScreen = () => {
    if (!result) return null;

    return (
      <MotionVStack
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        spacing={6}
        w="full"
        maxW="800px"
        mx="auto"
      >
        {/* Confidence Banner */}
        <Box
          w="full"
          p={6}
          bgGradient={`linear(to-r, ${getConfidenceColor(result.overallConfidence)}.600, ${getConfidenceColor(result.overallConfidence)}.400)`}
          borderRadius="xl"
          textAlign="center"
        >
          <Heading size="md" color="white">
            📊 CONFIDENCE: {result.overallConfidence}/100
          </Heading>
          <Progress
            value={result.overallConfidence}
            colorScheme="whiteAlpha"
            borderRadius="full"
            size="lg"
            mt={3}
            bg="rgba(0,0,0,0.2)"
          />
          <Text fontSize="sm" color="whiteAlpha.800" mt={2}>
            {result.overallConfidence >= 80 ? 'HIGH' : result.overallConfidence >= 50 ? 'MEDIUM' : 'LOW'} confidence match
          </Text>
        </Box>

        {/* Profile Card */}
        <Card
          w="full"
          bg="rgba(255,255,255,0.03)"
          border="1px solid rgba(255,255,255,0.1)"
        >
          <CardBody>
            <HStack spacing={6} align="start">
              {/* Avatar */}
              <Avatar
                size="2xl"
                name={result.verifiedName}
                src={result.profilePhotos[0]}
                bg="purple.500"
              />
              
              {/* Info */}
              <VStack align="start" spacing={3} flex={1}>
                <Heading size="lg" color="white">
                  {result.verifiedName}
                </Heading>
                
                {result.currentTitle && result.currentCompany && (
                  <Text color="gray.300">
                    {result.currentTitle} @ {result.currentCompany}
                  </Text>
                )}
                
                {result.location?.city && (
                  <Text color="gray.400" fontSize="sm">
                    📍 {result.location.city}, {result.location.state}, {result.location.country}
                  </Text>
                )}

                <Divider borderColor="rgba(255,255,255,0.1)" />

                {/* Contact */}
                <VStack align="start" spacing={1}>
                  {result.verifiedEmails.map((email, i) => (
                    <Text key={i} color="blue.300" fontSize="sm">
                      📧 {email}
                    </Text>
                  ))}
                  {result.verifiedPhones.map((phone, i) => (
                    <Text key={i} color="green.300" fontSize="sm">
                      📱 {phone}
                    </Text>
                  ))}
                </VStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Social Profiles */}
        <Box w="full">
          <Heading size="sm" color="gray.300" mb={3}>
            🔗 Social Profiles Found
          </Heading>
          <Wrap>
            {result.socialProfiles.map((profile, i) => (
              <WrapItem key={i}>
                <Tag
                  size="lg"
                  variant="subtle"
                  colorScheme={profile.verified ? 'green' : 'gray'}
                  cursor="pointer"
                >
                  <TagLabel>
                    {profile.platform}
                    {profile.username && `: @${profile.username}`}
                    {profile.verified && ' ✓'}
                  </TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {/* Sources Used */}
        <Box w="full">
          <Heading size="sm" color="gray.300" mb={3}>
            📡 Intelligence Sources
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            {Object.entries(result.sources).map(([key, value]) => (
              <Box
                key={key}
                p={3}
                bg={value.status === 'success' ? 'green.900' : 'rgba(255,255,255,0.02)'}
                borderRadius="lg"
                textAlign="center"
              >
                <Text fontSize="2xl">{API_ICONS[key]}</Text>
                <Text fontSize="xs" color="gray.400">
                  {value.brandedName}
                </Text>
                <Badge colorScheme={getStatusColor(value.status)} mt={1}>
                  {value.status === 'success' ? `+${value.confidence}` : value.status}
                </Badge>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Actions */}
        <HStack spacing={4} w="full" justify="center" pt={4}>
          <Button
            leftIcon={<span>💾</span>}
            colorScheme="green"
            variant="outline"
            onClick={() => {
              toast({
                title: 'Coming Soon',
                description: 'Save to profile feature will be available soon',
                status: 'info',
              });
            }}
          >
            Save to Profile
          </Button>
          <Button
            leftIcon={<span>📤</span>}
            colorScheme="blue"
            variant="outline"
            onClick={() => {
              const dataStr = JSON.stringify(result, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `osint_${result.verifiedName?.replace(/\s+/g, '_')}.json`;
              a.click();
            }}
          >
            Export JSON
          </Button>
          <Button
            leftIcon={<span>🔄</span>}
            colorScheme="purple"
            onClick={handleReset}
          >
            New Search
          </Button>
        </HStack>
      </MotionVStack>
    );
  };

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%)"
      py={12}
      px={4}
    >
      <Container maxW="container.lg">
        <AnimatePresence mode="wait">
          {screen === 'input' && renderInputScreen()}
          {screen === 'processing' && renderProcessingScreen()}
          {screen === 'verification' && renderVerificationScreen()}
          {screen === 'results' && renderResultsScreen()}
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default DeepSearchPage;
