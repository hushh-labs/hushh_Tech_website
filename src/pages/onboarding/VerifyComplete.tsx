import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Button,
  Icon,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import config from '../../resources/config/config';

type VerificationResult = 'verified' | 'processing' | 'requires_input' | 'failed' | 'loading';

function VerifyCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [result, setResult] = useState<VerificationResult>('loading');
  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    checkVerificationStatus();
  }, []);

  // Poll for verification status updates
  useEffect(() => {
    if (result === 'processing' && pollingCount < 10) {
      const timer = setTimeout(() => {
        checkVerificationStatus();
        setPollingCount(prev => prev + 1);
      }, 3000); // Poll every 3 seconds

      return () => clearTimeout(timer);
    }
  }, [result, pollingCount]);

  const checkVerificationStatus = async () => {
    if (!config.supabaseClient) return;

    try {
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check identity_verifications table
      const { data: verification } = await config.supabaseClient
        .from('identity_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (verification) {
        switch (verification.stripe_status) {
          case 'verified':
            setResult('verified');
            // Update onboarding_data
            await config.supabaseClient
              .from('onboarding_data')
              .update({
                identity_verified: true,
                identity_verified_at: new Date().toISOString(),
              })
              .eq('user_id', user.id);
            break;
          case 'processing':
          case 'pending':
            setResult('processing');
            break;
          case 'requires_input':
            setResult('requires_input');
            break;
          case 'failed':
          case 'canceled':
            setResult('failed');
            break;
          default:
            setResult('processing');
        }
      } else {
        // No verification record found - might be processing
        setResult('processing');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setResult('processing');
    }
  };

  const handleContinue = () => {
    navigate('/hushh-user-profile');
  };

  const handleRetry = () => {
    navigate('/onboarding/verify');
  };

  const renderContent = () => {
    switch (result) {
      case 'loading':
        return (
          <VStack spacing={6}>
            <Box
              w="100px"
              h="100px"
              borderRadius="full"
              bg="gray.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Spinner size="xl" color="cyan.500" thickness="4px" />
            </Box>
            <Text fontSize="2xl" fontWeight="500" color="#0B1120">
              Checking Status...
            </Text>
            <Text color="gray.600" textAlign="center">
              Please wait while we confirm your verification.
            </Text>
          </VStack>
        );

      case 'verified':
        return (
          <VStack spacing={6}>
            <Box
              w="100px"
              h="100px"
              borderRadius="full"
              bg="green.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
              animation="pulse 1s ease-in-out"
            >
              <Icon as={CheckCircle} boxSize={16} color="green.500" />
            </Box>
            <Text fontSize="2xl" fontWeight="500" color="#0B1120">
              Verification Complete! 🎉
            </Text>
            <Text color="gray.600" textAlign="center" maxW="400px">
              Your identity has been verified successfully. You now have full access to all features.
            </Text>
            <Button
              onClick={handleContinue}
              h="56px"
              w="full"
              maxW="320px"
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
            >
              Continue to Profile
            </Button>
          </VStack>
        );

      case 'processing':
        return (
          <VStack spacing={6}>
            <Box
              w="100px"
              h="100px"
              borderRadius="full"
              bg="blue.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={Clock} boxSize={16} color="blue.500" />
            </Box>
            <Text fontSize="2xl" fontWeight="500" color="#0B1120">
              Verification in Progress
            </Text>
            <Text color="gray.600" textAlign="center" maxW="400px">
              Your verification is being processed. This usually takes just a few moments.
            </Text>
            <VStack spacing={2} w="full" maxW="320px">
              <Box
                w="full"
                h="4px"
                bg="gray.200"
                borderRadius="full"
                overflow="hidden"
              >
                <Box
                  h="full"
                  bgGradient="linear(to-r, #00A9E0, #6DD3EF)"
                  animation="loading 2s ease-in-out infinite"
                  w="60%"
                />
              </Box>
              <Text fontSize="sm" color="gray.500">
                {pollingCount < 10 ? 'Checking status...' : 'Taking longer than expected'}
              </Text>
            </VStack>
            <Button
              onClick={handleContinue}
              variant="outline"
              h="48px"
              w="full"
              maxW="320px"
              borderRadius="full"
              borderColor="gray.300"
              color="gray.700"
              fontWeight="500"
              _hover={{ bg: 'gray.50' }}
            >
              Continue Anyway
            </Button>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              You'll be notified when verification is complete
            </Text>
          </VStack>
        );

      case 'requires_input':
        return (
          <VStack spacing={6}>
            <Box
              w="100px"
              h="100px"
              borderRadius="full"
              bg="yellow.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={AlertCircle} boxSize={16} color="yellow.600" />
            </Box>
            <Text fontSize="2xl" fontWeight="500" color="#0B1120">
              Additional Info Needed
            </Text>
            <Text color="gray.600" textAlign="center" maxW="400px">
              We need some additional information to complete your verification. Please try again.
            </Text>
            <Button
              onClick={handleRetry}
              h="56px"
              w="full"
              maxW="320px"
              borderRadius="full"
              bgGradient="linear(to-r, #00A9E0, #6DD3EF)"
              color="white"
              fontWeight="500"
              fontSize="lg"
              leftIcon={<Icon as={RefreshCw} />}
              boxShadow="0 10px 25px rgba(0, 169, 224, 0.35)"
              _hover={{
                bgGradient: 'linear(to-r, #0095C8, #5DC5E5)',
              }}
            >
              Try Again
            </Button>
            <Button
              onClick={handleContinue}
              variant="ghost"
              color="gray.500"
              fontWeight="500"
            >
              I'll do this later
            </Button>
          </VStack>
        );

      case 'failed':
        return (
          <VStack spacing={6}>
            <Box
              w="100px"
              h="100px"
              borderRadius="full"
              bg="red.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={AlertCircle} boxSize={16} color="red.500" />
            </Box>
            <Text fontSize="2xl" fontWeight="500" color="#0B1120">
              Verification Failed
            </Text>
            <Text color="gray.600" textAlign="center" maxW="400px">
              We couldn't verify your identity. This could be due to unclear images or mismatched information.
            </Text>
            <Button
              onClick={handleRetry}
              h="56px"
              w="full"
              maxW="320px"
              borderRadius="full"
              bgGradient="linear(to-r, #00A9E0, #6DD3EF)"
              color="white"
              fontWeight="500"
              fontSize="lg"
              leftIcon={<Icon as={RefreshCw} />}
              boxShadow="0 10px 25px rgba(0, 169, 224, 0.35)"
              _hover={{
                bgGradient: 'linear(to-r, #0095C8, #5DC5E5)',
              }}
            >
              Try Again
            </Button>
            <Button
              onClick={handleContinue}
              variant="ghost"
              color="gray.500"
              fontWeight="500"
            >
              Continue without verification
            </Button>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Need help? Contact support@hushh.ai
            </Text>
          </VStack>
        );
    }
  };

  return (
    <Box minH="100vh" bg="white" pt={{ base: 24, md: 32 }} pb={12} px={4}>
      <Box maxW="640px" mx="auto" textAlign="center">
        {renderContent()}
      </Box>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </Box>
  );
}

export default VerifyCompletePage;
