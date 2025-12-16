import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Link,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaRocket, FaChartLine, FaBrain, FaShieldAlt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

// Motion components for smooth animations
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionButton = motion(Button);

// Apple-like easing curve - typed as tuple for framer-motion compatibility
const appleEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Design tokens following Mobile UI Design Guidelines
const tokens = {
  // Typography colors
  headline: "#1D1D1F",
  body: "#1D1D1F",
  secondary: "#515154",
  muted: "#6E6E73",
  caption: "#8E8E93",
  
  // Brand colors
  primary: "#00A9E0",
  primaryLight: "#6DD3EF",
  
  // Background colors
  background: "#FFFFFF",
  cardBg: "rgba(255, 255, 255, 0.95)",
  
  // Separators
  separator: "rgba(0, 0, 0, 0.06)",
  
  // Gradients
  gradientStart: "#00A9E0",
  gradientEnd: "#6DD3EF",
  
  // Accents
  success: "#34C759",
};

// SF Pro font family
const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif';

// Advantages data with enhanced icons
const advantages = [
  {
    title: "AI-Driven Alpha",
    body: "Proprietary AI algorithms systematically extract alpha and adapt to market changes.",
    icon: FaRocket,
    gradient: "linear-gradient(135deg, #00A9E0 0%, #6DD3EF 100%)",
  },
  {
    title: "Systematic Risk Management",
    body: "Rigorous quantitative analysis and AI meticulously control risk every day.",
    icon: FaChartLine,
    gradient: "linear-gradient(135deg, #34C759 0%, #30D158 100%)",
  },
  {
    title: "Hushh Enterprise × AI Synergy",
    body: "AI provides speed and scale; human insight delivers deep understanding and strategic oversight.",
    icon: FaBrain,
    gradient: "linear-gradient(135deg, #AF52DE 0%, #BF5AF2 100%)",
  },
  {
    title: "Transparency You Trust",
    body: "Clear reporting and ethical practices you can depend on.",
    icon: FaShieldAlt,
    gradient: "linear-gradient(135deg, #FF9500 0%, #FF9F0A 100%)",
  },
];

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
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

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: appleEase,
    },
  },
};

// Individual Advantage Card Component
const AdvantageCard = ({ item, index }: { item: typeof advantages[0]; index: number }) => {
  return (
    <MotionFlex
      variants={itemVariants}
      align="flex-start"
      gap={4}
      p={5}
      borderRadius="20px"
      bg={tokens.cardBg}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor={tokens.separator}
      position="relative"
      overflow="hidden"
      cursor="pointer"
      role="group"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 12px 40px rgba(0, 169, 224, 0.12)",
        transition: { duration: 0.3, ease: appleEase },
      }}
      whileTap={{ scale: 0.98 }}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        background: item.gradient,
        opacity: 0,
        transition: "opacity 0.3s ease",
      }}
      _hover={{
        "&::before": {
          opacity: 1,
        },
      }}
    >
      {/* Icon Container with Gradient */}
      <Flex
        w="52px"
        h="52px"
        minW="52px"
        borderRadius="16px"
        align="center"
        justify="center"
        bg={item.gradient}
        boxShadow={`0 4px 16px ${item.gradient.includes("00A9E0") ? "rgba(0, 169, 224, 0.3)" : 
                    item.gradient.includes("34C759") ? "rgba(52, 199, 89, 0.3)" :
                    item.gradient.includes("AF52DE") ? "rgba(175, 82, 222, 0.3)" :
                    "rgba(255, 149, 0, 0.3)"}`}
        transition="all 0.3s ease"
        _groupHover={{
          transform: "scale(1.08) rotate(3deg)",
          boxShadow: `0 8px 24px ${item.gradient.includes("00A9E0") ? "rgba(0, 169, 224, 0.4)" : 
                      item.gradient.includes("34C759") ? "rgba(52, 199, 89, 0.4)" :
                      item.gradient.includes("AF52DE") ? "rgba(175, 82, 222, 0.4)" :
                      "rgba(255, 149, 0, 0.4)"}`,
        }}
      >
        <Icon as={item.icon} boxSize={6} color="white" />
      </Flex>

      {/* Content */}
      <VStack align="start" spacing={2} flex={1}>
        <Text
          fontSize="19px"
          fontWeight="600"
          color={tokens.headline}
          lineHeight="1.25"
          fontFamily={fontFamily}
          letterSpacing="-0.01em"
        >
          {item.title}
        </Text>
        <Text
          fontSize="15px"
          fontWeight="400"
          color={tokens.secondary}
          lineHeight="1.55"
          fontFamily={fontFamily}
        >
          {item.body}
        </Text>
      </VStack>

      {/* Subtle Arrow Indicator */}
      <Box
        opacity={0}
        transform="translateX(-8px)"
        transition="all 0.3s ease"
        _groupHover={{
          opacity: 0.5,
          transform: "translateX(0)",
        }}
        color={tokens.muted}
        fontSize="18px"
        mt={1}
      >
        →
      </Box>
    </MotionFlex>
  );
};

const WhyChooseSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <Box
      ref={sectionRef}
      bg={tokens.background}
      pt={{ base: 20, md: 24 }}
      pb={{ base: 20, md: 24 }}
      px={{ base: 5, sm: 6, md: 8 }}
      position="relative"
      overflow="hidden"
      fontFamily={fontFamily}
    >
      {/* Subtle Background Gradient */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #FFFFFF 100%)"
        pointerEvents="none"
        zIndex={0}
      />

      {/* Decorative Gradient Orbs */}
      <Box
        position="absolute"
        top="10%"
        right="-10%"
        w="400px"
        h="400px"
        bg="radial-gradient(circle, rgba(0, 169, 224, 0.06) 0%, transparent 70%)"
        borderRadius="full"
        filter="blur(40px)"
        pointerEvents="none"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="20%"
        left="-15%"
        w="300px"
        h="300px"
        bg="radial-gradient(circle, rgba(109, 211, 239, 0.05) 0%, transparent 70%)"
        borderRadius="full"
        filter="blur(40px)"
        pointerEvents="none"
        zIndex={0}
      />

      <Container maxW="680px" position="relative" zIndex={1}>
        <MotionBox
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Section Badge */}
          <MotionBox variants={itemVariants} textAlign="center" mb={4}>
            <Flex
              display="inline-flex"
              align="center"
              gap={2}
              px={4}
              py={2}
              bg="rgba(0, 169, 224, 0.08)"
              borderRadius="full"
              border="1px solid rgba(0, 169, 224, 0.15)"
            >
              <Icon as={HiSparkles} boxSize={4} color={tokens.primary} />
              <Text
                fontSize="13px"
                fontWeight="600"
                color={tokens.primary}
                letterSpacing="0.04em"
                textTransform="uppercase"
              >
                Why Hushh
              </Text>
            </Flex>
          </MotionBox>

          {/* Main Heading */}
          <MotionBox variants={itemVariants} textAlign="center" mb={4}>
            <Heading
              as="h2"
              fontSize={{ base: "32px", md: "40px" }}
              fontWeight="700"
              color={tokens.headline}
              lineHeight="1.1"
              letterSpacing="-0.025em"
              fontFamily={fontFamily}
            >
              The Hushh{" "}
              <Text
                as="span"
                bgGradient={`linear(to-r, ${tokens.gradientStart}, ${tokens.gradientEnd})`}
                bgClip="text"
              >
                Advantage
              </Text>
            </Heading>
          </MotionBox>

          {/* Subtitle */}
          <MotionBox variants={itemVariants} textAlign="center" mb={10}>
            <Text
              fontSize={{ base: "17px", md: "19px" }}
              fontWeight="400"
              color={tokens.secondary}
              lineHeight="1.55"
              maxW="480px"
              mx="auto"
            >
              What you reliably get with every Hushh investor profile.
            </Text>
          </MotionBox>

          {/* Advantages Grid */}
          <MotionBox variants={cardVariants}>
            <VStack spacing={4} align="stretch">
              {advantages.map((item, idx) => (
                <AdvantageCard key={item.title} item={item} index={idx} />
              ))}
            </VStack>
          </MotionBox>

          {/* Trust Indicators - Premium Glass Pill Design */}
          <MotionBox variants={itemVariants} mt={10}>
            <Flex 
              justify="center" 
              gap={{ base: 3, md: 4 }}
              flexWrap="wrap"
              px={4}
            >
              {[
                { label: "AI-First", icon: "🤖", gradient: "linear-gradient(135deg, #00A9E0 0%, #6DD3EF 100%)" },
                { label: "Secure", icon: "🔒", gradient: "linear-gradient(135deg, #34C759 0%, #30D158 100%)" },
                { label: "Transparent", icon: "✨", gradient: "linear-gradient(135deg, #AF52DE 0%, #BF5AF2 100%)" },
              ].map((badge) => (
                <Flex 
                  key={badge.label} 
                  align="center" 
                  gap={2.5}
                  px={5}
                  py={2.5}
                  bg="rgba(255, 255, 255, 0.9)"
                  backdropFilter="blur(20px)"
                  borderRadius="full"
                  border="1px solid"
                  borderColor="rgba(0, 0, 0, 0.06)"
                  boxShadow="0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)"
                  sx={{
                    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  }}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                    borderColor: "rgba(0, 169, 224, 0.2)",
                  }}
                  cursor="default"
                >
                  {/* Icon with subtle gradient background */}
                  <Flex
                    w="28px"
                    h="28px"
                    borderRadius="full"
                    align="center"
                    justify="center"
                    bg={badge.gradient}
                    boxShadow={`0 2px 8px ${
                      badge.label === "AI-First" ? "rgba(0, 169, 224, 0.3)" :
                      badge.label === "Secure" ? "rgba(52, 199, 89, 0.3)" :
                      "rgba(175, 82, 222, 0.3)"
                    }`}
                  >
                    <Text fontSize="14px" lineHeight="1">{badge.icon}</Text>
                  </Flex>
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color={tokens.headline}
                    letterSpacing="-0.01em"
                    fontFamily={fontFamily}
                  >
                    {badge.label}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </MotionBox>

          {/* CTA Button */}
          <MotionBox variants={itemVariants} mt={10} textAlign="center">
            <MotionButton
              onClick={() => navigate("/discover-fund-a")}
              h="56px"
              px={10}
              borderRadius="16px"
              bg={`linear-gradient(135deg, ${tokens.gradientStart} 0%, ${tokens.gradientEnd} 100%)`}
              color="white"
              fontSize="17px"
              fontWeight="500"
              letterSpacing="-0.01em"
              fontFamily={fontFamily}
              boxShadow="0 8px 24px rgba(0, 169, 224, 0.35)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 32px rgba(0, 169, 224, 0.45)",
              }}
              _active={{
                transform: "scale(0.98)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Our Approach
            </MotionButton>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default WhyChooseSection;
