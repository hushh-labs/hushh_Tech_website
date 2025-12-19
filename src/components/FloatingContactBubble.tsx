import { Box, Icon, Tooltip } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import React from 'react';

/**
 * FloatingContactBubble component
 * A floating bubble that appears on the right side of the screen across all pages
 * Clicking it opens email to invest@hushh.ai
 * Updated to match the template design with solid blue (#2b8cee)
 */

// Create motion components
const MotionBox = motion(Box);

export default function FloatingContactBubble() {
  const handleClick = () => {
    window.location.href = 'mailto:invest@hushh.ai';
  };

  return (
    <Tooltip 
      label="Contact Us - invest@hushh.ai" 
      placement="left"
      hasArrow
      bg="gray.700"
      color="white"
      fontSize="sm"
      px={3}
      py={2}
      borderRadius="md"
    >
      <MotionBox
        as="button"
        position="fixed"
        bottom={{ base: '24px', md: '32px' }}
        right={{ base: '24px', md: '32px' }}
        width={{ base: '56px', md: '56px' }}
        height={{ base: '56px', md: '56px' }}
        borderRadius="full"
        bg="#2b8cee"
        color="white"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        boxShadow="0 4px 14px rgba(43, 140, 238, 0.3)"
        zIndex={9999}
        border="none"
        outline="none"
        onClick={handleClick}
        aria-label="Contact us via email"
        role="button"
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        _hover={{
          bg: '#2579d4',
        }}
        _focus={{
          outline: '3px solid',
          outlineColor: 'blue.300',
          outlineOffset: '2px',
        }}
        // Hover animation
        whileHover={{
          scale: 1.05,
          boxShadow: '0 6px 20px rgba(43, 140, 238, 0.4)',
        }}
        whileTap={{
          scale: 0.95,
        }}
        // Smooth transition
        transition={{
          duration: 0.2,
          ease: 'easeInOut',
        } as any}
      >
        {/* Mail Icon */}
        <Icon 
          as={Mail} 
          boxSize={{ base: '24px', md: '24px' }}
          strokeWidth={2}
        />
      </MotionBox>
    </Tooltip>
  );
}
