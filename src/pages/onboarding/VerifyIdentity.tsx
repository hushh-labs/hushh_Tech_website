import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  Spinner,
  useToast,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { 
  Shield, 
  CheckCircle, 
  FileText, 
  Camera, 
  Mail, 
  Phone, 
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import config from '../../resources/config/config';

interface OnboardingData {
  legal_first_name?: string;
  legal_last_name?: string;
  email?: string;
  phone_number?: string;
  phone_country_code?: string;
  is_identity_verified?: boolean;
  identity_verified_at?: string;
}

interface VerificationStatus {
  status: 'not_started' | 'pending' | 'processing' | 'verified' | 'requires_input' | 'failed';
  document_verified: boolean;
  selfie_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
}

function VerifyIdentityPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [startingVerification, setStartingVerification] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    status: 'not_started',
    document_verified: false,
    selfie_verified: false,
    email_verified: false,
    phone_verified: false,
  });

  // Check authentication and load data
  useEffect(() => {
    window.scrollTo(0, 0);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (!config.supabaseClient) {
      toast({
        title: 'Error',
        description: 'Configuration error',
        status: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Load onboarding data
      const { data: onboarding } = await config.supabaseClient
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (onboarding) {
        setOnboardingData(onboarding);
        
        // If already verified, redirect to profile
        if (onboarding.identity_verified) {
          navigate('/hushh-user-profile');
          return;
        }
      }

      // Check existing verification status
      const { data: verification } = await config.supabaseClient
        .from('identity_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verification) {
        setVerificationStatus({
          status: verification.stripe_status || 'not_started',
          document_verified: verification.document_verified || false,
          selfie_verified: verification.selfie_verified || false,
          email_verified: verification.email_verified || false,
          phone_verified: verification.phone_verified || false,
        });
        
        // If verified, redirect
        if (verification.stripe_status === 'verified') {
          navigate('/hushh-user-profile');
          return;
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startVerification = async () => {
    setStartingVerification(true);

    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Build phone number with country code
      const fullPhone = onboardingData?.phone_country_code && onboardingData?.phone_number
        ? `${onboardingData.phone_country_code}${onboardingData.phone_number}`
        : undefined;

      // Call edge function to create verification session
      const response = await fetch(
        `${config.SUPABASE_URL}/functions/v1/create-verification-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            email: onboardingData?.email,
            phone: fullPhone,
            returnUrl: `${window.location.origin}/onboarding/verify-complete`,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start verification');
      }

      // Redirect to Stripe verification URL
      if (result.session?.url) {
        window.location.href = result.session.url;
      } else {
        throw new Error('No verification URL received');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start verification',
        status: 'error',
        duration: 5000,
      });
      setStartingVerification(false);
    }
  };

  const skipVerification = async () => {
    // Mark as skipped and proceed to profile
    // User can verify later from profile page
    navigate('/hushh-user-profile');
  };

  const getStatusColor = (verified: boolean) => verified ? 'green' : 'gray';
  const getStatusIcon = (verified: boolean) => verified ? CheckCircle : AlertCircle;

  if (loading) {
    return (
      <Box minH="100vh" bg="white" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="cyan.500" thickness="4px" />
          <Text color="gray.600">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="white" pt={{ base: 20, md: 24 }} pb={12} px={4}>
      <Box maxW="640px" mx="auto">
        {/* Header */}
        <VStack spacing={4} textAlign="center" mb={8}>
          <Box
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, #00A9E0 0%, #6DD3EF 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 10px 40px rgba(0, 169, 224, 0.3)"
          >
            <Icon as={Shield} boxSize={10} color="white" />
          </Box>
          
          <Text
            fontSize={{ base: '28px', md: '36px' }}
            fontWeight="500"
            color="#0B1120"
          >
            Verify Your Identity
          </Text>
          
          <Text fontSize="lg" color="gray.600" maxW="480px">
            Complete a quick verification to secure your account and unlock all features.
          </Text>
        </VStack>

        {/* Status Alert */}
        {verificationStatus.status === 'processing' && (
          <Alert status="info" borderRadius="xl" mb={6}>
            <AlertIcon as={RefreshCw} />
            <Box>
              <AlertTitle>Verification in Progress</AlertTitle>
              <AlertDescription>
                Your verification is being processed. This usually takes a few minutes.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {verificationStatus.status === 'requires_input' && (
          <Alert status="warning" borderRadius="xl" mb={6}>
            <AlertIcon />
            <Box>
              <AlertTitle>Additional Information Required</AlertTitle>
              <AlertDescription>
                Please complete the verification process. Some information may need to be resubmitted.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {verificationStatus.status === 'failed' && (
          <Alert status="error" borderRadius="xl" mb={6}>
            <AlertIcon />
            <Box>
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>
                Your verification could not be completed. Please try again or contact support.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* What will be verified */}
        <Box
          bg="gray.50"
          borderRadius="2xl"
          p={6}
          mb={8}
          border="1px solid"
          borderColor="gray.200"
        >
          <Text fontWeight="500" color="#0B1120" mb={4}>
            What will be verified:
          </Text>
          
          <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
              <Box
                w="48px"
                h="48px"
                borderRadius="xl"
                bg={verificationStatus.document_verified ? 'green.100' : 'gray.100'}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon 
                  as={FileText} 
                  boxSize={6} 
                  color={verificationStatus.document_verified ? 'green.600' : 'gray.500'} 
                />
              </Box>
              <Box flex={1}>
                <HStack>
                  <Text fontWeight="500" color="#0B1120">Government ID</Text>
                  {verificationStatus.document_verified && (
                    <Badge colorScheme="green" borderRadius="full">Verified</Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Passport, Driver's License, or ID Card
                </Text>
              </Box>
            </HStack>

            <HStack spacing={4}>
              <Box
                w="48px"
                h="48px"
                borderRadius="xl"
                bg={verificationStatus.selfie_verified ? 'green.100' : 'gray.100'}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon 
                  as={Camera} 
                  boxSize={6} 
                  color={verificationStatus.selfie_verified ? 'green.600' : 'gray.500'} 
                />
              </Box>
              <Box flex={1}>
                <HStack>
                  <Text fontWeight="500" color="#0B1120">Selfie Verification</Text>
                  {verificationStatus.selfie_verified && (
                    <Badge colorScheme="green" borderRadius="full">Verified</Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Live selfie matching your ID photo
                </Text>
              </Box>
            </HStack>

            <HStack spacing={4}>
              <Box
                w="48px"
                h="48px"
                borderRadius="xl"
                bg={verificationStatus.email_verified ? 'green.100' : 'gray.100'}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon 
                  as={Mail} 
                  boxSize={6} 
                  color={verificationStatus.email_verified ? 'green.600' : 'gray.500'} 
                />
              </Box>
              <Box flex={1}>
                <HStack>
                  <Text fontWeight="500" color="#0B1120">Email</Text>
                  {verificationStatus.email_verified && (
                    <Badge colorScheme="green" borderRadius="full">Verified</Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {onboardingData?.email || 'Your email address'}
                </Text>
              </Box>
            </HStack>

            <HStack spacing={4}>
              <Box
                w="48px"
                h="48px"
                borderRadius="xl"
                bg={verificationStatus.phone_verified ? 'green.100' : 'gray.100'}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon 
                  as={Phone} 
                  boxSize={6} 
                  color={verificationStatus.phone_verified ? 'green.600' : 'gray.500'} 
                />
              </Box>
              <Box flex={1}>
                <HStack>
                  <Text fontWeight="500" color="#0B1120">Phone Number</Text>
                  {verificationStatus.phone_verified && (
                    <Badge colorScheme="green" borderRadius="full">Verified</Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {onboardingData?.phone_country_code && onboardingData?.phone_number
                    ? `${onboardingData.phone_country_code} ${onboardingData.phone_number.replace(/(.{3})/g, '$1 ').trim()}`
                    : 'Your phone number'}
                </Text>
              </Box>
            </HStack>
          </VStack>
        </Box>

        {/* Security Note */}
        <Box
          bg="blue.50"
          borderRadius="xl"
          p={4}
          mb={8}
          border="1px solid"
          borderColor="blue.100"
        >
          <HStack spacing={3}>
            <Icon as={Shield} color="blue.500" boxSize={5} />
            <Box>
              <Text fontWeight="500" color="blue.700" fontSize="sm">
                Secure & Private
              </Text>
              <Text fontSize="xs" color="blue.600">
                Your documents are encrypted and processed securely by Stripe Identity. 
                We never store your raw document images.
              </Text>
            </Box>
          </HStack>
        </Box>

        {/* Action Buttons */}
        <VStack spacing={3}>
          <Button
            onClick={startVerification}
            isLoading={startingVerification}
            loadingText="Starting..."
            w="full"
            h="56px"
            borderRadius="full"
            bgGradient="linear(to-r, #00A9E0, #6DD3EF)"
            color="white"
            fontWeight="500"
            fontSize="lg"
            rightIcon={<Icon as={ArrowRight} />}
            boxShadow="0 10px 25px rgba(0, 169, 224, 0.35)"
            _hover={{
              bgGradient: 'linear(to-r, #0095C8, #5DC5E5)',
              boxShadow: '0 12px 30px rgba(0, 169, 224, 0.45)',
            }}
            _active={{
              transform: 'scale(0.98)',
            }}
          >
            {verificationStatus.status === 'requires_input' ? 'Continue Verification' : 'Start Verification'}
          </Button>

          <Button
            onClick={skipVerification}
            variant="ghost"
            w="full"
            h="48px"
            color="gray.500"
            fontWeight="500"
            _hover={{ color: 'gray.700', bg: 'gray.50' }}
          >
            I'll do this later
          </Button>
        </VStack>

        {/* Time estimate */}
        <Text textAlign="center" fontSize="sm" color="gray.500" mt={4}>
          This usually takes 2-3 minutes to complete
        </Text>

        {/* Back button */}
        <Button
          onClick={() => navigate('/onboarding/step-14')}
          variant="link"
          color="orange.600"
          fontWeight="500"
          mt={6}
          display="block"
          mx="auto"
        >
          Back
        </Button>
      </Box>
    </Box>
  );
}

export default VerifyIdentityPage;
