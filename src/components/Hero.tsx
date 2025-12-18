import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Text, Box, Container, VStack, Image, Flex, Icon, SimpleGrid } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import config from "../resources/config/config";
import ProfilePage from "./profile/profilePage";
import WhyChooseSection from "./WhyChooseSection";
import { Session } from "@supabase/supabase-js";
import HushhLogo from "./images/Hushhogo.png";
import { FaRobot, FaShieldAlt, FaChartLine, FaRocket } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsGrid3X3Gap } from "react-icons/bs";
import { MdVerifiedUser, MdTrendingUp } from "react-icons/md";

// Motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Apple-like smooth animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
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

// Apple Design Tokens
const tokens = {
  bg: "#F5F5F7",
  surface: "#FFFFFF",
  textPrimary: "#1D1D1F",
  textSecondary: "#515154",
  textMuted: "#8E8E93",
  accent: "#0A84FF",
  gradientStart: "#00A9E0",
  gradientEnd: "#6DD3EF",
  separator: "#E5E5EA",
};

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    if (config.supabaseClient) {
      config.supabaseClient.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const { data: { subscription } } = config.supabaseClient.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription?.unsubscribe();
    }
  }, []);

  return (
    <>
      {!session ? (
        <>
          {/* Hero Section - With Fixed Bottom Bar */}
          <Box
            bg="#f6f6f8"
            position="relative"
            minH="100vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {/* Mobile Container */}
            <Box
              position="relative"
              display="flex"
              minH="100vh"
              w="100%"
              maxW="500px"
              flexDirection="column"
              bg="white"
              mx="auto"
              borderX="1px solid"
              borderColor="#f1f5f9"
            >
              {/* Main Content Area - Scrollable */}
              <Box
                as="main"
                display="flex"
                flexDirection="column"
                alignItems="center"
                px={6}
                pt={{ base: "100px", md: "120px" }} /* Space below header/navbar */
                flex="1"
                pb={6}
              >
                <MotionBox
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  w="100%"
                >
                  {/* Logo - With soft halo blur effect */}
                  <MotionBox 
                    display="flex" 
                    justifyContent="center"
                    alignItems="center"
                    mb={8}
                    variants={logoVariants}
                    position="relative"
                  >
                    {/* Blur background effect */}
                    <Box
                      position="absolute"
                      w="128px"
                      h="128px"
                      bg="rgba(19, 91, 236, 0.1)"
                      borderRadius="full"
                      filter="blur(24px)"
                    />
                    {/* Logo container with soft-halo shadow */}
                    <Flex
                      position="relative"
                      zIndex={10}
                      w="96px"
                      h="96px"
                      bg="white"
                      borderRadius="full"
                      align="center"
                      justify="center"
                      boxShadow="0 0 40px 0 rgba(19, 91, 236, 0.15)"
                      border="1px solid"
                      borderColor="#f1f5f9"
                    >
                      <Image
                        src={HushhLogo}
                        alt="Hushh brand logo"
                        w="48px"
                        h="48px"
                        objectFit="contain"
                      />
                    </Flex>
                  </MotionBox>

                  {/* Main Heading - Exact typography */}
                  <MotionBox mb={4} variants={itemVariants}>
                    <Text
                      fontSize={{ base: "32px", md: "36px" }}
                      fontWeight="800"
                      color="#111318"
                      lineHeight="1.15"
                      letterSpacing="tight"
                      textAlign="center"
                    >
                      Investing in the Future.
                    </Text>
                  </MotionBox>

                  {/* Subheading - Controlled width */}
                  <MotionBox mb={10} variants={itemVariants}>
                    <Text
                      fontSize="16px"
                      color="#64748b"
                      lineHeight="relaxed"
                      fontWeight="500"
                      maxW="320px"
                      textAlign="center"
                    >
                      The AI-Powered Berkshire Hathaway. We combine AI and human expertise to invest in exceptional businesses for long-term value creation.
                    </Text>
                  </MotionBox>
                </MotionBox>
              </Box>

              {/* CTA Section - Scrollable, not fixed */}
              <Box
                w="100%"
                display="flex"
                flexDirection="column"
                alignItems="center"
                bg="white"
                px={6}
                pt={5}
                pb={8}
                borderTop="1px solid"
                borderColor="#f1f5f9"
              >
                {/* CTA Card - Soft elevated shadow */}
                <Box
                  w="100%"
                  bg="white"
                  borderRadius="2xl"
                  p={5}
                  border="1px solid"
                  borderColor="#f8fafc"
                  boxShadow="0 12px 36px -4px rgba(0, 0, 0, 0.08)"
                >
                  <VStack spacing={3}>
                    {/* Primary Button - Rounded full, primary color */}
                    <MotionButton
                      onClick={() => navigate("/investor-profile")}
                      w="100%"
                      h="48px"
                      borderRadius="full"
                      bg="#135bec"
                      color="white"
                      fontSize="16px"
                      fontWeight="700"
                      letterSpacing="0.015em"
                      _hover={{ 
                        bg: "#1d4ed8",
                      }}
                      _active={{
                        transform: "scale(0.98)",
                      }}
                      boxShadow="0 10px 25px rgba(59, 130, 246, 0.2)"
                      variants={buttonHoverVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Complete Your Hushh Profile
                    </MotionButton>

                    {/* Secondary Button - Outlined with primary border */}
                    <MotionButton
                      onClick={() => navigate("/discover-fund-a")}
                      w="100%"
                      h="48px"
                      borderRadius="full"
                      bg="transparent"
                      border="1px solid"
                      borderColor="#e2e8f0"
                      color="#111318"
                      fontSize="16px"
                      fontWeight="700"
                      letterSpacing="0.015em"
                      _hover={{ 
                        bg: "rgba(0, 0, 0, 0.02)",
                      }}
                      _active={{ 
                        bg: "rgba(0, 0, 0, 0.04)",
                      }}
                      variants={buttonHoverVariants}
                      initial="rest"
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Discover Fund A
                    </MotionButton>
                  </VStack>
                </Box>

                {/* Trust Tagline */}
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color="#94a3b8"
                  textAlign="center"
                  mt={5}
                  mb={3}
                >
                  Secure. Private. AI-Powered.
                </Text>

                {/* Trust Badges - Encrypted & SOC 2 */}
                <Flex justify="center" align="center" gap={5}>
                  {/* Encrypted Badge */}
                  <Flex align="center" gap={2}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#22c55e" />
                    <Text fontSize="13px" fontWeight="600" color="#64748b">
                      Encrypted
                    </Text>
                  </Flex>

                  {/* SOC 2 Badge */}
                  <Flex align="center" gap={2}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#22c55e" />
                    <Text fontSize="13px" fontWeight="600" color="#64748b">
                      SOC 2
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <ProfilePage />
      )}
      
      <WhyChooseSection />
      
      {/* Fund A Section - Exact HTML Template Match */}
      <Box 
        bg="white"
        pt={{ base: "24px", md: "32px" }} 
        pb={{ base: "32px", md: "40px" }} 
        px={6}
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <Container maxW="500px" px={0}>
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={containerVariants}
          >
            {/* Section Label - Eyebrow */}
            <MotionBox textAlign="center" pt={6} pb={2} variants={itemVariants}>
              <Text
                fontSize="12px"
                letterSpacing="0.1em"
                fontWeight="700"
                color="#617589"
                textTransform="uppercase"
              >
                Investor Profile
              </Text>
            </MotionBox>

            {/* Section Title */}
            <MotionBox textAlign="center" pb={4} variants={itemVariants}>
              <Text
                fontSize="32px"
                fontWeight="800"
                color="#111418"
                lineHeight="tight"
                letterSpacing="tight"
              >
                Fund A
              </Text>
            </MotionBox>

            {/* Section Description */}
            <MotionBox textAlign="center" pb={8} variants={itemVariants}>
              <Text
                fontSize="16px"
                color="#111418"
                lineHeight="relaxed"
                fontWeight="500"
                maxW="340px"
                mx="auto"
                opacity={0.8}
              >
                Our flagship growth fund focusing on diversified assets across emerging tech sectors. Designed for long-term capital appreciation.
              </Text>
            </MotionBox>

            {/* Targeting IRR Banner - Exact match with larger text */}
            <MotionBox variants={itemVariants} mb={8}>
              <Flex
                w="100%"
                bg="rgba(43, 140, 238, 0.1)"
                p={{ base: 6, sm: 8 }}
                borderRadius="xl"
                flexDirection="column"
                align="center"
                justify="center"
              >
                <Text
                  fontSize={{ base: "32px", sm: "40px" }}
                  fontWeight="800"
                  color="#111418"
                  textAlign="center"
                  lineHeight="tight"
                  letterSpacing="-0.02em"
                >
                  Targeting{" "}
                  <Text as="span" color="#2b8cee">
                    18–23%
                  </Text>{" "}
                  net IRR*
                </Text>
              </Flex>
            </MotionBox>

            {/* 2x2 Staggered Feature Cards Grid - Exact match */}
            <MotionBox variants={itemVariants} pb={8}>
              <SimpleGrid columns={2} spacingX={4} spacingY={6}>
                {/* High Growth Card */}
                <Flex
                  flexDirection="column"
                  align="flex-start"
                  p={4}
                  borderRadius="lg"
                  bg="#f9fafb"
                  border="1px solid transparent"
                >
                  <Icon as={MdTrendingUp} boxSize="32px" color="#2b8cee" mb={2} />
                  <Text fontSize="15px" fontWeight="700" color="#1f2937" textAlign="left">
                    High Growth
                  </Text>
                </Flex>

                {/* Diversified Card - Staggered with mt-6 */}
                <Flex
                  flexDirection="column"
                  align="flex-start"
                  p={4}
                  borderRadius="lg"
                  bg="#f9fafb"
                  border="1px solid transparent"
                  mt={6}
                >
                  <Icon as={BsGrid3X3Gap} boxSize="32px" color="#2b8cee" mb={2} />
                  <Text fontSize="15px" fontWeight="700" color="#1f2937" textAlign="left">
                    Diversified
                  </Text>
                </Flex>

                {/* Secure Assets Card */}
                <Flex
                  flexDirection="column"
                  align="flex-start"
                  p={4}
                  borderRadius="lg"
                  bg="#f9fafb"
                  border="1px solid transparent"
                >
                  <Icon as={MdVerifiedUser} boxSize="32px" color="#2b8cee" mb={2} />
                  <Text fontSize="15px" fontWeight="700" color="#1f2937" textAlign="left">
                    Secure Assets
                  </Text>
                </Flex>

                {/* Emerging Tech Card - Staggered with mt-6 */}
                <Flex
                  flexDirection="column"
                  align="flex-start"
                  p={4}
                  borderRadius="lg"
                  bg="#f9fafb"
                  border="1px solid transparent"
                  mt={6}
                >
                  <Icon as={FaRocket} boxSize="32px" color="#2b8cee" mb={2} />
                  <Text fontSize="15px" fontWeight="700" color="#1f2937" textAlign="left">
                    Emerging Tech
                  </Text>
                </Flex>
              </SimpleGrid>
            </MotionBox>

            {/* Stats - Stacked vertically like HTML template */}
            <MotionBox variants={itemVariants} mb={8}>
              <VStack spacing={4} w="100%">
                {/* Target Net IRR Card */}
                <Flex 
                  w="100%"
                  py={5}
                  px={2}
                  bg="white"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="#f3f4f6"
                  boxShadow="sm"
                  flexDirection="column"
                  align="center"
                  role="group"
                  sx={{
                    transition: "all 0.2s ease",
                  }}
                  _hover={{
                    "& p:first-of-type": {
                      color: "#2b8cee"
                    }
                  }}
                >
                  <Text 
                    fontSize="10px" 
                    letterSpacing="0.1em" 
                    fontWeight="700" 
                    color="#617589" 
                    textTransform="uppercase" 
                    mb={1.5}
                    transition="color 0.2s ease"
                  >
                    Target Net IRR
                  </Text>
                  <Text fontSize={{ base: "24px", sm: "30px" }} fontWeight="700" color="#111418" letterSpacing="tight">
                    18-23%
                  </Text>
                </Flex>
                
                {/* Inception Card */}
                <Flex 
                  w="100%"
                  py={5}
                  px={2}
                  bg="white"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="#f3f4f6"
                  boxShadow="sm"
                  flexDirection="column"
                  align="center"
                  role="group"
                  sx={{
                    transition: "all 0.2s ease",
                  }}
                  _hover={{
                    "& p:first-of-type": {
                      color: "#2b8cee"
                    }
                  }}
                >
                  <Text 
                    fontSize="10px" 
                    letterSpacing="0.1em" 
                    fontWeight="700" 
                    color="#617589" 
                    textTransform="uppercase" 
                    mb={1.5}
                    transition="color 0.2s ease"
                  >
                    Inception
                  </Text>
                  <Text fontSize={{ base: "24px", sm: "30px" }} fontWeight="700" color="#111418" letterSpacing="tight">
                    2024
                  </Text>
                </Flex>
              </VStack>
            </MotionBox>

            {/* Disclaimer */}
            <Text
              fontSize="11px"
              color="#9ca3af"
              fontWeight="500"
              mb={6}
              textAlign="center"
              lineHeight="snug"
              px={4}
            >
              *Past performance is not indicative of future results. Investment involves risk including possible loss of principal.
            </Text>

            {/* CTA Button - Exact match */}
            <MotionBox variants={itemVariants} w="100%">
              <MotionButton
                onClick={() => navigate("/discover-fund-a")}
                w="100%"
                h="48px"
                borderRadius="lg"
                bg="#2b8cee"
                color="white"
                fontSize="16px"
                fontWeight="700"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ 
                  bg: "#2563eb",
                }}
                _active={{
                  bg: "#1d4ed8",
                  transform: "scale(0.98)",
                }}
                boxShadow="0 10px 25px rgba(43, 140, 238, 0.25)"
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Learn More About Fund A
              </MotionButton>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>
      
      {/* Mission CTA Section - Exact HTML Template Match */}
      <Box
        bg="white"
        position="relative"
        minH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        overflow="hidden"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {/* CTA Card Container - Exact match to HTML template */}
        <Box
          w="100%"
          maxW="400px"
          bg="white"
          borderRadius="32px"
          border="1px solid"
          borderColor="#e5e7eb"
          boxShadow="0 10px 40px -10px rgba(0,0,0,0.08)"
          p={6}
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
          gap={8}
          position="relative"
          zIndex={10}
        >
          {/* Content Group */}
          <VStack spacing={6} w="100%">
            {/* Chips - Stacked vertical pill list layout */}
            <VStack spacing={2} w="100%" align="center">
              {/* Verified Fund Chip */}
              <Flex
                h="32px"
                w="fit-content"
                shrink={0}
                align="center"
                justify="center"
                gap={2}
                borderRadius="full"
                bg="#f0f2f4"
                px={4}
                transition="all 0.2s"
              >
                <Icon as={MdVerifiedUser} boxSize="18px" color="#2b8cee" />
                <Text
                  color="#111418"
                  fontSize="12px"
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  lineHeight="normal"
                >
                  Verified Fund
                </Text>
              </Flex>
              
              {/* Top Rated Performance Chip */}
              <Flex
                h="32px"
                w="fit-content"
                shrink={0}
                align="center"
                justify="center"
                gap={2}
                borderRadius="full"
                bg="#f0f2f4"
                px={4}
                transition="all 0.2s"
              >
                <Icon as={MdTrendingUp} boxSize="18px" color="#2b8cee" />
                <Text
                  color="#111418"
                  fontSize="12px"
                  fontWeight="600"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  lineHeight="normal"
                >
                  Top Rated Performance
                </Text>
              </Flex>
            </VStack>
            
            {/* Text Content */}
            <VStack spacing={3}>
              <Text
                color="#111418"
                letterSpacing="tight"
                fontSize="28px"
                fontWeight="800"
                lineHeight="1.2"
              >
                Join the Future of Investing
              </Text>
              <Text
                color="#637588"
                fontSize="16px"
                fontWeight="500"
                lineHeight="relaxed"
                maxW="320px"
                mx="auto"
              >
                Secure your financial freedom with Hushh Fund A today. Experience low-risk growth tailored for you.
              </Text>
            </VStack>
          </VStack>
          
          {/* Button Group */}
          <VStack spacing={3} w="100%" mt={2}>
            {/* Primary CTA */}
            <MotionButton
              onClick={() => navigate("/investor-profile")}
              w="100%"
              h="56px"
              borderRadius="full"
              bg="#2b8cee"
              color="white"
              fontSize="16px"
              fontWeight="700"
              letterSpacing="0.015em"
              overflow="hidden"
              _hover={{ 
                bg: "#2b8cee",
                opacity: 0.9,
              }}
              _active={{
                transform: "scale(0.98)",
              }}
              boxShadow="0 10px 25px rgba(43, 140, 238, 0.25)"
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Get Started Now
            </MotionButton>

            {/* Secondary CTA */}
            <MotionButton
              onClick={() => navigate("/discover-fund-a")}
              w="100%"
              h="56px"
              borderRadius="full"
              bg="transparent"
              border="2px solid"
              borderColor="#2b8cee"
              color="#2b8cee"
              fontSize="16px"
              fontWeight="700"
              letterSpacing="0.015em"
              overflow="hidden"
              _hover={{ 
                bg: "rgba(43, 140, 238, 0.05)",
              }}
              _active={{ 
                transform: "scale(0.98)",
              }}
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Learn More
            </MotionButton>
          </VStack>
        </Box>
      </Box>
    </>
  );
}
