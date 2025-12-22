'use client';

import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  OrderedList,
  ListItem,
  UnorderedList,
  Divider,
  Link,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Helmet } from 'react-helmet';

const DeleteAccountPage: React.FC = () => {
  const bgColor = useColorModeValue('#FAFAFA', '#0A0A0A');
  const cardBg = useColorModeValue('white', '#1A1A1A');
  const textColor = useColorModeValue('#1A1A1A', '#FAFAFA');
  const mutedColor = useColorModeValue('#6B7280', '#9CA3AF');

  return (
    <>
      <Helmet>
        <title>Delete Account - Hushh</title>
        <meta
          name="description"
          content="Learn how to delete your Hushh account and understand what data will be removed."
        />
      </Helmet>

      <Box bg={bgColor} minH="100vh">
        <Navbar />

        <Container maxW="container.md" py={{ base: 8, md: 16 }} px={{ base: 4, md: 6 }}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Heading
                as="h1"
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="600"
                color={textColor}
                mb={3}
              >
                Delete Your Hushh Account
              </Heading>
              <Text color={mutedColor} fontSize={{ base: 'md', md: 'lg' }}>
                Hushh Technologies - Account Deletion Request
              </Text>
            </Box>

            {/* Main Content Card */}
            <Box
              bg={cardBg}
              borderRadius="16px"
              p={{ base: 6, md: 8 }}
              boxShadow="sm"
            >
              <VStack spacing={6} align="stretch">
                {/* Introduction */}
                <Box>
                  <Text color={textColor} lineHeight="1.7">
                    At Hushh, we respect your privacy and your right to control your personal data.
                    This page explains how you can request the deletion of your Hushh account and
                    what happens to your data when you do.
                  </Text>
                </Box>

                <Divider />

                {/* How to Delete */}
                <Box>
                  <Heading as="h2" fontSize="xl" fontWeight="600" color={textColor} mb={4}>
                    How to Delete Your Account
                  </Heading>
                  <Text color={textColor} mb={4}>
                    You can delete your Hushh account directly from the app by following these steps:
                  </Text>
                  <OrderedList spacing={3} pl={4} color={textColor}>
                    <ListItem>
                      Open the Hushh app on your device
                    </ListItem>
                    <ListItem>
                      Tap the menu icon (hamburger menu) in the top navigation
                    </ListItem>
                    <ListItem>
                      Select "Delete Account" from the menu options
                    </ListItem>
                    <ListItem>
                      Read the warning message carefully
                    </ListItem>
                    <ListItem>
                      Type "DELETE" to confirm your decision
                    </ListItem>
                    <ListItem>
                      Tap the "Delete Account" button to permanently delete your account
                    </ListItem>
                  </OrderedList>
                </Box>

                <Divider />

                {/* Data That Will Be Deleted */}
                <Box>
                  <Heading as="h2" fontSize="xl" fontWeight="600" color={textColor} mb={4}>
                    Data That Will Be Permanently Deleted
                  </Heading>
                  <Text color={textColor} mb={4}>
                    When you delete your account, the following data will be permanently removed from our systems:
                  </Text>
                  <UnorderedList spacing={2} pl={4} color={textColor}>
                    <ListItem>Your account credentials and profile information</ListItem>
                    <ListItem>Your investor profile and preferences</ListItem>
                    <ListItem>Your onboarding data and responses</ListItem>
                    <ListItem>Your KYC verification data</ListItem>
                    <ListItem>Your privacy settings and preferences</ListItem>
                    <ListItem>Your chat history with our AI assistant</ListItem>
                    <ListItem>Any uploaded documents or files</ListItem>
                    <ListItem>Your data vault contents</ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                {/* Data Retention */}
                <Box>
                  <Heading as="h2" fontSize="xl" fontWeight="600" color={textColor} mb={4}>
                    Data Retention Policy
                  </Heading>
                  <Text color={textColor} mb={4}>
                    Upon account deletion:
                  </Text>
                  <UnorderedList spacing={2} pl={4} color={textColor}>
                    <ListItem>
                      <strong>Immediate deletion:</strong> All personal data, profile information, and user-generated content is deleted immediately upon confirmation.
                    </ListItem>
                    <ListItem>
                      <strong>Backup systems:</strong> Data may persist in encrypted backup systems for up to 30 days before being permanently purged.
                    </ListItem>
                    <ListItem>
                      <strong>Legal requirements:</strong> Certain transaction records may be retained for up to 7 years as required by financial regulations and tax laws.
                    </ListItem>
                    <ListItem>
                      <strong>Anonymized data:</strong> Aggregated, anonymized analytics data that cannot identify you may be retained for service improvement.
                    </ListItem>
                  </UnorderedList>
                </Box>

                <Divider />

                {/* Alternative Contact */}
                <Box>
                  <Heading as="h2" fontSize="xl" fontWeight="600" color={textColor} mb={4}>
                    Need Help?
                  </Heading>
                  <Text color={textColor} mb={4}>
                    If you are unable to access your account or need assistance with account deletion, you can contact us directly:
                  </Text>
                  <UnorderedList spacing={2} pl={4} color={textColor}>
                    <ListItem>
                      Email: <Link href="mailto:support@hushh.ai" color="blue.500">support@hushh.ai</Link>
                    </ListItem>
                    <ListItem>
                      Email: <Link href="mailto:privacy@hushh.ai" color="blue.500">privacy@hushh.ai</Link>
                    </ListItem>
                  </UnorderedList>
                  <Text color={mutedColor} fontSize="sm" mt={4}>
                    Please include "Account Deletion Request" in your email subject line along with the email address associated with your account.
                  </Text>
                </Box>

                <Divider />

                {/* Important Notice */}
                <Box
                  bg={useColorModeValue('#FEF2F2', '#2D1B1B')}
                  p={4}
                  borderRadius="12px"
                  border="1px solid"
                  borderColor={useColorModeValue('#FECACA', '#5C2828')}
                >
                  <Text color={useColorModeValue('#DC2626', '#F87171')} fontWeight="600" mb={2}>
                    Important Notice
                  </Text>
                  <Text color={textColor} fontSize="sm">
                    Account deletion is permanent and cannot be undone. Once deleted, you will lose access to all your data, investment information, and any services associated with your Hushh account. Please make sure to export any data you wish to keep before proceeding with deletion.
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Company Info */}
            <Box textAlign="center" py={4}>
              <Text color={mutedColor} fontSize="sm">
                Hushh Technologies Inc.
              </Text>
              <Text color={mutedColor} fontSize="sm">
                Your Data, Your Control, Your Profit
              </Text>
            </Box>
          </VStack>
        </Container>

        <Footer />
      </Box>
    </>
  );
};

export default DeleteAccountPage;
