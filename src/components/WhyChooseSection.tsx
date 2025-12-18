import React from "react";
import {
  Box,
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
import { FaChartBar, FaPercent, FaRobot, FaLock, FaEye } from "react-icons/fa";
import { MdVerifiedUser, MdSmartToy, MdPsychology, MdVisibility, MdLock, MdAnalytics } from "react-icons/md";
import { useNavigate } from "react-router-dom";

// Motion components for smooth animations
const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Apple-like easing curve
const appleEase: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// Design tokens matching HTML template exactly
const tokens = {
  // Typography colors
  textMain: "#0f172a", // slate-900
  textMuted: "#64748b", // slate-500
  
  // Brand colors
  primary: "#2b8cee",
  
  // Background colors
  backgroundLight: "#ffffff",
  bgSlate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate400: "#94a3b8",
};

// SF Pro font family
const fontFamily = 'Manrope, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';

// Feature Cards matching exact HTML template
const featureCards = [
  {
    title: "Data Driven",
    body: "Real-time market analytics.",
    icon: MdAnalytics,
  },
  {
    title: "Low Fees",
    body: "Maximize your total returns.",
    icon: FaPercent,
  },
  {
    title: "Expert Vetted",
    body: "Curated top opportunities.",
    icon: MdVerifiedUser,
  },
  {
    title: "Automated",
    body: "Hands-free smart investing.",
    icon: MdSmartToy,
  },
];

// Trust chips
const trustChips = [
  { label: "AI-First", icon: MdPsychology },
  { label: "Secure", icon: MdLock },
  { label: "Transparent", icon: MdVisibility },
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

// Feature Card Component - Exact HTML template match
const FeatureCard = ({ item }: { item: typeof featureCards[0] }) => {
  return (
    <MotionBox
      variants={itemVariants}
      display="flex"
      flexDirection="column"
      gap={2}
      p={4}
      borderRadius="xl"
      bg="white"
      border="1px solid"
      borderColor={tokens.slate200}
      boxShadow="0 2px 8px -2px rgba(0, 0, 0, 0.05)"
      cursor="pointer"
      role="group"
      sx={{ transition: "all 0.2s ease" }}
      _hover={{
        borderColor: "rgba(43, 140, 238, 0.3)",
      }}
    >
      {/* Icon Container */}
      <Flex
        w="40px"
        h="40px"
        borderRadius="lg"
        align="center"
        justify="center"
        bg="rgba(43, 140, 238, 0.1)"
        mb={1}
      >
        <Icon 
          as={item.icon} 
          boxSize="20px" 
          color={tokens.primary}
        />
      </Flex>

      {/* Content */}
      <Box>
        <Text
          fontSize="15px"
          fontWeight="700"
          color={tokens.textMain}
          lineHeight="tight"
          mb={1}
          fontFamily={fontFamily}
        >
          {item.title}
        </Text>
        <Text
          fontSize="12px"
          fontWeight="500"
          color={tokens.textMuted}
          lineHeight="normal"
          fontFamily={fontFamily}
        >
          {item.body}
        </Text>
      </Box>
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
      bg={tokens.bgSlate50}
      display="flex"
      justifyContent="center"
      minH="100vh"
      fontFamily={fontFamily}
    >
      {/* Mobile Container */}
      <Box
        position="relative"
        display="flex"
        minH="100vh"
        w="100%"
        maxW="500px"
        flexDirection="column"
        bg={tokens.backgroundLight}
        overflow="hidden"
        boxShadow="sm"
      >
        {/* Main Content Area */}
        <Box
          as="main"
          flex="1"
          display="flex"
          flexDirection="column"
          px={5}
          py={6}
        >
          <MotionBox
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
            display="flex"
            flexDirection="column"
            flex="1"
          >
            {/* Section Tag */}
            <MotionBox 
              variants={itemVariants} 
              display="flex" 
              justifyContent="center" 
              mb={3}
            >
              <Flex
                display="inline-flex"
                align="center"
                justify="center"
                px={4}
                py={1.5}
                borderRadius="full"
                bg={tokens.slate100}
                border="1px solid"
                borderColor={tokens.slate200}
              >
                <Text
                  fontSize="11px"
                  fontWeight="700"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color={tokens.primary}
                >
                  Why Hushh
                </Text>
              </Flex>
            </MotionBox>

            {/* Headline */}
            <MotionBox variants={itemVariants} textAlign="center" mb={8}>
              <Heading
                as="h1"
                fontSize="32px"
                fontWeight="800"
                lineHeight="1.1"
                letterSpacing="tight"
                color={tokens.textMain}
                mb={2}
                fontFamily={fontFamily}
              >
                The Hushh<br />Advantage
              </Heading>
              <Text
                fontSize="14px"
                fontWeight="500"
                color={tokens.textMuted}
                lineHeight="relaxed"
                maxW="280px"
                mx="auto"
              >
                Built for the modern investor who values clarity over complexity.
              </Text>
            </MotionBox>

            {/* Feature Grid (Compact 2x2) */}
            <MotionBox variants={itemVariants} mb={8}>
              <SimpleGrid columns={2} spacing={3}>
                {featureCards.map((item) => (
                  <FeatureCard key={item.title} item={item} />
                ))}
              </SimpleGrid>
            </MotionBox>

            {/* Chips Cluster (Pyramid Layout) */}
            <MotionBox variants={itemVariants} mb={10}>
              <VStack spacing={3} align="center">
                {/* Top Row: 2 Chips */}
                <Flex gap={3}>
                  {trustChips.slice(0, 2).map((chip) => (
                    <Flex
                      key={chip.label}
                      h="36px"
                      align="center"
                      justify="center"
                      gap={2}
                      borderRadius="lg"
                      bg={tokens.bgSlate50}
                      border="1px solid"
                      borderColor={tokens.slate100}
                      px={4}
                    >
                      <Icon as={chip.icon} boxSize="18px" color={tokens.slate400} />
                      <Text
                        fontSize="14px"
                        fontWeight="600"
                        color="#334155" /* slate-700 */
                        fontFamily={fontFamily}
                      >
                        {chip.label}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
                {/* Bottom Row: 1 Centered Chip */}
                <Flex
                  h="36px"
                  align="center"
                  justify="center"
                  gap={2}
                  borderRadius="lg"
                  bg={tokens.bgSlate50}
                  border="1px solid"
                  borderColor={tokens.slate100}
                  px={4}
                >
                  <Icon as={trustChips[2].icon} boxSize="18px" color={tokens.slate400} />
                  <Text
                    fontSize="14px"
                    fontWeight="600"
                    color="#334155" /* slate-700 */
                    fontFamily={fontFamily}
                  >
                    {trustChips[2].label}
                  </Text>
                </Flex>
              </VStack>
            </MotionBox>

            {/* Primary CTA - mt-auto to push to bottom */}
            <Box mt="auto" pb={4}>
              <MotionButton
                onClick={() => navigate("/discover-fund-a")}
                position="relative"
                display="flex"
                w="100%"
                h="52px"
                alignItems="center"
                justifyContent="center"
                borderRadius="xl"
                bg={tokens.primary}
                color="white"
                fontSize="17px"
                fontWeight="700"
                letterSpacing="wide"
                fontFamily={fontFamily}
                overflow="hidden"
                _hover={{
                  bg: "#2563eb",
                }}
                _active={{
                  transform: "scale(0.98)",
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Text position="relative" zIndex={10}>
                  Explore Our Approach
                </Text>
              </MotionButton>
            </Box>
          </MotionBox>
        </Box>

        {/* Bottom Spacing for safe area */}
        <Box h={4} w="100%" bg="transparent" />
      </Box>
    </Box>
  );
};

export default WhyChooseSection;
