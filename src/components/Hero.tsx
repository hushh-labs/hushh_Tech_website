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
const MotionText = motion(Text);

// Apple-like smooth animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
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

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.2,
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
              maxW="480px"
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
                  h={{ base: "80px", md: "100px" }}
                  objectFit="contain"
                />
              </MotionBox>

              {/* Eyebrow */}
              <MotionBox textAlign="center" mb={2} variants={itemVariants}>
                <Text
                  fontSize="14px"
                  color="#8E8E93"
                  fontWeight="500"
                  letterSpacing="0.02em"
                >
                  {t('hero.eyebrow')}
                </Text>
              </MotionBox>

              {/* Main Heading */}
              <MotionBox textAlign="center" mb={4} variants={itemVariants}>
                <Text
                  fontSize={{ base: "38px", md: "44px" }}
                  fontWeight="600"
                  color="#1D1D1F"
                  lineHeight="1.08"
                  letterSpacing="-0.02em"
                >
                  {t('hero.mainTitle')}
                </Text>
              </MotionBox>

              {/* Subheading */}
              <MotionBox textAlign="center" mb={8} variants={itemVariants}>
                <Text
                  fontSize={{ base: "17px", md: "19px" }}
                  color="#515154"
                  lineHeight="1.5"
                  maxW="400px"
                  mx="auto"
                >
                  {t('hero.mainSubtitle')}
                </Text>
              </MotionBox>

              {/* Main Card with CTA Buttons */}
              <MotionBox
                bg="white"
                borderRadius="24px"
                p={6}
                boxShadow="0 2px 20px rgba(0,0,0,0.06)"
                variants={cardVariants}
              >
                <VStack spacing={3}>
                  <MotionButton
                    onClick={() => navigate("/discover-fund-a")}
                    w="100%"
                    h="54px"
                    borderRadius="14px"
                    bgGradient="linear(135deg, #00A9E0 0%, #6DD3EF 100%)"
                    color="white"
                    fontSize="17px"
                    fontWeight="500"
                    _hover={{ 
                      bgGradient: "linear(135deg, #00A9E0 0%, #6DD3EF 100%)",
                    }}
                    _active={{
                      bgGradient: "linear(135deg, #0097CB 0%, #5FC3E5 100%)",
                    }}
                    boxShadow="0 4px 14px rgba(0, 169, 224, 0.35)"
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
                    h="54px"
                    borderRadius="14px"
                    bg="white"
                    borderColor="#E5E7EB"
                    borderWidth="1px"
                    color="#1D1D1F"
                    fontSize="17px"
                    fontWeight="500"
                    _hover={{ 
                      bg: "#F9FAFB",
                    }}
                    _active={{ 
                      bg: "#F3F4F6",
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
                mt={6}
                variants={itemVariants}
              >
                <Text
                  fontSize="13px"
                  color="#8E8E93"
                >
                  Secure. Private. AI-Powered.
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
        bg="#F5F5F7" 
        pt={{ base: 16, md: 20 }} 
        pb={{ base: 16, md: 20 }} 
        px={{ base: 4, sm: 6 }}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif' }}
      >
        <Container maxW="520px">
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {/* Section Label */}
            <MotionBox textAlign="center" mb={3} variants={itemVariants}>
              <Text
                fontSize="13px"
                letterSpacing="0.06em"
                fontWeight="500"
                color="#8E8E93"
                textTransform="uppercase"
              >
                {t('hero.investorProfileLabel')}
              </Text>
            </MotionBox>

            {/* Section Title */}
            <MotionBox textAlign="center" mb={4} variants={itemVariants}>
              <Text
                fontSize={{ base: "32px", md: "38px" }}
                fontWeight="600"
                color="#1D1D1F"
                lineHeight="1.1"
                letterSpacing="-0.02em"
              >
                {t('hero.fundATitle')}
              </Text>
            </MotionBox>

            {/* Section Description */}
            <MotionBox textAlign="center" mb={8} variants={itemVariants}>
              <Text
                fontSize={{ base: "16px", md: "17px" }}
                color="#515154"
                lineHeight="1.5"
                maxW="440px"
                mx="auto"
              >
                {t('hero.fundADescription')}
              </Text>
            </MotionBox>

            {/* Card */}
            <MotionBox
              bg="white"
              borderRadius="24px"
              p={6}
              boxShadow="0 2px 20px rgba(0,0,0,0.06)"
              variants={cardVariants}
            >
              <VStack align="stretch" spacing={5}>
                {/* Main Text */}
                <Text fontSize="18px" fontWeight="500" color="#1D1D1F" lineHeight="1.4">
                  {t('hero.targetingIRR')} <Text as="span" fontWeight="600">{t('hero.netIRR')}</Text>* {t('hero.withOur')}{" "}
                  <Text 
                    as="a"
                    href="/sell-the-wall"
                    target="_blank"
                    rel="noopener noreferrer"
                    display="inline"
                    color="#00A9E0"
                    textDecoration="none"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      color: "#4BC0C8",
                      textDecoration: "underline"
                    }}
                  >
                    "{t('hero.sellTheWall')}"
                  </Text>
                  {" "}{t('hero.approach')}
                </Text>

                <Text fontSize="16px" color="#515154" lineHeight="1.55">
                  {t('hero.aiFirstInvesting')}
                </Text>

                <Text fontSize="16px" color="#515154" lineHeight="1.55">
                  {t('hero.provenRiskFramework')}
                </Text>

                {/* Stats Grid */}
                <Box 
                  display="grid" 
                  gridTemplateColumns="1fr 1fr" 
                  gap={3}
                  pt={4}
                  borderTop="1px solid"
                  borderColor="#F0F0F0"
                >
                  <Box
                    bg="#F5F5F7"
                    borderRadius="16px"
                    p={4}
                    textAlign="center"
                  >
                    <Text fontSize="11px" letterSpacing="0.04em" fontWeight="500" color="#8E8E93" textTransform="uppercase" mb={1}>
                      {t('hero.targetNetIRR')}
                    </Text>
                    <Text fontSize="32px" fontWeight="600" color="#1D1D1F">
                      18-23%
                    </Text>
                  </Box>
                  <Box
                    bg="#F5F5F7"
                    borderRadius="16px"
                    p={4}
                    textAlign="center"
                  >
                    <Text fontSize="11px" letterSpacing="0.04em" fontWeight="500" color="#8E8E93" textTransform="uppercase" mb={1}>
                      {t('hero.inception')}
                    </Text>
                    <Text fontSize="32px" fontWeight="600" color="#1D1D1F">
                      2024
                    </Text>
                  </Box>
                </Box>
              </VStack>
            </MotionBox>

            {/* Disclaimer */}
            <Text
              fontSize="12px"
              color="#8E8E93"
              fontStyle="italic"
              mt={4}
              textAlign="center"
              lineHeight="1.4"
            >
              {t('hero.disclaimer')}
            </Text>

            {/* CTA Button */}
            <MotionBox mt={5} variants={itemVariants}>
              <MotionButton
                onClick={() => navigate("/discover-fund-a")}
                w="100%"
                h="54px"
                borderRadius="14px"
                bgGradient="linear(135deg, #00A9E0 0%, #6DD3EF 100%)"
                color="white"
                fontSize="17px"
                fontWeight="500"
                _hover={{ 
                  bgGradient: "linear(135deg, #00A9E0 0%, #6DD3EF 100%)",
                }}
                _active={{
                  bgGradient: "linear(135deg, #0097CB 0%, #5FC3E5 100%)",
                }}
                boxShadow="0 4px 14px rgba(0, 169, 224, 0.35)"
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
        bg="#FFFFFF"
        pt={{ base: 16, md: 20 }}
        pb={{ base: 16, md: 20 }}
        px={{ base: 4, sm: 6 }}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif' }}
      >
        <Container maxW="480px">
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            textAlign="center"
          >
            {/* Section Title */}
            <MotionBox mb={4} variants={itemVariants}>
              <Text
                fontSize={{ base: "32px", md: "38px" }}
                fontWeight="600"
                color="#1D1D1F"
                lineHeight="1.1"
                letterSpacing="-0.02em"
              >
                {t('hero.readyToTransform')}
              </Text>
            </MotionBox>

            {/* Section Description */}
            <MotionBox mb={8} variants={itemVariants}>
              <Text
                fontSize={{ base: "16px", md: "17px" }}
                color="#515154"
                lineHeight="1.5"
                maxW="400px"
                mx="auto"
              >
                {t('hero.joinInvestors')}
              </Text>
            </MotionBox>

            {/* CTA Card */}
            <MotionBox
              bg="#F5F5F7"
              borderRadius="24px"
              p={6}
              variants={cardVariants}
            >
              <VStack spacing={3}>
                <MotionButton
                  onClick={() => navigate("/about")}
                  w="100%"
                  h="54px"
                  borderRadius="14px"
                  bgGradient="linear(135deg, #00A9E0 0%, #6DD3EF 100%)"
                  color="white"
                  fontSize="17px"
                  fontWeight="500"
                  _hover={{ 
                    bgGradient: "linear(135deg, #00A9E0 0%, #6DD3EF 100%)",
                  }}
                  _active={{
                    bgGradient: "linear(135deg, #0097CB 0%, #5FC3E5 100%)",
                  }}
                  boxShadow="0 4px 14px rgba(0, 169, 224, 0.35)"
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
                  h="54px"
                  borderRadius="14px"
                  bg="white"
                  borderColor="#E5E7EB"
                  borderWidth="1px"
                  color="#1D1D1F"
                  fontSize="17px"
                  fontWeight="500"
                  _hover={{ 
                    bg: "#FFFFFF",
                  }}
                  _active={{ 
                    bg: "#F9FAFB",
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
