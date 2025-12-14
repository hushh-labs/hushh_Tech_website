import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

// Apple Design Tokens
const tokens = {
  textPrimary: "#1D1D1F",
  textSecondary: "#515154",
  textMuted: "#8E8E93",
  separator: "#E5E5EA",
  surface: "#FFFFFF",
  accent: "#0A84FF",
};

const advantages = [
  {
    title: "AI-Driven Alpha",
    body: "Proprietary AI algorithms systematically extract alpha and adapt to market changes.",
  },
  {
    title: "Systematic Risk Management",
    body: "Rigorous quantitative analysis and AI meticulously control risk every day.",
  },
  {
    title: "Hushh Enterprise × AI Synergy",
    body: "AI provides speed and scale; human insight delivers deep understanding and strategic oversight.",
  },
  {
    title: "Transparency You Trust",
    body: "Clear reporting and ethical practices you can depend on.",
  },
];

const WhyChooseSection = () => {
  const fadeUp = keyframes`
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  return (
    <Box
      bg={tokens.surface}
      pt={{ base: "48px", md: "64px" }}
      pb={{ base: "48px", md: "64px" }}
      px={{ base: "24px", sm: "32px" }}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}
    >
      <Container maxW="640px" px={0}>
        <Box animation={`${fadeUp} 0.4s ease-out`}>
          {/* Eyebrow */}
          <Text
            fontSize="12px"
            color={tokens.textMuted}
            fontWeight="600"
            letterSpacing="0.12em"
            textTransform="uppercase"
            textAlign="center"
            mb={3}
          >
            Why Hushh
          </Text>

          {/* Section Title */}
          <Heading
            as="h2"
            fontSize={{ base: "32px", md: "40px" }}
            fontWeight="600"
            color={tokens.textPrimary}
            lineHeight="1.08"
            textAlign="center"
            letterSpacing="-0.015em"
            mb={4}
          >
            The Hushh Advantage
          </Heading>

          {/* Subtitle */}
          <Text
            fontSize={{ base: "17px", md: "18px" }}
            color={tokens.textSecondary}
            lineHeight="1.55"
            fontWeight="400"
            textAlign="center"
            mb={{ base: 10, md: 12 }}
            maxW="480px"
            mx="auto"
          >
            What you reliably get with every Hushh investor profile.
          </Text>
        </Box>

        {/* Advantages List - Simple stacked statements with blue dots */}
        <VStack 
          align="stretch" 
          spacing={0}
          animation={`${fadeUp} 0.45s ease-out 0.1s`}
          sx={{ animationFillMode: "backwards" }}
        >
          {advantages.map((item, idx) => (
            <Box
              key={item.title}
              py={5}
              borderTop={idx === 0 ? "1px solid" : "none"}
              borderBottom="1px solid"
              borderColor={tokens.separator}
            >
              {/* Title with blue dot */}
              <Box display="flex" alignItems="flex-start" mb={2}>
                <Box
                  w="6px"
                  h="6px"
                  borderRadius="full"
                  bg={tokens.accent}
                  mt="8px"
                  mr={3}
                  flexShrink={0}
                />
                <Text
                  fontSize="18px"
                  fontWeight="500"
                  color={tokens.textPrimary}
                  lineHeight="1.35"
                >
                  {item.title}
                </Text>
              </Box>
              
              {/* Body text */}
              <Box pl="18px">
                <Text
                  fontSize="16px"
                  fontWeight="400"
                  color={tokens.textSecondary}
                  lineHeight="1.55"
                >
                  {item.body}
                </Text>
              </Box>
            </Box>
          ))}
        </VStack>
      </Container>
    </Box>
  );
};

export default WhyChooseSection;
