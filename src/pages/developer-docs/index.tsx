import React, { useState } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Heading,
  Icon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Badge,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FiHome, FiSmartphone, FiCode, FiMenu, FiPackage, FiBook, FiHelpCircle } from 'react-icons/fi';
import { SiApple, SiAndroid, SiReact } from 'react-icons/si';

// Primary accent color
const PRIMARY_COLOR = '#2bc8ee';

// Navigation items
const navItems = [
  { id: 'home', label: 'Getting Started', icon: FiHome },
  { id: 'appstore', label: 'App Store Guide', icon: SiApple },
  { id: 'android', label: 'Android Guide', icon: SiAndroid },
  { id: 'react', label: 'React Guide', icon: SiReact },
];

// Sidebar Component
const Sidebar = ({ activeSection, setActiveSection, isMobile = false }: {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMobile?: boolean;
}) => {
  return (
    <VStack align="stretch" spacing={1} py={6} px={4}>
      {/* Header */}
      <Box px={3} pb={4}>
        <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
          Docs Navigation
        </Text>
        <Text fontSize="sm" color="gray.400" mt={1}>
          Build Guides
        </Text>
      </Box>

      {/* Nav Items */}
      {navItems.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <Box
            key={item.id}
            as="button"
            onClick={() => setActiveSection(item.id)}
            display="flex"
            alignItems="center"
            gap={3}
            px={3}
            py={2.5}
            borderRadius="lg"
            bg={isActive ? `${PRIMARY_COLOR}15` : 'transparent'}
            borderLeft={isActive ? `4px solid ${PRIMARY_COLOR}` : '4px solid transparent'}
            color={isActive ? 'gray.900' : 'gray.500'}
            fontWeight={isActive ? 'bold' : 'medium'}
            fontSize="sm"
            transition="all 0.2s"
            _hover={{
              bg: isActive ? `${PRIMARY_COLOR}15` : 'gray.50',
              color: 'gray.900',
            }}
            w="full"
            textAlign="left"
          >
            <Icon 
              as={item.icon} 
              boxSize={5} 
              color={isActive ? PRIMARY_COLOR : 'gray.400'}
            />
            <Text>{item.label}</Text>
          </Box>
        );
      })}

      {/* Resources Section */}
      <Box borderTop="1px solid" borderColor="gray.200" mt={4} pt={4}>
        <Box px={3} pb={2}>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
            Resources
          </Text>
        </Box>
        <Box
          as="a"
          href="/faq"
          display="flex"
          alignItems="center"
          gap={3}
          px={3}
          py={2.5}
          borderRadius="lg"
          color="gray.500"
          fontSize="sm"
          transition="all 0.2s"
          _hover={{ bg: 'gray.50', color: 'gray.900' }}
        >
          <Icon as={FiHelpCircle} boxSize={5} />
          <Text>FAQ</Text>
        </Box>
      </Box>
    </VStack>
  );
};

// Step Component
const Step = ({ number, title, description, code }: {
  number: number;
  title: string;
  description: string;
  code?: string;
}) => (
  <HStack align="start" spacing={4}>
    <Flex
      flexShrink={0}
      w={8}
      h={8}
      borderRadius="full"
      bg={`${PRIMARY_COLOR}20`}
      color={PRIMARY_COLOR}
      fontWeight="bold"
      fontSize="sm"
      align="center"
      justify="center"
    >
      {number}
    </Flex>
    <VStack align="start" spacing={1} flex={1}>
      <Text fontWeight="bold" color="gray.900">{title}</Text>
      <Text fontSize="sm" color="gray.500">{description}</Text>
      {code && (
        <Code
          display="block"
          w="full"
          p={3}
          mt={2}
          borderRadius="lg"
          bg="gray.900"
          color="green.400"
          fontSize="xs"
          whiteSpace="pre-wrap"
          overflowX="auto"
        >
          {code}
        </Code>
      )}
    </VStack>
  </HStack>
);

// Main Content Component
const MainContent = ({ activeSection }: { activeSection: string }) => {
  return (
    <Box maxW="900px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
      {/* Breadcrumbs */}
      <HStack spacing={2} mb={8} flexWrap="wrap">
        <Text fontSize="sm" color="gray.400">Home</Text>
        <Text fontSize="sm" color="gray.400">›</Text>
        <Text fontSize="sm" color="gray.400">Guides</Text>
        <Text fontSize="sm" color="gray.400">›</Text>
        <Badge bg={`${PRIMARY_COLOR}15`} color={PRIMARY_COLOR} px={2} py={0.5} borderRadius="md" fontSize="xs">
          Building Apps
        </Badge>
      </HStack>

      {/* Page Title */}
      <VStack align="start" spacing={4} mb={10}>
        <Heading 
          as="h1" 
          fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
          fontWeight="black"
          color="gray.900"
          lineHeight="tight"
        >
          How to Build Your App 🚀
        </Heading>
        <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.500" fontWeight="light" maxW="2xl">
          This guide explains how to build and deploy the Hushh app for iOS, Android, and Web. 
          Follow the step-by-step instructions with the exact commands and scripts used.
        </Text>
      </VStack>

      {/* Accordions */}
      <Accordion allowMultiple defaultIndex={[0]}>
        {/* App Store Guide */}
        <AccordionItem 
          border="1px solid" 
          borderColor="gray.200" 
          borderRadius="xl" 
          mb={4}
          overflow="hidden"
          bg="white"
          boxShadow="sm"
        >
          <AccordionButton 
            py={5} 
            px={6} 
            bg="gray.50"
            _hover={{ bg: 'gray.100' }}
            _expanded={{ bg: 'gray.50' }}
          >
            <HStack spacing={4} flex={1}>
              <Flex 
                w={10} 
                h={10} 
                borderRadius="full" 
                bg="red.100" 
                align="center" 
                justify="center"
                fontSize="2xl"
              >
                🍎
              </Flex>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="lg" color="gray.900">
                  How to Publish to App Store (iOS)
                </Text>
                <Text fontSize="sm" color="gray.500">
                  For iPhone and iPad devices
                </Text>
              </VStack>
            </HStack>
            <AccordionIcon color="gray.400" />
          </AccordionButton>
          <AccordionPanel py={6} px={6} borderTop="1px solid" borderColor="gray.200">
            <VStack align="stretch" spacing={6}>
              <Step
                number={1}
                title="Apple Developer Account Required"
                description="You need an Apple Developer account ($99/year). Register at developer.apple.com. Without this, you cannot upload apps to App Store."
              />
              <Step
                number={2}
                title="Run the iOS TestFlight Script"
                description="This script (scripts/ios-testflight.sh) automates everything: builds web app, syncs to Capacitor, archives in Xcode, exports IPA, and uploads to TestFlight. Uses App Store Connect API with key ID 2P753XQ823."
                code={`# One command to build and upload to TestFlight
npm run ios:testflight

# Script location: scripts/ios-testflight.sh
# What it does:
# 1. npm run build (builds React app)
# 2. npx cap sync ios (copies to iOS project)
# 3. Increments CURRENT_PROJECT_VERSION in project.pbxproj
# 4. xcodebuild archive (creates .xcarchive)
# 5. xcodebuild exportArchive (creates IPA)
# 6. xcrun altool --upload-app (uploads to TestFlight)`}
              />
              <Step
                number={3}
                title="Wait for Apple Processing"
                description="After upload, Apple processes the build (10-30 minutes). You'll receive an email when ready. Check TestFlight section in App Store Connect."
              />
              <Step
                number={4}
                title="Submit for Review"
                description="Test with TestFlight, then submit to App Store review. Apple reviews in 1-2 days. Go to App Store tab > Submit for Review."
              />
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* Android Guide */}
        <AccordionItem 
          border="1px solid" 
          borderColor="gray.200" 
          borderRadius="xl" 
          mb={4}
          overflow="hidden"
          bg="white"
          boxShadow="sm"
        >
          <AccordionButton 
            py={5} 
            px={6} 
            bg="gray.50"
            _hover={{ bg: 'gray.100' }}
            _expanded={{ bg: 'gray.50' }}
          >
            <HStack spacing={4} flex={1}>
              <Flex 
                w={10} 
                h={10} 
                borderRadius="full" 
                bg="green.100" 
                align="center" 
                justify="center"
                fontSize="2xl"
              >
                🤖
              </Flex>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="lg" color="gray.900">
                  How to Build for Android
                </Text>
                <Text fontSize="sm" color="gray.500">
                  For Samsung, Pixel, OnePlus, and all Android devices
                </Text>
              </VStack>
            </HStack>
            <AccordionIcon color="gray.400" />
          </AccordionButton>
          <AccordionPanel py={6} px={6} borderTop="1px solid" borderColor="gray.200">
            <VStack align="stretch" spacing={6}>
              <Step
                number={1}
                title="Install Android Studio"
                description="Download Android Studio from developer.android.com. It's free and required for building Android apps. Also install Java JDK 17+."
              />
              <Step
                number={2}
                title="Build Web App and Sync to Capacitor"
                description="First build the React web app, then copy it to the Android project using Capacitor sync command."
                code={`# Build the React web app (creates dist/ folder)
npm run build

# Sync web assets to Android project
npx cap sync android

# This copies dist/ to android/app/src/main/assets/public/`}
              />
              <Step
                number={3}
                title="Create Signed AAB (App Bundle)"
                description="Build a signed Android App Bundle (.aab) for Google Play. The keystore is at android/app/keystores/. Version is set in android/app/build.gradle (currently versionCode 11, versionName 1.0.8)."
                code={`# Set JAVA_HOME to Android Studio's JDK
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

# Build signed release bundle
cd android && ./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
# Size: ~115 MB`}
              />
              <Step
                number={4}
                title="Upload to Google Play Console"
                description="Go to play.google.com/console. Create a new release and upload the .aab file. Start with 'Internal Testing' track, then promote to 'Open Testing' or 'Production'."
              />
            </VStack>
          </AccordionPanel>
        </AccordionItem>

        {/* React Guide */}
        <AccordionItem 
          border="1px solid" 
          borderColor="gray.200" 
          borderRadius="xl" 
          mb={4}
          overflow="hidden"
          bg="white"
          boxShadow="sm"
        >
          <AccordionButton 
            py={5} 
            px={6} 
            bg="gray.50"
            _hover={{ bg: 'gray.100' }}
            _expanded={{ bg: 'gray.50' }}
          >
            <HStack spacing={4} flex={1}>
              <Flex 
                w={10} 
                h={10} 
                borderRadius="full" 
                bg="blue.100" 
                align="center" 
                justify="center"
                fontSize="2xl"
              >
                ⚛️
              </Flex>
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold" fontSize="lg" color="gray.900">
                  How to Build React Web App
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Production build for website deployment
                </Text>
              </VStack>
            </HStack>
            <AccordionIcon color="gray.400" />
          </AccordionButton>
          <AccordionPanel py={6} px={6} borderTop="1px solid" borderColor="gray.200">
            <VStack align="stretch" spacing={6}>
              <Step
                number={1}
                title="Install Dependencies"
                description="Install all npm packages. Only needed first time or when package.json changes."
                code={`# Install all dependencies from package.json
npm install

# This creates node_modules/ folder with all packages`}
              />
              <Step
                number={2}
                title="Create Production Build"
                description="Build optimized, minified files for production. Uses Vite bundler. Also generates sitemap.xml and robots.txt via post-build scripts."
                code={`# Build command (defined in package.json)
npm run build

# What this runs:
# 1. vite build (creates dist/ folder with optimized JS/CSS)
# 2. node scripts/generate-sitemap.js
# 3. node scripts/generate-robots.js

# Output: dist/ folder (~4.8MB JS bundle gzipped)`}
              />
              <Step
                number={3}
                title="Test Locally Before Deploy"
                description="Preview the production build locally to verify everything works correctly."
                code={`# Start local preview server
npm run preview

# Opens at http://localhost:4173`}
              />
              <Step
                number={4}
                title="Deploy to Vercel"
                description="Push to GitHub and Vercel auto-deploys. Connected to main branch. Site: hushh.ai"
                code={`# Commit and push changes
git add .
git commit -m "Your commit message"
git push

# Vercel automatically deploys from GitHub
# Check: vercel.com/dashboard for build status`}
              />
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {/* Feedback Section */}
      <Box 
        mt={12} 
        p={6} 
        bg="gray.50" 
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.200"
      >
        <HStack justify="space-between" flexWrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" color="gray.900">Was this guide helpful? 🤔</Text>
            <Text fontSize="sm" color="gray.500">We value your feedback!</Text>
          </VStack>
          <HStack spacing={3}>
            <Box
              as="button"
              px={4}
              py={2}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              fontSize="sm"
              fontWeight="medium"
              transition="all 0.2s"
              _hover={{ borderColor: 'green.400' }}
            >
              👍 Yes
            </Box>
            <Box
              as="button"
              px={4}
              py={2}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              fontSize="sm"
              fontWeight="medium"
              transition="all 0.2s"
              _hover={{ borderColor: 'red.400' }}
            >
              👎 No
            </Box>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

// Main Page Component
const DeveloperDocsPage = () => {
  const [activeSection, setActiveSection] = useState('home');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex minH="100vh" bg="white">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          w="280px"
          flexShrink={0}
          bg="white"
          borderRight="1px solid"
          borderColor="gray.200"
          position="sticky"
          top="80px"
          h="calc(100vh - 80px)"
          overflowY="auto"
        >
          <Sidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
        </Box>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          aria-label="Open menu"
          icon={<FiMenu />}
          position="fixed"
          top="100px"
          left={4}
          zIndex={10}
          size="lg"
          bg="white"
          boxShadow="md"
          borderRadius="full"
          onClick={onOpen}
        />
      )}

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="white">
          <DrawerCloseButton />
          <DrawerBody p={0}>
            <Sidebar 
              activeSection={activeSection} 
              setActiveSection={(section) => {
                setActiveSection(section);
                onClose();
              }}
              isMobile
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box flex={1} bg="white" overflowY="auto">
        <MainContent activeSection={activeSection} />
      </Box>
    </Flex>
  );
};

export default DeveloperDocsPage;
