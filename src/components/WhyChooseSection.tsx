import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Flex,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FaRocket, FaChartLine, FaBrain, FaShieldAlt } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { MdVisibility, MdVerifiedUser, MdSmartToy } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Motion components for smooth animations
const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Apple-like easing curve
const appleEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Design tokens matching HTML template exactly
const tokens = {
  // Typography colors
  textMain: "#111418",
  textMuted: "#617589",
  
  // Brand colors
  primary: "#2b8cee",
  
  // Background colors
  backgroundLight: "#ffffff",
  bgGray50: "#f9fafb",
  borderSubtle: "#f0f2f4",
  slate100: "#e2e8f0",
  slate50: "#f1f5f9",
};

// SF Pro font family
const fontFamily = 'Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';

// Feature Cards with colored backgrounds matching screenshots
const featureCards = [
  {
    title: "AI-Driven Alpha",
    body: "Proprietary AI algorithms systematically extract alpha and adapt to market changes.",
    icon: FaRocket,
    bgColor: "#dbeafe", // Light blue
    iconColor: "#3b82f6", // Blue
  },
  {
    title: "Systematic Risk Management",
    body: "Rigorous quantitative analysis and AI meticulously control risk every day.",
    icon: FaChartLine,
    bgColor: "#dcfce7", // Light green
    iconColor: "#22c55e", // Green
  },
  {
    title: "Hushh Enterprise × AI Synergy",
    body: "AI provides speed and scale; human insight delivers deep understanding and strategic oversight.",
    icon: FaBrain,
    bgColor: "#f3e8ff", // Light purple
    iconColor: "#a855f7", // Purple
  },
  {
    title: "Transparency You Trust",
    body: "Clear reporting and ethical practices you can depend on.",
    icon: FaShieldAlt,
    bgColor: "#ffedd5", // Light orange
    iconColor: "#f97316", // Orange
  },
];

// Trust chips with colored icons
const trustChips = [
  {
    label: "AI-First",
    icon: MdSmartToy,
    bgColor: "#dbeafe",
    iconColor: "#3b82f6",
  },
  {
    label: "Secure",
    icon: MdVerifiedUser,
    bgColor: "#dcfce7",
    iconColor: "#22c55e",
  },
  {
    label: "Transparent",
    icon: HiSparkles,
    bgColor: "#f3e8ff",
    iconColor: "#a855f7",
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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
      ease: appleEase,
    },
  },
};

// Feature Card Component - Exact HTML template match with horizontal layout
const FeatureCard = ({ item }: { item: typeof featureCards[0] }) => {
  return (
    <MotionBox
      variants={itemVariants}
      display="flex"
      flexDirection="row"
      alignItems="flex-start"
      gap={4}
      p={5}
      borderRadius="16px"
      bg="white"
      border="1px solid"
      borderColor={tokens.slate100}
      boxShadow="0 2px 8px -2px rgba(0, 0, 0, 0.04)"
      cursor="pointer"
      role="group"
      sx={{ transition: "all 0.3s ease" }}
      _hover={{
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* Icon Container - Rounded square with colored bg */}
      <Flex
        w="56px"
        h="56px"
        minW="56px"
        borderRadius="12px"
        align="center"
        justify="center"
        bg={item.bgColor}
        transition="all 0.3s ease"
      >
        <Icon 
          as={item.icon} 
          boxSize="28px" 
          color={item.iconColor}
        />
      </Flex>

      {/* Content */}
      <VStack align="start" spacing={1.5} flex={1}>
        <Text
          fontSize="18px"
          fontWeight="700"
          color={tokens.textMain}
          lineHeight="tight"
          fontFamily={fontFamily}
        >
          {item.title}
        </Text>
        <Text
          fontSize="14px"
          fontWeight="500"
          color={tokens.textMuted}
          lineHeight="relaxed"
          fontFamily={fontFamily}
        >
          {item.body}
        </Text>
      </VStack>
    </MotionBox>
  );
};

const WhyChooseSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <Box
      ref={sectionRef}
      bg={tokens.bgGray50}
      display="flex"
      alignItems="start"
      justifyContent="center"
      minH="100vh"
      fontFamily={fontFamily}
      p={{ base: 0, sm: 4 }}
    >
      {/* Mobile Container Simulation */}
      <Box
        position="relative"
        display="flex"
        minH="100vh"
        w="100%"
        maxW="500px"
        flexDirection="column"
        bg={tokens.backgroundLight}
        boxShadow="xl"
        borderRadius={{ base: 0, sm: "32px" }}
        overflow="hidden"
      >
        {/* Main Content Wrapper */}
        <Box
          as="main"
          flex="1"
          display="flex"
          flexDirection="column"
          alignItems="center"
          px={6}
          py={12}
          gap={8}
        >
          <MotionBox
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            w="100%"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={8}
          >
            {/* Header Section */}
            <VStack spacing={4} w="100%">
              {/* Pill Label */}
              <MotionBox variants={itemVariants}>
                <Flex
                  h="32px"
                  align="center"
                  justify="center"
                  gap={2}
                  px={3}
                  pr={4}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={tokens.borderSubtle}
                  bg={tokens.slate50}
                >
                  <Icon as={HiSparkles} boxSize="18px" color={tokens.primary} />
                  <Text
                    fontSize="12px"
                    fontWeight="700"
                    color={tokens.primary}
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                  >
                    Why Hushh
                  </Text>
                </Flex>
              </MotionBox>

              {/* Headline */}
              <MotionBox variants={itemVariants} textAlign="center">
                <VStack spacing={2}>
                  <Heading
                    as="h1"
                    fontSize="32px"
                    fontWeight="800"
                    color={tokens.textMain}
                    lineHeight="1.15"
                    letterSpacing="tight"
                    fontFamily={fontFamily}
                  >
                    The Hushh{" "}
                    <Text as="span" color={tokens.primary}>
                      Advantage
                    </Text>
                  </Heading>
                  <Text
                    fontSize="16px"
                    fontWeight="500"
                    color={tokens.textMuted}
                    maxW="320px"
                    mx="auto"
                    lineHeight="relaxed"
                  >
                    What you reliably get with every Hushh investor profile.
                  </Text>
                </VStack>
              </MotionBox>
            </VStack>

            {/* Feature Cards - Stacked Layout */}
            <VStack spacing={4} w="100%">
              {featureCards.map((item) => (
                <FeatureCard key={item.title} item={item} />
              ))}
            </VStack>

            {/* Trust Chips - Pyramid Layout */}
            <MotionBox variants={itemVariants} w="100%">
              <VStack spacing={3} align="center">
                {/* Top Row: 2 chips */}
                <Flex justify="center" gap={3} w="100%" flexWrap="wrap">
                  {trustChips.slice(0, 2).map((chip) => (
                    <Flex 
                      key={chip.label}
                      align="center" 
                      justify="center"
                      gap={2}
                      h="40px"
                      px={4}
                      bg="white"
                      borderRadius="full"
                      border="1px solid"
                      borderColor={tokens.slate100}
                      boxShadow="0 2px 8px -2px rgba(0, 0, 0, 0.04)"
                    >
                      <Flex
                        w="28px"
                        h="28px"
                        borderRadius="8px"
                        align="center"
                        justify="center"
                        bg={chip.bgColor}
                      >
                        <Icon as={chip.icon} boxSize="16px" color={chip.iconColor} />
                      </Flex>
                      <Text
                        fontSize="14px"
                        fontWeight="600"
                        color={tokens.textMain}
                        fontFamily={fontFamily}
                      >
                        {chip.label}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
                {/* Bottom Row: 1 chip centered */}
                <Flex justify="center" w="100%">
                  <Flex 
                    align="center" 
                    justify="center"
                    gap={2}
                    h="40px"
                    px={4}
                    bg="white"
                    borderRadius="full"
                    border="1px solid"
                    borderColor={tokens.slate100}
                    boxShadow="0 2px 8px -2px rgba(0, 0, 0, 0.04)"
                  >
                    <Flex
                      w="28px"
                      h="28px"
                      borderRadius="8px"
                      align="center"
                      justify="center"
                      bg={trustChips[2].bgColor}
                    >
                      <Icon as={trustChips[2].icon} boxSize="16px" color={trustChips[2].iconColor} />
                    </Flex>
                    <Text
                      fontSize="14px"
                      fontWeight="600"
                      color={tokens.textMain}
                      fontFamily={fontFamily}
                    >
                      {trustChips[2].label}
                    </Text>
                  </Flex>
                </Flex>
              </VStack>
            </MotionBox>

            {/* CTA Button - Gradient background matching screenshot */}
            <MotionBox variants={itemVariants} w="100%" pt={4}>
              <MotionButton
                onClick={() => navigate("/discover-fund-a")}
                position="relative"
                display="flex"
                w="100%"
                h="56px"
                alignItems="center"
                justifyContent="center"
                borderRadius="full"
                bgGradient="linear(to-r, #93c5fd, #c4b5fd)"
                color={tokens.primary}
                fontSize="16px"
                fontWeight="700"
                letterSpacing="0.015em"
                fontFamily={fontFamily}
                overflow="hidden"
                border="none"
                _hover={{
                  opacity: 0.9,
                  transform: "scale(1.02)",
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
        </Box>

        {/* Bottom Safe Area Spacer (iOS home indicator) */}
        <Box h={6} w="100%" bg="white" />
      </Box>
    </Box>
  );
};

export default WhyChooseSection;
