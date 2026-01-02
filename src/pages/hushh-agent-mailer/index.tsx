/**
 * Hushh Agent Mailer Dashboard
 * Professional Mobile-First Design with Clean UI
 * 
 * Flow: Dashboard → Supabase Edge Function → Cloud Run → Gmail API
 * Route: /hushh-agent-mailer (protected - requires authentication)
 */

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Textarea,
  Button,
  useToast,
  Icon,
  Collapse,
  Spinner,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { ChevronRightIcon, LockIcon, CheckCircleIcon, RepeatIcon } from "@chakra-ui/icons";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  "https://ibsisfnjxeowvdtvgzff.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlic2lzZm5qeGVvd3ZkdHZnemZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTk1NzgsImV4cCI6MjA4MDEzNTU3OH0.K16sO1R9L2WZGPueDP0mArs2eDYZc-TnIk2LApDw_fs"
);

// Types
interface SendResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

interface EmailLog {
  id: string;
  sender_email: string;
  sender_name: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  status: string;
  gmail_message_id: string | null;
  error_message: string | null;
  created_at: string;
}

interface SendSummary {
  total: number;
  sent: number;
  failed: number;
}

interface SendResponse {
  success: boolean;
  summary: SendSummary;
  results: SendResult[];
  error?: string;
}

// Supabase Edge Function URL
const SALES_MAILER_URL = "https://ibsisfnjxeowvdtvgzff.supabase.co/functions/v1/sales-mailer";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlic2lzZm5qeGVvd3ZkdHZnemZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NTk1NzgsImV4cCI6MjA4MDEzNTU3OH0.K16sO1R9L2WZGPueDP0mArs2eDYZc-TnIk2LApDw_fs";

// Sender options
const SENDER_OPTIONS = [
  { email: "manish@hushh.ai", name: "Manish Sainani" },
  { email: "ankit@hushh.ai", name: "Ankit Kumar Singh" },
  { email: "neelesh@hushh.ai", name: "Neelesh Meena" },
];

// Design tokens matching Tailwind config
const colors = {
  primary: "#2f80ed",
  matteBlack: "#1a1a1a",
  charcoal: "#4a4a4a",
  offGrey: "#f5f5f7",
  borderGrey: "#e5e5e5",
  gray100: "#F3F4F6",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
};

const HushhAgentMailerPage: React.FC = () => {
  const toast = useToast();
  
  // View state
  const [activeView, setActiveView] = useState<"compose" | "logs">("compose");
  
  // Form state
  const [fromEmail, setFromEmail] = useState(SENDER_OPTIONS[0].email);
  const [toEmails, setToEmails] = useState("");
  
  // Template customization
  const [badgeText, setBadgeText] = useState("Hushh Fund A");
  const [subtitle, setSubtitle] = useState("ADFW Follow-up");
  const [introHighlight, setIntroHighlight] = useState("long-duration capital");
  const [ctaText, setCtaText] = useState("Connect");
  const [ctaUrl, setCtaUrl] = useState("https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [results, setResults] = useState<SendResponse | null>(null);
  
  // Logs state
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Parse recipient count
  const recipientCount = toEmails
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@")).length;

  // Fetch email logs
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('agent_mailer_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) {
        console.error('Error fetching logs:', error);
        return;
      }
      setEmailLogs(data || []);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Send emails
  const handleSend = async () => {
    if (recipientCount === 0) {
      toast({
        title: "No Recipients",
        description: "Please enter at least one recipient email.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch(SALES_MAILER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmails,
          salesData: {
            badgeText,
            subtitle,
            introHighlight,
            ctaText,
            ctaUrl,
          },
        }),
      });

      const data: SendResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send emails");
      }

      setResults(data);

      toast({
        title: "Emails Sent",
        description: `${data.summary.sent} of ${data.summary.total} emails sent successfully.`,
        status: data.summary.failed > 0 ? "warning" : "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send emails",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      bg="white"
      minH="100vh"
      fontFamily="'Inter', sans-serif"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent={{ base: "flex-start", sm: "center" }}
      py={{ base: 0, sm: 8 }}
    >
      <Box
        w="full"
        maxW="md"
        mx="auto"
        minH={{ base: "100vh", sm: "auto" }}
        display="flex"
        flexDirection="column"
        p={5}
        bg="white"
        borderRadius={{ base: 0, sm: "2xl" }}
        boxShadow={{ base: "none", sm: "0 2px 8px rgba(0, 0, 0, 0.04)" }}
        border={{ base: "none", sm: "1px solid" }}
        borderColor={{ base: "transparent", sm: "gray.100" }}
      >
        {/* Header */}
        <Box mb={6}>
          <VStack spacing={2} mb={3} align="flex-start">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              letterSpacing="tight"
              color={colors.matteBlack}
            >
              Hushh Agent Mailer
            </Text>
            <HStack spacing={2}>
              <Box
                px={2.5}
                py={1}
                borderRadius="full"
                fontSize="10px"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
                bg={colors.primary}
                color="white"
                boxShadow="sm"
              >
                AGENTIC
              </Box>
              <Box
                px={2.5}
                py={1}
                borderRadius="full"
                fontSize="10px"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
                border="1px solid"
                borderColor={colors.primary}
                color={colors.primary}
                bg="white"
                boxShadow="sm"
              >
                FUND A
              </Box>
            </HStack>
          </VStack>
          <Text
            color={colors.charcoal}
            fontSize="sm"
            lineHeight="relaxed"
            borderLeft="3px solid"
            borderColor={colors.primary}
            pl={3}
            py={0.5}
          >
            Send personalized bulk emails to investors and leads using AI-powered templates.
          </Text>
        </Box>

        {/* Compose/Logs Toggle */}
        <HStack spacing={3} mb={6}>
          <Button
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            px={4}
            py={2.5}
            borderRadius="lg"
            bg={activeView === "compose" ? colors.primary : "white"}
            color={activeView === "compose" ? "white" : colors.charcoal}
            border={activeView === "compose" ? "none" : "1px solid"}
            borderColor={colors.borderGrey}
            fontWeight="medium"
            fontSize="sm"
            boxShadow={activeView === "compose" ? "0 4px 14px 0 rgba(47, 128, 237, 0.3)" : "none"}
            _hover={{
              bg: activeView === "compose" ? "#2563eb" : colors.offGrey,
              color: activeView === "compose" ? "white" : colors.matteBlack,
            }}
            transition="all 0.2s"
            _active={{ transform: "scale(0.95)" }}
            onClick={() => setActiveView("compose")}
          >
            <Box as="span" fontSize="18px">✏️</Box>
            Compose
          </Button>
          <Button
            flex="none"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            px={4}
            py={2.5}
            borderRadius="lg"
            bg={activeView === "logs" ? colors.primary : "white"}
            color={activeView === "logs" ? "white" : colors.charcoal}
            border={activeView === "logs" ? "none" : "1px solid"}
            borderColor={colors.borderGrey}
            fontWeight="medium"
            fontSize="sm"
            boxShadow={activeView === "logs" ? "0 4px 14px 0 rgba(47, 128, 237, 0.3)" : "none"}
            _hover={{
              bg: activeView === "logs" ? "#2563eb" : colors.offGrey,
              color: activeView === "logs" ? "white" : colors.matteBlack,
            }}
            transition="all 0.2s"
            onClick={() => {
              setActiveView("logs");
              fetchLogs();
            }}
          >
            <Box as="span" fontSize="18px">🕐</Box>
            Logs
          </Button>
        </HStack>

        {/* Main Content */}
        <Box flex={1}>
          {activeView === "compose" ? (
            <VStack spacing={5} align="stretch">
              {/* From Email */}
              <VStack spacing={1.5} align="stretch">
                <Text
                  fontSize="xs"
                  fontWeight="bold"
                  textTransform="uppercase"
                  letterSpacing="wide"
                  color={colors.charcoal}
                >
                  From Email
                </Text>
                <Box position="relative">
                  <Box
                    as="select"
                    w="full"
                    pl={3.5}
                    pr={10}
                    py={3}
                    borderRadius="lg"
                    bg={colors.offGrey}
                    border="1px solid transparent"
                    color={colors.matteBlack}
                    fontWeight="medium"
                    fontSize="sm"
                    cursor="pointer"
                    appearance="none"
                    _hover={{ borderColor: colors.borderGrey }}
                    _focus={{
                      ring: 1,
                      ringColor: colors.primary,
                      borderColor: colors.primary,
                      bg: "white",
                    }}
                    transition="all 0.2s"
                    outline="none"
                    value={fromEmail}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFromEmail(e.target.value)}
                  >
                    {SENDER_OPTIONS.map((sender) => (
                      <option key={sender.email} value={sender.email}>
                        {sender.name} ({sender.email})
                      </option>
                    ))}
                  </Box>
                  <Box
                    position="absolute"
                    top="50%"
                    right={3}
                    transform="translateY(-50%)"
                    pointerEvents="none"
                    color={colors.charcoal}
                  >
                    <Text fontSize="lg">▾</Text>
                  </Box>
                </Box>
                <HStack spacing={1.5} px={1}>
                  <Icon as={CheckCircleIcon} boxSize="14px" color={colors.primary} />
                  <Text fontSize="10px" color={colors.gray500} fontWeight="medium">
                    Authenticated via Gmail Domain-Wide Delegation
                  </Text>
                </HStack>
              </VStack>

              {/* Recipients */}
              <VStack spacing={1.5} align="stretch">
                <HStack justify="space-between">
                  <Text
                    fontSize="xs"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wide"
                    color={colors.charcoal}
                  >
                    Recipients
                  </Text>
                  {recipientCount > 0 && (
                    <Box
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      fontSize="10px"
                      fontWeight="bold"
                      bg="blue.50"
                      color={colors.primary}
                      border="1px solid"
                      borderColor="rgba(47, 128, 237, 0.2)"
                    >
                      {recipientCount} RECIPIENT{recipientCount !== 1 ? "S" : ""}
                    </Box>
                  )}
                </HStack>
                <Box position="relative">
                  <Textarea
                    w="full"
                    p={3.5}
                    borderRadius="lg"
                    bg={colors.offGrey}
                    border="1px solid transparent"
                    color={colors.matteBlack}
                    fontFamily="mono"
                    fontSize="sm"
                    placeholder="Enter email addresses..."
                    _placeholder={{ color: colors.gray400 }}
                    _hover={{ borderColor: colors.borderGrey }}
                    _focus={{
                      ring: 1,
                      ringColor: colors.primary,
                      borderColor: colors.primary,
                      bg: "white",
                    }}
                    transition="all 0.2s"
                    outline="none"
                    resize="none"
                    rows={4}
                    lineHeight="relaxed"
                    value={toEmails}
                    onChange={(e) => setToEmails(e.target.value)}
                  />
                  <Box position="absolute" bottom={3} right={3}>
                    <HStack
                      spacing={1}
                      bg="white"
                      px={2}
                      py={1}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="rgba(47, 128, 237, 0.3)"
                      boxShadow="sm"
                      fontSize="10px"
                      fontWeight="bold"
                      color={colors.primary}
                    >
                      <Text>✨</Text>
                      <Text>AI PARSING</Text>
                    </HStack>
                  </Box>
                </Box>
                <Text fontSize="10px" color={colors.gray400} px={1}>
                  Comma-separated addresses.
                </Text>
              </VStack>

              {/* Divider */}
              <Box h="1px" w="full" bg={colors.borderGrey} />

              {/* Template Customization */}
              <Box
                cursor="pointer"
                borderRadius="lg"
                border="1px solid"
                borderColor={colors.borderGrey}
                p={3}
                _hover={{
                  borderColor: colors.primary,
                  bg: "rgba(47, 128, 237, 0.03)",
                }}
                transition="all 0.2s"
                onClick={() => setShowAdvanced(!showAdvanced)}
                role="group"
              >
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Box
                      p={2}
                      bg="blue.50"
                      borderRadius="md"
                      color={colors.primary}
                      _groupHover={{ bg: colors.primary, color: "white" }}
                      transition="all 0.2s"
                    >
                      <Text fontSize="18px">⚙️</Text>
                    </Box>
                    <VStack spacing={0} align="flex-start">
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={colors.matteBlack}
                        _groupHover={{ color: colors.primary }}
                        transition="all 0.2s"
                      >
                        Template Customization
                      </Text>
                      <Text fontSize="10px" color={colors.gray500}>
                        Edit variables and layout
                      </Text>
                    </VStack>
                  </HStack>
                  <Icon
                    as={ChevronRightIcon}
                    color={colors.gray400}
                    _groupHover={{ color: colors.primary }}
                    transform={showAdvanced ? "rotate(90deg)" : "rotate(0deg)"}
                    transition="all 0.3s"
                  />
                </HStack>
              </Box>

              {/* Advanced Options */}
              <Collapse in={showAdvanced} animateOpacity>
                <VStack spacing={3} pt={2} align="stretch">
                  <HStack spacing={3}>
                    <VStack flex={1} spacing={1} align="stretch">
                      <Text fontSize="10px" fontWeight="bold" color={colors.charcoal} textTransform="uppercase">
                        Badge Text
                      </Text>
                      <Box
                        as="input"
                        type="text"
                        value={badgeText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBadgeText(e.target.value)}
                        px={3}
                        py={2}
                        borderRadius="md"
                        bg={colors.offGrey}
                        border="1px solid transparent"
                        fontSize="sm"
                        _focus={{ borderColor: colors.primary, bg: "white" }}
                      />
                    </VStack>
                    <VStack flex={1} spacing={1} align="stretch">
                      <Text fontSize="10px" fontWeight="bold" color={colors.charcoal} textTransform="uppercase">
                        Subtitle
                      </Text>
                      <Box
                        as="input"
                        type="text"
                        value={subtitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubtitle(e.target.value)}
                        px={3}
                        py={2}
                        borderRadius="md"
                        bg={colors.offGrey}
                        border="1px solid transparent"
                        fontSize="sm"
                        _focus={{ borderColor: colors.primary, bg: "white" }}
                      />
                    </VStack>
                  </HStack>
                  <VStack spacing={1} align="stretch">
                    <Text fontSize="10px" fontWeight="bold" color={colors.charcoal} textTransform="uppercase">
                      Intro Highlight
                    </Text>
                    <Box
                      as="input"
                      type="text"
                      value={introHighlight}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIntroHighlight(e.target.value)}
                      px={3}
                      py={2}
                      borderRadius="md"
                      bg={colors.offGrey}
                      border="1px solid transparent"
                      fontSize="sm"
                      _focus={{ borderColor: colors.primary, bg: "white" }}
                    />
                  </VStack>
                  <HStack spacing={3}>
                    <VStack flex={1} spacing={1} align="stretch">
                      <Text fontSize="10px" fontWeight="bold" color={colors.charcoal} textTransform="uppercase">
                        CTA Text
                      </Text>
                      <Box
                        as="input"
                        type="text"
                        value={ctaText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCtaText(e.target.value)}
                        px={3}
                        py={2}
                        borderRadius="md"
                        bg={colors.offGrey}
                        border="1px solid transparent"
                        fontSize="sm"
                        _focus={{ borderColor: colors.primary, bg: "white" }}
                      />
                    </VStack>
                    <VStack flex={1} spacing={1} align="stretch">
                      <Text fontSize="10px" fontWeight="bold" color={colors.charcoal} textTransform="uppercase">
                        CTA URL
                      </Text>
                      <Box
                        as="input"
                        type="text"
                        value={ctaUrl}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCtaUrl(e.target.value)}
                        px={3}
                        py={2}
                        borderRadius="md"
                        bg={colors.offGrey}
                        border="1px solid transparent"
                        fontSize="sm"
                        _focus={{ borderColor: colors.primary, bg: "white" }}
                      />
                    </VStack>
                  </HStack>
                </VStack>
              </Collapse>

              {/* Results */}
              {results && (
                <Box
                  p={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor={colors.borderGrey}
                  bg={colors.offGrey}
                >
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="semibold" color={colors.matteBlack}>
                      Results
                    </Text>
                    <HStack spacing={2}>
                      <Badge colorScheme="green" px={2} py={0.5}>
                        ✓ Sent: {results.summary.sent}
                      </Badge>
                      {results.summary.failed > 0 && (
                        <Badge colorScheme="red" px={2} py={0.5}>
                          ✗ Failed: {results.summary.failed}
                        </Badge>
                      )}
                    </HStack>
                  </HStack>
                  <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                    {results.results.map((result, idx) => (
                      <HStack key={idx} justify="space-between" fontSize="sm">
                        <Text color={colors.charcoal} isTruncated maxW="60%">
                          {result.email}
                        </Text>
                        <Badge colorScheme={result.success ? "green" : "red"} size="sm">
                          {result.success ? "Sent" : "Failed"}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          ) : (
            /* Logs View */
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold" color={colors.matteBlack}>
                  Email Logs
                </Text>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={fetchLogs}
                  isLoading={isLoadingLogs}
                  leftIcon={<RepeatIcon />}
                >
                  Refresh
                </Button>
              </HStack>
              {isLoadingLogs ? (
                <Box textAlign="center" py={8}>
                  <Spinner color={colors.primary} />
                </Box>
              ) : emailLogs.length === 0 ? (
                <Text color={colors.gray500} textAlign="center" py={8}>
                  No emails sent yet. Send your first email!
                </Text>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color={colors.gray500} borderColor={colors.borderGrey}>Recipient</Th>
                        <Th color={colors.gray500} borderColor={colors.borderGrey}>Status</Th>
                        <Th color={colors.gray500} borderColor={colors.borderGrey}>Sent</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {emailLogs.map((log) => (
                        <Tr key={log.id}>
                          <Td color={colors.matteBlack} borderColor={colors.borderGrey} fontSize="sm">
                            {log.recipient_name || log.recipient_email}
                          </Td>
                          <Td borderColor={colors.borderGrey}>
                            <Badge colorScheme={log.status === 'SENT' ? 'green' : 'red'} size="sm">
                              {log.status}
                            </Badge>
                          </Td>
                          <Td color={colors.gray500} borderColor={colors.borderGrey} fontSize="xs">
                            {new Date(log.created_at).toLocaleDateString()}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          )}
        </Box>

        {/* Footer CTA */}
        {activeView === "compose" && (
          <Box
            mt="auto"
            pt={4}
            position={{ base: "sticky", sm: "static" }}
            bottom={0}
            bg={{ base: "rgba(255,255,255,0.9)", sm: "transparent" }}
            backdropFilter={{ base: "blur(8px)", sm: "none" }}
            pb={{ base: 24, sm: 0 }}
            borderTop={{ base: "1px solid", sm: "none" }}
            borderColor={{ base: colors.borderGrey, sm: "transparent" }}
            mx={{ base: -5, sm: 0 }}
            px={{ base: 5, sm: 0 }}
          >
            <Button
              w="full"
              bg={colors.primary}
              color="white"
              fontWeight="bold"
              py={3.5}
              h="auto"
              borderRadius="xl"
              boxShadow="0 4px 14px 0 rgba(47, 128, 237, 0.3)"
              fontSize="15px"
              _hover={{ bg: "#2563eb", boxShadow: "lg" }}
              transition="all 0.3s"
              onClick={handleSend}
              isLoading={isLoading}
              loadingText={`Sending to ${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}...`}
              isDisabled={recipientCount === 0}
              rightIcon={<Text fontSize="lg">➤</Text>}
              _disabled={{ bg: colors.primary, opacity: 0.5, cursor: "not-allowed" }}
            >
              Send to {recipientCount} Recipient{recipientCount !== 1 ? "s" : ""}
            </Button>
            <VStack mt={4} spacing={1}>
              <HStack spacing={1.5} opacity={0.6}>
                <Icon as={LockIcon} boxSize="12px" color={colors.matteBlack} />
                <Text fontSize="9px" textTransform="uppercase" letterSpacing="widest" color={colors.matteBlack} fontWeight="semibold">
                  Secure Agentic Workflow
                </Text>
              </HStack>
              <Text fontSize="10px" color={colors.gray400}>
                © 2024 Hushh.ai
              </Text>
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default HushhAgentMailerPage;
