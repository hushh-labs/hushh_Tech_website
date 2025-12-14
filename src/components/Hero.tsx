import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Text, Box, Container, VStack, Image } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import config from "../resources/config/config";
import ProfilePage from "./profile/profilePage";
import WhyChooseSection from "./WhyChooseSection";
import { Session } from "@supabase/supabase-js";
import HushhLogo from "./images/Hushhogo.png";

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
          {/* Hero Section - Apple-like design */}
          <Box
            bg={tokens.bg}
            minH="100vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={{ base: "24px", sm: "32px" }}
            py={{ base: "48px", md: "64px" }}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}
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
                mb={{ base: 6, md: 8 }}
                variants={logoVariants}
              >
                <Image
                  src={HushhLogo}
                  alt="Hushh Logo"
                  h={{ base: "72px", md: "88px" }}
                  objectFit="contain"
                />
              </MotionBox>

              {/* Eyebrow - Apple style */}
              <MotionBox textAlign="center" mb={3} variants={itemVariants}>
                <Text
                  fontSize="12px"
                  color={tokens.textMuted}
                  fontWeight="600"
                  letterSpacing="0.12em"
                  textTransform="uppercase"
                >
                  {t('hero.eyebrow')}
                </Text>
              </MotionBox>

              {/* Main Heading - Apple typography */}
              <MotionBox textAlign="center" mb={4} variants={itemVariants}>
                <Text
                  fontSize={{ base: "36px", md: "44px" }}
                  fontWeight="600"
                  color={tokens.textPrimary}
                  lineHeight="1.08"
                  letterSpacing="-0.015em"
                >
                  {t('hero.mainTitle')}
                </Text>
              </MotionBox>

              {/* Subheading - Generous line height */}
              <MotionBox textAlign="center" mb={{ base: 8, md: 10 }} variants={itemVariants}>
                <Text
                  fontSize={{ base: "17px", md: "19px" }}
                  color={tokens.textSecondary}
                  lineHeight="1.55"
                  fontWeight="400"
                  maxW="380px"
                  mx="auto"
                >
                  {t('hero.mainSubtitle')}
                </Text>
              </MotionBox>

              {/* CTA Buttons - No card, direct buttons Apple style */}
              <MotionBox variants={itemVariants}>
                <VStack spacing={3}>
                  <MotionButton
                    onClick={() => navigate("/discover-fund-a")}
                    w="100%"
                    h="50px"
                    borderRadius="full"
                    bgGradient={`linear(135deg, ${tokens.gradientStart} 0%, ${tokens.gradientEnd} 100%)`}
                    color="white"
                    fontSize="17px"
                    fontWeight="600"
                    _hover={{ 
                      bgGradient: `linear(135deg, ${tokens.gradientStart} 0%, ${tokens.gradientEnd} 100%)`,
                    }}
                    _active={{
                      transform: "scale(0.98)",
                    }}
                    boxShadow={`0 14px 24px rgba(0, 169, 224, 0.25)`}
                    variants={buttonHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {t('hero.discoverFundA')}
                  </MotionButton>

                  <MotionButton
                    onClick={() => navigate("/investor-profile")}
                    w="100%"
                    h="50px"
                    borderRadius="full"
                    bg="transparent"
                    border="1px solid"
                    borderColor={tokens.separator}
                    color={tokens.textPrimary}
                    fontSize="17px"
                    fontWeight="600"
                    _hover={{ 
                      bg: "rgba(0,0,0,0.02)",
                    }}
                    _active={{ 
                      bg: "rgba(0,0,0,0.04)",
                    }}
                    variants={buttonHoverVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {t('hero.becomeInvestor')}
                  </MotionButton>
                </VStack>
              </MotionBox>

              {/* Footer Text */}
              <MotionBox
                textAlign="center"
                mt={{ base: 8, md: 10 }}
                variants={itemVariants}
              >
                <Text
                  fontSize="13px"
                  color={tokens.textMuted}
                  fontWeight="400"
                >
                  Secure · Private · AI-Powered
                </Text>
              </MotionBox>
            </MotionBox>
          </Box>
        </>
      ) : (
        <ProfilePage />
      )}
      
      <WhyChooseSection />
      
      {/* Fund A Section - Apple-like design */}
      <Box 
        bg={tokens.bg}
        pt={{ base: "48px", md: "64px" }} 
        pb={{ base: "48px", md: "64px" }} 
        px={{ base: "24px", sm: "32px" }}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}
      >
        <Container maxW="540px" px={0}>
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={containerVariants}
          >
            {/* Section Label - Eyebrow */}
            <MotionBox textAlign="center" mb={3} variants={itemVariants}>
              <Text
                fontSize="12px"
                letterSpacing="0.12em"
                fontWeight="600"
                color={tokens.textMuted}
                textTransform="uppercase"
              >
                {t('hero.investorProfileLabel')}
              </Text>
            </MotionBox>

            {/* Section Title */}
            <MotionBox textAlign="center" mb={4} variants={itemVariants}>
              <Text
                fontSize={{ base: "32px", md: "40px" }}
                fontWeight="600"
                color={tokens.textPrimary}
                lineHeight="1.08"
                letterSpacing="-0.015em"
              >
                {t('hero.fundATitle')}
              </Text>
            </MotionBox>

            {/* Section Description */}
            <MotionBox textAlign="center" mb={{ base: 8, md: 10 }} variants={itemVariants}>
              <Text
                fontSize={{ base: "17px", md: "18px" }}
                color={tokens.textSecondary}
                lineHeight="1.55"
                fontWeight="400"
                maxW="460px"
                mx="auto"
              >
                {t('hero.fundADescription')}
              </Text>
            </MotionBox>

            {/* Key Points - Simple stacked statements */}
            <MotionBox 
              variants={itemVariants}
              mb={{ base: 8, md: 10 }}
            >
              <VStack align="start" spacing={5} maxW="460px" mx="auto">
                {/* Point 1 */}
                <Box>
                  <Text fontSize="18px" fontWeight="500" color={tokens.textPrimary} lineHeight="1.4" mb={1}>
                    {t('hero.targetingIRR')} <Text as="span" fontWeight="600">{t('hero.netIRR')}</Text>* {t('hero.withOur')}{" "}
                    <Text 
                      as="a"
                      href="/sell-the-wall"
                      display="inline"
                      color={tokens.accent}
                      textDecoration="none"
                      cursor="pointer"
                      _hover={{
                        textDecoration: "underline"
                      }}
                    >
                      "{t('hero.sellTheWall')}"
                    </Text>
                    {" "}{t('hero.approach')}
                  </Text>
                </Box>

                {/* Point 2 */}
                <Text fontSize="17px" color={tokens.textSecondary} lineHeight="1.55">
                  {t('hero.aiFirstInvesting')}
                </Text>

                {/* Point 3 */}
                <Text fontSize="17px" color={tokens.textSecondary} lineHeight="1.55">
                  {t('hero.provenRiskFramework')}
                </Text>
              </VStack>
            </MotionBox>

            {/* Stats - Two-up layout with thin divider */}
            <MotionBox variants={itemVariants} mb={{ base: 6, md: 8 }}>
              <Box 
                display="flex" 
                justifyContent="center"
                gap={{ base: 8, md: 12 }}
                pt={6}
                borderTop="1px solid"
                borderColor={tokens.separator}
                maxW="360px"
                mx="auto"
              >
                <Box textAlign="center">
                  <Text fontSize="11px" letterSpacing="0.12em" fontWeight="600" color={tokens.textMuted} textTransform="uppercase" mb={2}>
                    {t('hero.targetNetIRR')}
                  </Text>
                  <Text fontSize={{ base: "28px", md: "32px" }} fontWeight="700" color={tokens.textPrimary}>
                    18-23%
                  </Text>
                </Box>
                <Box 
                  w="1px" 
                  bg={tokens.separator} 
                  opacity={0.6}
                  alignSelf="stretch"
                />
                <Box textAlign="center">
                  <Text fontSize="11px" letterSpacing="0.12em" fontWeight="600" color={tokens.textMuted} textTransform="uppercase" mb={2}>
                    {t('hero.inception')}
                  </Text>
                  <Text fontSize={{ base: "28px", md: "32px" }} fontWeight="700" color={tokens.textPrimary}>
                    2024
                  </Text>
                </Box>
              </Box>
            </MotionBox>

            {/* Disclaimer */}
            <Text
              fontSize="12px"
              color={tokens.textMuted}
              fontStyle="italic"
              mb={6}
              textAlign="center"
              lineHeight="1.5"
              maxW="420px"
              mx="auto"
            >
              {t('hero.disclaimer')}
            </Text>

            {/* CTA Button - Pill style */}
            <MotionBox variants={itemVariants}>
              <MotionButton
                onClick={() => navigate("/discover-fund-a")}
                w="100%"
                maxW="320px"
                h="50px"
                borderRadius="full"
                bgGradient={`linear(135deg, ${tokens.gradientStart} 0%, ${tokens.gradientEnd} 100%)`}
                color="white"
                fontSize="17px"
                fontWeight="600"
                mx="auto"
                display="block"
                _hover={{ 
                  bgGradient: `linear(135deg, ${tokens.gradientStart} 0%, ${tokens.gradientEnd} 100%)`,
                }}
                _active={{
                  transform: "scale(0.98)",
                }}
                boxShadow={`0 14px 24px rgba(0, 169, 224, 0.25)`}
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                {t('hero.learnMoreFundA')}
              </MotionButton>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>
      
      {/* Ready to Transform Section - Apple-like design */}
      <Box
        bg={tokens.surface}
        pt={{ base: "48px", md: "64px" }}
        pb={{ base: "48px", md: "64px" }}
        px={{ base: "24px", sm: "32px" }}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}
      >
        <Container maxW="480px" px={0}>
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={containerVariants}
            textAlign="center"
          >
            {/* Section Title */}
            <MotionBox mb={4} variants={itemVariants}>
              <Text
                fontSize={{ base: "32px", md: "40px" }}
                fontWeight="600"
                color={tokens.textPrimary}
                lineHeight="1.08"
                letterSpacing="-0.015em"
              >
                {t('hero.readyToTransform')}
              </Text>
            </MotionBox>

            {/* Section Description */}
            <MotionBox mb={{ base: 8, md: 10 }} variants={itemVariants}>
              <Text
                fontSize={{ base: "17px", md: "18px" }}
                color={tokens.textSecondary}
                lineHeight="1.55"
                fontWeight="400"
                maxW="380px"
                mx="auto"
              >
                {t('hero.joinInvestors')}
              </Text>
            </MotionBox>

            {/* CTA Buttons */}
            <MotionBox variants={itemVariants}>
              <VStack spacing={3} maxW="320px" mx="auto">
                <MotionButton
                  onClick={() => navigate("/about")}
                  w="100%"
                  h="50px"
                  borderRadius="full"
                  bgGradient={`linear(135deg, ${tokens.gradientStart} 0%, ${tokens.gradientEnd} 100%)`}
                  color="white"
                  fontSize="17px"
                  fontWeight="600"
                  _hover={{ 
                    bgGradient: `linear(135deg, ${tokens.gradientStart} 0%, ${tokens.gradientEnd} 100%)`,
                  }}
                  _active={{
                    transform: "scale(0.98)",
                  }}
                  boxShadow={`0 14px 24px rgba(0, 169, 224, 0.25)`}
                  variants={buttonHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  {t('hero.learnAboutMission')}
                </MotionButton>

                <MotionButton
                  onClick={() => navigate("/contact")}
                  w="100%"
                  h="50px"
                  borderRadius="full"
                  bg="transparent"
                  border="1px solid"
                  borderColor={tokens.separator}
                  color={tokens.textPrimary}
                  fontSize="17px"
                  fontWeight="600"
                  _hover={{ 
                    bg: "rgba(0,0,0,0.02)",
                  }}
                  _active={{ 
                    bg: "rgba(0,0,0,0.04)",
                  }}
                  variants={buttonHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  {t('hero.contactUsToday')}
                </MotionButton>
              </VStack>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>
    </>
  );
}
