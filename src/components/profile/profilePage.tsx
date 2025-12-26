import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  Image,
  Text,
  Button,
  useToast,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import { keyframes } from "@emotion/react";
import HushhLogo from "../images/Hushhogo.png";
import NDARequestModal from "../NDARequestModal";
import NDADocumentModal from "../NDADocumentModal";
import axios from "axios";
import config from "../../resources/config/config";
import { useNavigate } from "react-router-dom";

// Motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionFlex = motion(Flex);

// Apple-like easing curve - typed as tuple for framer-motion compatibility
const appleEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Subtle pulse animation for loading states
const pulseKeyframes = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Animation variants - refined for smoother Apple-like feel
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
      duration: 0.5,
      ease: appleEase,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: appleEase,
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: appleEase,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      delay: 0.2,
      ease: appleEase,
    },
  },
};

const ProfilePage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [session, setSession] = useState<any>(null);
  const [ndaStatus, setNdaStatus] = useState<string>("Not Applied");
  const [ndaMetadata, setNdaMetadata] = useState<any>(null);
  const [showNdaModal, setShowNdaModal] = useState(false);
  const [showNdaDocModal, setShowNdaDocModal] = useState(false);
  const [ndaApproved, setNdaApproved] = useState(false);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const metadataFetchedRef = useRef<boolean>(false);

  // Onboarding status state
  const [onboardingStatus, setOnboardingStatus] = useState<{
    hasProfile: boolean;
    isCompleted: boolean;
    currentStep: number;
    loading: boolean;
  }>({
    hasProfile: false,
    isCompleted: false,
    currentStep: 1,
    loading: true
  });

  useEffect(() => {
    config.supabaseClient?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } =
      config.supabaseClient?.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      }) ?? { data: { subscription: null } };
    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Check user's onboarding status
  useEffect(() => {
    async function checkUserStatus() {
      if (!session?.user?.id || !config.supabaseClient) {
        setOnboardingStatus(prev => ({ ...prev, loading: false }));
        return;
      }
      
      try {
        // Check if investor_profile exists
        const { data: profile, error: profileError } = await config.supabaseClient
          .from('investor_profiles')
          .select('id, user_confirmed')
          .eq('user_id', session.user.id)
          .single();

        // Check onboarding_data status
        const { data: onboarding, error: onboardingError } = await config.supabaseClient
          .from('onboarding_data')
          .select('is_completed, current_step')
          .eq('user_id', session.user.id)
          .single();

        setOnboardingStatus({
          hasProfile: !!profile && !profileError,
          isCompleted: onboarding?.is_completed || false,
          currentStep: onboarding?.current_step || 1,
          loading: false
        });
      } catch (error) {
        console.error('Error checking user status:', error);
        setOnboardingStatus(prev => ({ ...prev, loading: false }));
      }
    }

    if (session?.user?.id) {
      checkUserStatus();
    }
  }, [session?.user?.id]);

  const checkNdaStatus = useCallback(async () => {
    if (!session) return;
    try {
      const response = await axios.post(
        "https://gsqmwxqgqrgzhlhmbscg.supabase.co/rest/v1/rpc/check_access_status",
        {},
        {
          headers: {
            apikey: config.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      const newStatus = response.data;
      setNdaStatus(newStatus);
      
      if (newStatus === "Approved") {
        setNdaApproved(true);
      }
      
      if (newStatus === "Pending: Waiting for NDA Process" && !metadataFetchedRef.current) {
        fetchNdaMetadata();
      }
    } catch (error) {
      metadataFetchedRef.current = false;
      console.warn("Failed to check NDA access status", error);
    }
  }, [session, toast]);

  useEffect(() => {
    if (session) {
      checkNdaStatus();
      const intervalId = setInterval(() => {
        checkNdaStatus();
      }, 5000);
      return () => clearInterval(intervalId);
    }
  }, [session, checkNdaStatus]);

  const fetchNdaMetadata = async () => {
    if (isMetadataLoading || (ndaMetadata && Object.keys(ndaMetadata).length > 0) || metadataFetchedRef.current) {
      return;
    }
    
    setIsMetadataLoading(true);
    try {
      const ndaResponse = await axios.post(
        "https://gsqmwxqgqrgzhlhmbscg.supabase.co/rest/v1/rpc/get_nda_metadata",
        {},
        {
          headers: {
            apikey: config.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (ndaResponse.data.status === "success") {
        const metadata = ndaResponse.data.metadata;
        setNdaMetadata(metadata);
        
        if (metadata && Object.keys(metadata).length > 0) {
          metadataFetchedRef.current = true;
        }
        
        if (metadata && ndaStatus === "Pending: Waiting for NDA Process") {
          setShowNdaDocModal(true);
        }
      }
    } catch (error) {
      metadataFetchedRef.current = false;
    } finally {
      setIsMetadataLoading(false);
    }
  };

  useEffect(() => {
    if (ndaStatus !== "Pending: Waiting for NDA Process") {
      metadataFetchedRef.current = false;
    }
  }, [ndaStatus]);

  // Get primary CTA text and action
  const getPrimaryCTAContent = () => {
    if (onboardingStatus.loading) {
      return { text: "Loading...", action: () => {} };
    }
    if (onboardingStatus.hasProfile || onboardingStatus.isCompleted) {
      return { 
        text: "View Your Profile", 
        action: () => navigate("/hushh-user-profile") 
      };
    }
    if (onboardingStatus.currentStep > 1) {
      return { 
        text: `Continue Onboarding (Step ${onboardingStatus.currentStep})`, 
        action: () => navigate(`/onboarding/step-${onboardingStatus.currentStep}`) 
      };
    }
    return { 
      text: "Complete Your Hushh Profile", 
      action: () => navigate("/onboarding/step-1") 
    };
  };

  const primaryCTA = getPrimaryCTAContent();

  return (
    <Box
      bg="#FFFFFF"
      minH="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      px={{ base: 5, sm: 6, md: 8 }}
      py={{ base: 10, md: 16 }}
      position="relative"
      overflow="hidden"
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif' 
      }}
    >
      {/* Subtle background gradient */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #F0F4F8 100%)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Content Container */}
      <MotionBox
        maxW="440px"
        w="100%"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        position="relative"
        zIndex={1}
      >
        {/* Logo Section */}
        <MotionBox 
          display="flex" 
          justifyContent="center" 
          mb={10}
          variants={logoVariants}
        >
          <Box
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* Subtle glow behind logo */}
            <Box
              position="absolute"
              w="160px"
              h="160px"
              bg="radial-gradient(circle, rgba(0, 169, 224, 0.08) 0%, transparent 70%)"
              borderRadius="full"
              filter="blur(20px)"
              zIndex={-1}
            />
            <Image
              src={HushhLogo}
              alt="Hushh Logo"
              h={{ base: "100px", md: "120px" }}
              objectFit="contain"
              filter="drop-shadow(0 4px 24px rgba(0, 169, 224, 0.12))"
            />
          </Box>
        </MotionBox>

        {/* Header Section */}
        <MotionBox 
          textAlign="center" 
          mb={10}
          variants={itemVariants}
        >
          {/* Headline */}
          <Text
            as="h1"
            fontSize={{ base: "34px", md: "40px" }}
            fontWeight="600"
            color="#1D1D1F"
            lineHeight="1.08"
            letterSpacing="-0.025em"
            mb={4}
          >
            Investing in the Future.
          </Text>

          {/* Subheadline */}
          <Text
            fontSize={{ base: "17px", md: "19px" }}
            color="#515154"
            lineHeight="1.55"
            maxW="360px"
            mx="auto"
            fontWeight="400"
          >
            The AI-Powered Berkshire Hathaway. We combine AI and human expertise to invest in exceptional businesses for long-term value creation.
          </Text>
        </MotionBox>

        {/* Main Action Card */}
        <MotionBox
          bg="rgba(255, 255, 255, 0.95)"
          backdropFilter="blur(20px)"
          borderRadius="28px"
          p={{ base: 6, md: 8 }}
          boxShadow="0 4px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)"
          border="1px solid rgba(0, 0, 0, 0.04)"
          variants={cardVariants}
        >
          <VStack spacing={4}>
            {/* Primary CTA Button */}
            <MotionButton
              onClick={primaryCTA.action}
              w="100%"
              h="56px"
              borderRadius="full"
              bg="#2b8cee"
              color="white"
              fontSize="17px"
              fontWeight="600"
              letterSpacing="-0.01em"
              isLoading={onboardingStatus.loading}
              loadingText="Loading..."
              position="relative"
              overflow="hidden"
              _hover={{ 
                bg: "#2480d9",
                transform: "translateY(-1px)",
                boxShadow: "0 12px 32px rgba(43, 140, 238, 0.4)",
              }}
              _active={{
                bg: "#1e74c9",
                transform: "scale(0.98)",
              }}
              _disabled={{
                opacity: 0.7,
                cursor: "not-allowed",
              }}
              transition="all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              boxShadow="0 8px 24px rgba(43, 140, 238, 0.35)"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Subtle shine effect */}
              <Box
                position="absolute"
                top="0"
                left="-100%"
                w="100%"
                h="100%"
                bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
                animation={onboardingStatus.loading ? `${pulseKeyframes} 2s ease-in-out infinite` : "none"}
              />
              {primaryCTA.text}
            </MotionButton>

            {/* Secondary CTA Button */}
            <MotionButton
              onClick={() => navigate("/discover-fund-a")}
              w="100%"
              h="56px"
              borderRadius="full"
              bg="white"
              border="2px solid #2b8cee"
              color="#1D1D1F"
              fontSize="17px"
              fontWeight="600"
              letterSpacing="-0.01em"
              _hover={{ 
                bg: "rgba(43, 140, 238, 0.05)",
                borderColor: "#2480d9",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 16px rgba(43, 140, 238, 0.15)",
              }}
              _active={{ 
                bg: "rgba(43, 140, 238, 0.1)",
                transform: "scale(0.98)",
              }}
              transition="all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              Discover Fund A
            </MotionButton>
          </VStack>
        </MotionBox>

        {/* Footer Tagline */}
        <MotionBox
          textAlign="center"
          mt={8}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: appleEase } as any}
        >
          <Text
            fontSize="13px"
            fontWeight="500"
            color="#8E8E93"
            letterSpacing="0.02em"
          >
            Secure. Private. AI-Powered.
          </Text>
        </MotionBox>

        {/* Trust indicators - subtle */}
        <MotionBox
          display="flex"
          justifyContent="center"
          gap={6}
          mt={6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 } as any}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box 
              w="8px" 
              h="8px" 
              borderRadius="full" 
              bg="#34C759"
              boxShadow="0 0 8px rgba(52, 199, 89, 0.4)"
              animation="pulse 2s ease-in-out infinite"
              sx={{
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1, transform: "scale(1)" },
                  "50%": { opacity: 0.7, transform: "scale(1.1)" }
                }
              }}
            />
            <Text fontSize="13px" color="#6E6E73" fontWeight="500">
              SEC REGISTERED
            </Text>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon as={FaLock} w="12px" h="12px" color="#6E6E73" />
            <Text fontSize="13px" color="#6E6E73" fontWeight="500">
              BANK LEVEL SECURITY
            </Text>
          </Box>
        </MotionBox>
      </MotionBox>

      {/* NDA Modals - kept for compatibility but hidden */}
      {false && showNdaModal && session && (
        <NDARequestModal
          isOpen={showNdaModal}
          onClose={() => setShowNdaModal(false)}
          session={session}
          onSubmit={(result: string) => {
            setNdaStatus(result);
            setShowNdaModal(false);
            
            if (result === "Pending: Waiting for NDA Process") {
              fetchNdaMetadata();
            }
          }}
        />
      )}
      
      {false && showNdaDocModal && ndaMetadata && session && (
        <NDADocumentModal
          isOpen={showNdaDocModal}
          onClose={() => {
            setShowNdaDocModal(false);
          }}
          session={session}
          ndaMetadata={ndaMetadata}
          onAccept={() => {
            setNdaApproved(true);
            setShowNdaDocModal(false);
            setNdaStatus("Approved");
            localStorage.setItem("communityFilter", "nda");
          }}
        />
      )}
    </Box>
  );
};

export default ProfilePage;
