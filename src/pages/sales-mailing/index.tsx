/**
 * Hushh Sales Mailing Dashboard
 * 
 * Allows team members to send bulk personalized emails
 * to investors/leads using the Hushh Fund A template.
 * 
 * Flow: Dashboard → Supabase Edge Function → Cloud Run → Gmail API
 */

import React, { useState } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Button,
  useToast,
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Select,
  Collapse,
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

// Types
interface SendResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
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
const SALES_MAILER_URL = "https://xqgjqblobjrpqmwvlqof.supabase.co/functions/v1/sales-mailer";

// Known sender emails
const SENDER_OPTIONS = [
  { email: "manish@hushh.ai", name: "Manish Sainani" },
  { email: "ankit@hushh.ai", name: "Ankit Kumar Singh" },
  { email: "neelesh@hushh.ai", name: "Neelesh Meena" },
];

const SalesMailingPage: React.FC = () => {
  const toast = useToast();
  
  // Form state
  const [fromEmail, setFromEmail] = useState("");
  const [toEmails, setToEmails] = useState("");
  const [subject, setSubject] = useState("");
  
  // Template customization
  const [badgeText, setBadgeText] = useState("Hushh Fund A");
  const [subtitle, setSubtitle] = useState("ADFW Follow-up");
  const [introPrefix, setIntroPrefix] = useState(
    "We met briefly in Abu Dhabi during ADFW in December. I've been reflecting on our exchange around"
  );
  const [introHighlight, setIntroHighlight] = useState("long-duration capital");
  const [introSuffix, setIntroSuffix] = useState(
    "and how sovereign institutions are thinking about durability in the current productivity cycle."
  );
  const [ctaText, setCtaText] = useState("Connect");
  const [ctaUrl, setCtaUrl] = useState("https://calendly.com/hushh/office-hours-1-hour-focused-deep-dives");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SendResponse | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Parse recipient count
  const recipientCount = toEmails
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@")).length;

  // Send emails
  const handleSend = async () => {
    // Validation
    if (!fromEmail) {
      toast({
        title: "Missing Sender",
        description: "Please select or enter a sender email.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

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
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmails,
          salesData: {
            badgeText,
            subtitle,
            introPrefix,
            introHighlight,
            introSuffix,
            ctaText,
            ctaUrl,
            subject: subject || undefined,
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
    <Box bg="#050505" minH="100vh" py={8}>
      <Container maxW="900px">
        {/* Header */}
        <VStack spacing={2} mb={8} align="start">
          <HStack>
            <Heading size="lg" color="white">
              Hushh Sales Mailing
            </Heading>
            <Badge colorScheme="yellow" fontSize="xs">
              Fund A
            </Badge>
          </HStack>
          <Text color="gray.400" fontSize="sm">
            Send personalized bulk emails to investors and leads
          </Text>
        </VStack>

        {/* Main Form */}
        <VStack
          spacing={6}
          bg="#0f0f0f"
          p={6}
          borderRadius="lg"
          border="1px solid #1a1a1a"
        >
          {/* From Email */}
          <FormControl>
            <FormLabel color="white" fontSize="sm">
              From Email
            </FormLabel>
            <Select
              placeholder="Select sender..."
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              bg="#1a1a1a"
              border="1px solid #2a2a2a"
              color="white"
              _hover={{ borderColor: "#3a3a3a" }}
              _focus={{ borderColor: "#C4A661", boxShadow: "none" }}
            >
              {SENDER_OPTIONS.map((sender) => (
                <option key={sender.email} value={sender.email} style={{ background: "#1a1a1a" }}>
                  {sender.name} ({sender.email})
                </option>
              ))}
            </Select>
            <FormHelperText color="gray.500" fontSize="xs">
              Uses Gmail API with Domain-Wide Delegation
            </FormHelperText>
          </FormControl>

          {/* To Emails */}
          <FormControl>
            <FormLabel color="white" fontSize="sm">
              To (Recipients)
            </FormLabel>
            <Textarea
              placeholder="john@investor.com, jane@fund.com, bob@company.com"
              value={toEmails}
              onChange={(e) => setToEmails(e.target.value)}
              bg="#1a1a1a"
              border="1px solid #2a2a2a"
              color="white"
              rows={4}
              _hover={{ borderColor: "#3a3a3a" }}
              _focus={{ borderColor: "#C4A661", boxShadow: "none" }}
              _placeholder={{ color: "gray.600" }}
            />
            <FormHelperText color="gray.500" fontSize="xs">
              Comma-separated email addresses. Names extracted from emails (john.doe@x.com → John Doe)
            </FormHelperText>
            {recipientCount > 0 && (
              <Text color="#C4A661" fontSize="xs" mt={1}>
                {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} detected
              </Text>
            )}
          </FormControl>

          <Divider borderColor="#2a2a2a" />

          {/* Advanced Options Toggle */}
          <Box w="full">
            <Button
              variant="ghost"
              size="sm"
              color="gray.400"
              onClick={() => setShowAdvanced(!showAdvanced)}
              rightIcon={showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}
              _hover={{ color: "white", bg: "transparent" }}
            >
              Template Customization
            </Button>
          </Box>

          {/* Advanced Options */}
          <Collapse in={showAdvanced} animateOpacity style={{ width: "100%" }}>
            <VStack spacing={4} w="full" pt={2}>
              <HStack w="full" spacing={4}>
                <FormControl>
                  <FormLabel color="gray.300" fontSize="xs">
                    Badge Text
                  </FormLabel>
                  <Input
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    bg="#1a1a1a"
                    border="1px solid #2a2a2a"
                    color="white"
                    size="sm"
                    _hover={{ borderColor: "#3a3a3a" }}
                    _focus={{ borderColor: "#C4A661", boxShadow: "none" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="gray.300" fontSize="xs">
                    Subtitle
                  </FormLabel>
                  <Input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    bg="#1a1a1a"
                    border="1px solid #2a2a2a"
                    color="white"
                    size="sm"
                    _hover={{ borderColor: "#3a3a3a" }}
                    _focus={{ borderColor: "#C4A661", boxShadow: "none" }}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel color="gray.300" fontSize="xs">
                  Intro Highlight (underlined word/phrase)
                </FormLabel>
                <Input
                  value={introHighlight}
                  onChange={(e) => setIntroHighlight(e.target.value)}
                  bg="#1a1a1a"
                  border="1px solid #2a2a2a"
                  color="white"
                  size="sm"
                  _hover={{ borderColor: "#3a3a3a" }}
                  _focus={{ borderColor: "#C4A661", boxShadow: "none" }}
                />
              </FormControl>

              <HStack w="full" spacing={4}>
                <FormControl>
                  <FormLabel color="gray.300" fontSize="xs">
                    CTA Button Text
                  </FormLabel>
                  <Input
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    bg="#1a1a1a"
                    border="1px solid #2a2a2a"
                    color="white"
                    size="sm"
                    _hover={{ borderColor: "#3a3a3a" }}
                    _focus={{ borderColor: "#C4A661", boxShadow: "none" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color="gray.300" fontSize="xs">
                    CTA URL
                  </FormLabel>
                  <Input
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    bg="#1a1a1a"
                    border="1px solid #2a2a2a"
                    color="white"
                    size="sm"
                    _hover={{ borderColor: "#3a3a3a" }}
                    _focus={{ borderColor: "#C4A661", boxShadow: "none" }}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </Collapse>

          <Divider borderColor="#2a2a2a" />

          {/* Send Button */}
          <Button
            w="full"
            bg="#C4A661"
            color="black"
            fontWeight="bold"
            size="lg"
            onClick={handleSend}
            isLoading={isLoading}
            loadingText={`Sending to ${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}...`}
            _hover={{ bg: "#d4b671" }}
            _active={{ bg: "#b49651" }}
            isDisabled={!fromEmail || recipientCount === 0}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              `Send to ${recipientCount} Recipient${recipientCount !== 1 ? "s" : ""}`
            )}
          </Button>
        </VStack>

        {/* Results Table */}
        {results && (
          <Box mt={8}>
            <VStack
              spacing={4}
              bg="#0f0f0f"
              p={6}
              borderRadius="lg"
              border="1px solid #1a1a1a"
            >
              {/* Summary */}
              <HStack w="full" justify="space-between">
                <Heading size="md" color="white">
                  Results
                </Heading>
                <HStack spacing={4}>
                  <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                    ✓ Sent: {results.summary.sent}
                  </Badge>
                  {results.summary.failed > 0 && (
                    <Badge colorScheme="red" fontSize="sm" px={3} py={1}>
                      ✗ Failed: {results.summary.failed}
                    </Badge>
                  )}
                </HStack>
              </HStack>

              {/* Results Table */}
              <Box w="full" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th color="gray.500" borderColor="#2a2a2a">
                        Email
                      </Th>
                      <Th color="gray.500" borderColor="#2a2a2a">
                        Status
                      </Th>
                      <Th color="gray.500" borderColor="#2a2a2a">
                        Details
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {results.results.map((result, index) => (
                      <Tr key={index}>
                        <Td color="white" borderColor="#2a2a2a" fontSize="sm">
                          {result.email}
                        </Td>
                        <Td borderColor="#2a2a2a">
                          {result.success ? (
                            <Badge colorScheme="green" size="sm">
                              Sent
                            </Badge>
                          ) : (
                            <Badge colorScheme="red" size="sm">
                              Failed
                            </Badge>
                          )}
                        </Td>
                        <Td color="gray.400" borderColor="#2a2a2a" fontSize="xs">
                          {result.success
                            ? `ID: ${result.messageId?.slice(0, 16)}...`
                            : result.error || "Unknown error"}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </Box>
        )}

        {/* Footer Info */}
        <Box mt={8} textAlign="center">
          <Text color="gray.600" fontSize="xs">
            Powered by Supabase Edge Functions + Google Cloud Run + Gmail API
          </Text>
          <Text color="gray.600" fontSize="xs" mt={1}>
            Rate limited: 200ms delay between emails • Max 100 recipients per batch
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default SalesMailingPage;
