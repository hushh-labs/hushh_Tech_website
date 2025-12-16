'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  IconButton,
  Flex,
  SimpleGrid,
  useToast,
  FormControl,
  FormLabel,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, DownloadIcon } from '@chakra-ui/icons';
import html2canvas from 'html2canvas';
import ReceiptCard from '../../components/receipt/ReceiptCard';
import { generateReceiptData, parseAmount, ReceiptData } from '../../utils/receiptUtils';

interface RecipientInput {
  id: string;
  name: string;
  amount: string;
}

/**
 * Receipt Generator Page
 * Generate and download UPI payment receipts with same UI as Slice app
 */
const ReceiptGeneratorPage: React.FC = () => {
  const toast = useToast();
  
  // Form state
  const [recipients, setRecipients] = useState<RecipientInput[]>([
    { id: '1', name: '', amount: '' },
  ]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  
  // Generated receipts
  const [generatedReceipts, setGeneratedReceipts] = useState<ReceiptData[]>([]);
  
  // Refs for download
  const receiptRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Add new recipient row
  const handleAddRecipient = () => {
    setRecipients([
      ...recipients,
      { id: Date.now().toString(), name: '', amount: '' },
    ]);
  };

  // Remove recipient row
  const handleRemoveRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id));
    }
  };

  // Update recipient field
  const handleRecipientChange = (
    id: string,
    field: 'name' | 'amount',
    value: string
  ) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // Generate receipts from input
  const handleGenerateReceipts = () => {
    const validRecipients = recipients.filter(
      (r) => r.name.trim() && r.amount.trim()
    );

    if (validRecipients.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one recipient with name and amount',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    // Create date object from inputs
    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const receiptDate = new Date(year, month - 1, day, hours, minutes);

    // Generate receipt data for each recipient
    const receipts = validRecipients.map((r) =>
      generateReceiptData(r.name.trim(), parseAmount(r.amount), receiptDate)
    );

    setGeneratedReceipts(receipts);
    receiptRefs.current = new Array(receipts.length).fill(null);

    toast({
      title: 'Success',
      description: `Generated ${receipts.length} receipt(s)`,
      status: 'success',
      duration: 2000,
    });
  };

  // Download single receipt as PNG
  const handleDownloadReceipt = async (index: number) => {
    const element = receiptRefs.current[index];
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `receipt-${generatedReceipts[index].recipientName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: 'Downloaded',
        description: 'Receipt saved as PNG',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Download all receipts
  const handleDownloadAll = async () => {
    for (let i = 0; i < generatedReceipts.length; i++) {
      await handleDownloadReceipt(i);
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  // Copy handler
  const handleCopy = (text: string) => {
    toast({
      title: 'Copied',
      description: text.slice(0, 30) + '...',
      status: 'info',
      duration: 1500,
    });
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1200px">
        {/* Header */}
        <VStack spacing={2} mb={8} textAlign="center">
          <Heading size="lg" color="gray.800">
            Receipt Generator
          </Heading>
          <Text color="gray.600">
            Generate UPI payment receipts with custom details
          </Text>
        </VStack>

        {/* Input Form */}
        <Box bg="white" borderRadius="xl" p={6} mb={8} shadow="sm">
          <VStack spacing={6} align="stretch">
            {/* Date and Time */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">
                  Date
                </FormLabel>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  size="lg"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="gray.600">
                  Time
                </FormLabel>
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  size="lg"
                />
              </FormControl>
            </SimpleGrid>

            <Divider />

            {/* Recipients */}
            <Box>
              <Text fontWeight="600" mb={3} color="gray.700">
                Recipients
              </Text>
              <VStack spacing={3} align="stretch">
                {recipients.map((recipient, index) => (
                  <HStack key={recipient.id} spacing={3}>
                    <Input
                      placeholder="Name (e.g., Akshay Kumar)"
                      value={recipient.name}
                      onChange={(e) =>
                        handleRecipientChange(recipient.id, 'name', e.target.value)
                      }
                      size="lg"
                      flex={2}
                    />
                    <Input
                      placeholder="Amount (e.g., 20K or 20000)"
                      value={recipient.amount}
                      onChange={(e) =>
                        handleRecipientChange(recipient.id, 'amount', e.target.value)
                      }
                      size="lg"
                      flex={1}
                    />
                    <IconButton
                      aria-label="Remove recipient"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      isDisabled={recipients.length === 1}
                    />
                  </HStack>
                ))}
              </VStack>

              <Button
                leftIcon={<AddIcon />}
                variant="ghost"
                colorScheme="purple"
                mt={3}
                onClick={handleAddRecipient}
              >
                Add Recipient
              </Button>
            </Box>

            {/* Generate Button */}
            <Button
              colorScheme="purple"
              size="lg"
              onClick={handleGenerateReceipts}
              w="100%"
            >
              Generate Receipts
            </Button>
          </VStack>
        </Box>

        {/* Generated Receipts */}
        {generatedReceipts.length > 0 && (
          <Box>
            <Flex justify="space-between" align="center" mb={6}>
              <Heading size="md" color="gray.800">
                Generated Receipts ({generatedReceipts.length})
              </Heading>
              <Button
                leftIcon={<DownloadIcon />}
                colorScheme="green"
                onClick={handleDownloadAll}
              >
                Download All
              </Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {generatedReceipts.map((receipt, index) => (
                <Box key={index} position="relative">
                  {/* Receipt Card */}
                  <Box
                    ref={(el) => (receiptRefs.current[index] = el)}
                    shadow="lg"
                    borderRadius="xl"
                    overflow="hidden"
                  >
                    <ReceiptCard data={receipt} onCopy={handleCopy} />
                  </Box>

                  {/* Download Button */}
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="purple"
                    size="sm"
                    mt={3}
                    w="100%"
                    onClick={() => handleDownloadReceipt(index)}
                  >
                    Download PNG
                  </Button>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ReceiptGeneratorPage;
