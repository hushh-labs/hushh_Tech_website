import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  Image,
  Heading,
  Text,
  Button,
  useBreakpointValue,
  Badge,
  Icon,
  useToast,
  SimpleGrid,
  Flex,
  Center,
  HStack,
  Container,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { PrimaryCtaButton } from "../PrimaryCtaButton";
import { FaFileAlt, FaUserShield } from "react-icons/fa";
import { CheckCircleIcon, InfoIcon } from "lucide-react";
import HushhLogo from "../images/Hushhogo.png";
import NDARequestModal from "../NDARequestModal";
import NDADocumentModal from "../NDADocumentModal";
import axios from "axios";
import config from "../../resources/config/config";
import { useNavigate } from "react-router-dom";

const ApprovedGif = "/gif/nda_approved.gif";
const PendingGif = "/gif/nda_pending.gif";
const RejectedGif = "/gif/nda_rejected.gif";
const NotappliedGif = "/gif/nda_notApplied.gif";

// Motion components
const MotionBox = motion(Box);
const MotionImage = motion(Image);
const MotionButton = motion(Button);

// Animation variants for Apple-like smooth animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const buttonHoverVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const ProfilePage: React.FC = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
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

  const [kycStatus, setKycStatus] = useState<string>('');
  const [kycStatusLoading, setKycStatusLoading] = useState<boolean>(false);
  const [kycStatusMessage, setKycStatusMessage] = useState<string>('');

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
      console.log("Fetching NDA metadata...");
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
          console.log("Metadata fetched successfully");
          metadataFetchedRef.current = true;
        }
        
        if (metadata && ndaStatus === "Pending: Waiting for NDA Process") {
          setShowNdaDocModal(true);
        }
      } else {
        if (ndaStatus === "Pending: Waiting for NDA Process") {
          toast({
            title: "Error",
            description: ndaResponse.data.message || "Error fetching NDA metadata.",
            status: "error",
            duration: 4000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      metadataFetchedRef.current = false;
      toast({
        title: "Error",
        description: "Failed to fetch NDA metadata.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsMetadataLoading(false);
    }
  };

  useEffect(() => {
    if (ndaStatus !== "Pending: Waiting for NDA Process") {
      metadataFetchedRef.current = false;
    }
  }, [ndaStatus]);

  const handleDownloadNda = async () => {
    const FETCH_NDA_URL =
      "https://hushhtech-nda-generation-53407187172.us-central1.run.app/fetch-nda";
    
    const loadingToastId = toast({
      title: "Preparing Download",
      description: "Generating your NDA document for download, please wait...",
      status: "loading",
      duration: null,
      isClosable: false,
    });
    
    try {
      console.log("Fetching NDA document for download...");
      const response = await axios.get(FETCH_NDA_URL, {
        headers: {
          "jwt-token": session.access_token,
        },
        responseType: "blob",
      });
      
      toast.close(loadingToastId);
      
      if (response.status === 200) {
        toast({
          title: "Download Ready",
          description: "Your NDA document is ready to download.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "NDA.pdf");
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        
        window.URL.revokeObjectURL(url);
      } else {
        toast({
          title: "Download Error",
          description: "Unexpected response code: " + response.status,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      toast.close(loadingToastId);
      
      console.error("Error downloading NDA:", error);
      toast({
        title: "Download Error",
        description: "Failed to download NDA. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const getNdaButtonProps = () => {
    if (ndaStatus === "Approved") {
      return { text: "Download Your NDA", disabled: false, bgClass: "blue-gradient-bg" };
    } else if (ndaStatus === "Not Applied") {
      return { text: "Start NDA Process", disabled: false, bgClass: "blue-gradient-bg" };
    } else if (ndaStatus === "Requested permission for the sensitive file." || ndaStatus === "Pending") {
      return { text: "Waiting for approval", disabled: true, bgClass: "" };
    } else if (ndaStatus === "Pending: Waiting for NDA Process") {
      return { text: "Sign NDA Document", disabled: false, bgClass: "blue-gradient-bg" };
    } else if (ndaStatus === "Rejected") {
      return { text: "Re-apply for NDA Process", disabled: false, bgClass: "blue-gradient-bg" };
    }
    return { text: "Start NDA Process", disabled: false, bgClass: "blue-gradient-bg" };
  };

  const { text: ndaButtonText, disabled: ndaButtonDisabled } = getNdaButtonProps();

  const handleNdaAccepted = () => {
    setNdaStatus("Approved");
    setNdaApproved(true);
  };

  const handleStartNdaProcess = () => {
    if (ndaStatus === "Approved") {
      handleDownloadNda();
      return;
    } else if (ndaStatus === "Not Applied" || ndaStatus === "Rejected") {
      navigate("/nda-form");
    } else if (ndaStatus === "Pending: Waiting for NDA Process") {
      if (ndaMetadata) {
        setShowNdaDocModal(true);
      } else {
        fetchNdaMetadata();
      }
    }
  };

  const handleViewPublicDocs = () => {
    localStorage.setItem("communityFilter", "all");
    navigate("/community");
  };

  const handleViewPrivateDocs = () => {
    if (ndaStatus === "Approved") {
      localStorage.setItem("communityFilter", "nda");
      navigate("/community");
    }
  };

  const getStatusIndicator = (status: string) => {
    if (status === "Not Started") {
      return (
        <Badge px={3} py={1} bg="gray.600" color="white" borderRadius="full" fontSize="xs">
          Not Started
        </Badge>
      );
    } else if (status === "Coming Soon") {
      return (
        <Badge px={3} py={1} bg="blue.900" color="blue.300" borderRadius="full" fontSize="xs">
          Coming Soon
        </Badge>
      );
    }
    return null;
  };

  useEffect(() => {
    async function fetchKycStatus() {
      if (!session?.user?.email) return;
      setKycStatusLoading(true);
      try {
        const response = await fetch(`https://hushh-techh.onrender.com/api/admin/kyc-verification-status/${session.user.email}`);
        const data = await response.json();
        setKycStatus(data.status || 'Not Applied');
        setKycStatusMessage(data.message || '');
      } catch (error) {
        setKycStatus('Not Applied');
        setKycStatusMessage('');
      } finally {
        setKycStatusLoading(false);
      }
    }
    fetchKycStatus();
    const intervalId = setInterval(() => {
      fetchKycStatus();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [session?.user?.email]);

  return (
    <Box
      bg="#F5F5F7"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={{ base: 4, sm: 6 }}
      py={{ base: 8, md: 12 }}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif' }}
    >
      <MotionBox
        maxW="420px"
        w="100%"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Logo */}
        <MotionBox 
          display="flex" 
          justifyContent="center" 
          mb={6}
          variants={logoVariants}
        >
          <Image
            src={HushhLogo}
            alt="Hushh Logo"
            h={{ base: "100px", md: "120px" }}
            objectFit="contain"
          />
        </MotionBox>

        {/* Header */}
        <MotionBox textAlign="center" mb={6} variants={itemVariants}>
          <Text
            fontSize={{ base: "32px", md: "36px" }}
            fontWeight="600"
            color="#1D1D1F"
            lineHeight="1.12"
            letterSpacing="-0.015em"
            mb={3}
          >
            Investing in the Future.
          </Text>
          <Text
            fontSize={{ base: "16px", md: "17px" }}
            color="#515154"
            lineHeight="1.5"
            maxW="340px"
            mx="auto"
          >
            The AI-Powered Berkshire Hathaway. We combine AI and human expertise to invest in exceptional businesses for long-term value creation.
          </Text>
        </MotionBox>

        {/* Main Card */}
        <MotionBox
          bg="white"
          borderRadius="24px"
          p={6}
          boxShadow="0 2px 20px rgba(0,0,0,0.06)"
          variants={cardVariants}
        >
          {/* CTA Buttons */}
          <VStack spacing={3}>
            <MotionButton
              onClick={() => {
                if (onboardingStatus.hasProfile) {
                  navigate("/hushh-user-profile");
                } else if (onboardingStatus.isCompleted) {
                  navigate("/hushh-user-profile");
                } else {
                  const step = onboardingStatus.currentStep;
                  navigate(`/onboarding/step-${step}`);
                }
              }}
              w="100%"
              h="52px"
              borderRadius="14px"
              bg="linear-gradient(135deg, #00A9E0 0%, #6DD3EF 100%)"
              bgGradient="linear(135deg, #00A9E0 0%, #6DD3EF 100%)"
              color="white"
              fontSize="16px"
              fontWeight="500"
              isLoading={onboardingStatus.loading}
              loadingText="Loading..."
              _hover={{ 
                bgGradient: "linear(135deg, #00A9E0 0%, #6DD3EF 100%)",
                transform: "scale(1.02)"
              }}
              _active={{
                transform: "scale(0.98)",
                bgGradient: "linear(135deg, #0097CB 0%, #5FC3E5 100%)",
              }}
              transition="all 0.2s ease"
              boxShadow="0 4px 14px rgba(0, 169, 224, 0.35)"
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              {onboardingStatus.loading 
                ? "Loading..." 
                : onboardingStatus.hasProfile || onboardingStatus.isCompleted
                  ? "View Your Profile"
                  : onboardingStatus.currentStep > 1
                    ? `Continue Onboarding (Step ${onboardingStatus.currentStep})`
                    : "Complete your hushh profile"
              }
            </MotionButton>

            <MotionButton
              onClick={() => navigate("/discover-fund-a")}
              w="100%"
              h="52px"
              borderRadius="14px"
              bg="white"
              borderColor="#E5E7EB"
              borderWidth="1px"
              color="#1D1D1F"
              fontSize="16px"
              fontWeight="500"
              _hover={{ 
                bg: "#F9FAFB",
                transform: "scale(1.02)"
              }}
              _active={{ 
                bg: "#F3F4F6",
                transform: "scale(0.98)"
              }}
              transition="all 0.2s ease"
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Discover Fund A
            </MotionButton>
          </VStack>
        </MotionBox>

        {/* Footer */}
        <MotionBox
          textAlign="center"
          mt={6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Text
            fontSize="12px"
            color="#8E8E93"
          >
            Secure. Private. AI-Powered.
          </Text>
        </MotionBox>
      </MotionBox>

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
