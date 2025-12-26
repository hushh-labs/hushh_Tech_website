// src/components/MobileBottomNav.tsx
// Mobile bottom navigation with 4 tabs matching the exact design reference
// Active tab has blue circular background behind icon

import React from 'react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiUsers, FiUser } from 'react-icons/fi';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  matchPaths?: string[]; // Additional paths that should highlight this tab
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: FiHome,
    path: '/',
    matchPaths: ['/our-philosophy'],
  },
  {
    id: 'fund',
    label: 'Fund A',
    icon: FiTrendingUp,
    path: '/discover-fund-a',
    matchPaths: ['/sell-the-wall', '/ai-powered-berkshire'],
  },
  {
    id: 'community',
    label: 'Community',
    icon: FiUsers,
    path: '/community',
    matchPaths: [],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: FiUser,
    path: '/hushh-user-profile',
    matchPaths: ['/contact', '/faq'],
  },
];

// Pages where bottom nav should be hidden
const hiddenOnPages = [
  '/onboarding',
  '/login',
  '/signup',
  '/auth',
  '/kyc-flow',
  '/kyc-demo',
  '/a2a-playground',
];

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page should hide the nav
  const shouldHideNav = hiddenOnPages.some(page => 
    location.pathname.toLowerCase().startsWith(page.toLowerCase())
  );

  // Check if we're on a full-screen community post
  const isFullScreenPost = location.pathname.startsWith('/community/') && 
    location.pathname !== '/community';

  if (shouldHideNav || isFullScreenPost) {
    return null;
  }

  // Check if a nav item is active
  const isActive = (item: NavItem): boolean => {
    if (location.pathname === item.path) return true;
    if (item.matchPaths?.some(p => location.pathname.startsWith(p))) return true;
    // Special case for community - match any /community path
    if (item.id === 'community' && location.pathname.startsWith('/community')) return true;
    return false;
  };

  return (
    <Box
      display={{ base: 'block', md: 'none' }}
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="40"
      bg="#F8F9FA"
      borderTop="1px solid"
      borderColor="#E5E7EB"
      pb="env(safe-area-inset-bottom)"
    >
      <Flex
        justify="space-around"
        align="center"
        h="85px"
        maxW="448px"
        mx="auto"
        px="2"
      >
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Flex
              key={item.id}
              direction="column"
              align="center"
              justify="center"
              gap="1"
              p="2"
              flex="1"
              h="100%"
              cursor="pointer"
              onClick={() => navigate(item.path)}
              transition="all 0.2s ease"
              role="group"
              _active={{ transform: 'scale(0.95)' }}
            >
              {/* Icon Container - Blue circle when active */}
              <Flex
                align="center"
                justify="center"
                w="48px"
                h="48px"
                borderRadius="full"
                bg={active ? '#E8F0FE' : 'transparent'}
                transition="all 0.2s ease"
              >
                <Icon
                  as={item.icon}
                  boxSize={6}
                  color={active ? '#2F80ED' : '#9CA3AF'}
                  strokeWidth={active ? 2.5 : 2}
                  transition="all 0.2s ease"
                />
              </Flex>
              
              {/* Label */}
              <Text
                fontSize="11px"
                fontWeight={active ? '600' : '500'}
                color={active ? '#2F80ED' : '#9CA3AF'}
                letterSpacing="0.01em"
                transition="all 0.2s ease"
                mt="-2px"
              >
                {item.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};

export default MobileBottomNav;
