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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, DownloadIcon } from '@chakra-ui/icons';
import html2canvas from 'html2canvas';
import ReceiptCard from '../../components/receipt/ReceiptCard';
import WiFiBillCard, { WiFiBillData } from '../../components/receipt/WiFiBillCard';
import FoodBillCard, { FoodBillData } from '../../components/receipt/FoodBillCard';
import SeminarBillCard, { SeminarBillData } from '../../components/receipt/SeminarBillCard';
import ElectricityBillCard, { ElectricityBillData } from '../../components/receipt/ElectricityBillCard';
import AICourseBillCard, { AICourseBillData } from '../../components/receipt/AICourseBillCard';
import {
  generateReceiptData,
  parseAmount,
  ReceiptData,
  generateWiFiBillData,
  generateFoodBillData,
  generateSeminarBillData,
  generateElectricityBillData,
  generateAICourseBillData,
  calculateGrandTotal,
} from '../../utils/receiptUtils';

interface RecipientInput {
  id: string;
  name: string;
  amount: string;
}

/**
 * Receipt Generator Page
 * Generate and download UPI payment receipts, WiFi bills, Food bills, and Seminar invoices
 */
const ReceiptGeneratorPage: React.FC = () => {
  const toast = useToast();

  // Common state - Default date: 28 November 2025
  const [selectedDate, setSelectedDate] = useState<string>('2025-11-28');
  const [selectedTime, setSelectedTime] = useState<string>('14:30');
  const [customerName] = useState<string>('Ankit Kumar Singh');

  // UPI Receipt state
  const [recipients, setRecipients] = useState<RecipientInput[]>([
    { id: '1', name: '', amount: '' },
  ]);
  const [generatedReceipts, setGeneratedReceipts] = useState<ReceiptData[]>([]);

  // Bill states - All 5 bill types
  const [wifiBill, setWifiBill] = useState<WiFiBillData | null>(null);
  const [foodBill, setFoodBill] = useState<FoodBillData | null>(null);
  const [seminarBill, setSeminarBill] = useState<SeminarBillData | null>(null);
  const [electricityBill, setElectricityBill] = useState<ElectricityBillData | null>(null);
  const [aiCourseBill, setAICourseBill] = useState<AICourseBillData | null>(null);

  // Refs for download
  const receiptRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wifiBillRef = useRef<HTMLDivElement | null>(null);
  const foodBillRef = useRef<HTMLDivElement | null>(null);
  const seminarBillRef = useRef<HTMLDivElement | null>(null);
  const electricityBillRef = useRef<HTMLDivElement | null>(null);
  const aiCourseBillRef = useRef<HTMLDivElement | null>(null);

  // Helper to create date from inputs
  const getDateFromInputs = (): Date => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  // ============================================
  // UPI RECEIPT HANDLERS
  // ============================================

  const handleAddRecipient = () => {
    setRecipients([
      ...recipients,
      { id: Date.now().toString(), name: '', amount: '' },
    ]);
  };

  const handleRemoveRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((r) => r.id !== id));
    }
  };

  const handleRecipientChange = (
    id: string,
    field: 'name' | 'amount',
    value: string
  ) => {
    setRecipients(
      recipients.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

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

    const receiptDate = getDateFromInputs();
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

  // ============================================
  // WIFI BILL HANDLERS
  // ============================================

  const handleGenerateWiFiBill = () => {
    const billDate = getDateFromInputs();
    const bill = generateWiFiBillData(customerName, billDate);
    setWifiBill(bill);

    toast({
      title: 'WiFi Bill Generated',
      description: `Total: ₹${bill.totalAmount.toFixed(2)}`,
      status: 'success',
      duration: 2000,
    });
  };

  // ============================================
  // FOOD BILL HANDLERS
  // ============================================

  const handleGenerateFoodBill = () => {
    const billDate = getDateFromInputs();
    const bill = generateFoodBillData(customerName, billDate);
    setFoodBill(bill);

    toast({
      title: 'Food Bill Generated',
      description: `Total: ₹${bill.totalAmount.toFixed(2)}`,
      status: 'success',
      duration: 2000,
    });
  };

  // ============================================
  // SEMINAR BILL HANDLERS
  // ============================================

  const handleGenerateSeminarBill = () => {
    const invoiceDate = getDateFromInputs();
    const bill = generateSeminarBillData(customerName, invoiceDate);
    setSeminarBill(bill);

    toast({
      title: 'Seminar Invoice Generated',
      description: `Total: ₹${bill.totalAmount.toFixed(2)}`,
      status: 'success',
      duration: 2000,
    });
  };

  // ============================================
  // ELECTRICITY BILL HANDLERS
  // ============================================

  const handleGenerateElectricityBill = () => {
    const billDate = getDateFromInputs();
    const bill = generateElectricityBillData(customerName, billDate);
    setElectricityBill(bill);

    toast({
      title: 'Electricity Bill Generated',
      description: `Total: ₹${bill.totalAmount.toFixed(2)}`,
      status: 'success',
      duration: 2000,
    });
  };

  // ============================================
  // AI COURSE BILL HANDLERS
  // ============================================

  const handleGenerateAICourseBill = () => {
    const invoiceDate = getDateFromInputs();
    const bill = generateAICourseBillData(customerName, invoiceDate);
    setAICourseBill(bill);

    toast({
      title: 'AI Course Invoice Generated',
      description: `Total: ₹${bill.totalAmount.toFixed(2)}`,
      status: 'success',
      duration: 2000,
    });
  };

  // ============================================
  // GENERATE ALL 5 BILLS
  // ============================================

  const handleGenerateAllBills = () => {
    const billDate = getDateFromInputs();

    const wifi = generateWiFiBillData(customerName, billDate);
    const food = generateFoodBillData(customerName, billDate);
    const seminar = generateSeminarBillData(customerName, billDate);
    const electricity = generateElectricityBillData(customerName, billDate);
    const aiCourse = generateAICourseBillData(customerName, billDate);

    setWifiBill(wifi);
    setFoodBill(food);
    setSeminarBill(seminar);
    setElectricityBill(electricity);
    setAICourseBill(aiCourse);

    const grandTotal = calculateGrandTotal(wifi, food, seminar, electricity, aiCourse);

    toast({
      title: 'All 5 Bills Generated!',
      description: `Grand Total: ₹${grandTotal.toFixed(2)}`,
      status: 'success',
      duration: 3000,
    });
  };

  // ============================================
  // DOWNLOAD HANDLERS
  // ============================================

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

  const handleDownloadBill = async (
    ref: React.RefObject<HTMLDivElement>,
    filename: string
  ) => {
    if (!ref.current) return;

    try {
      const canvas = await html2canvas(ref.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: 'Downloaded',
        description: `${filename} saved as PNG`,
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download bill',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDownloadAllBills = async () => {
    if (wifiBill) {
      await handleDownloadBill(wifiBillRef as React.RefObject<HTMLDivElement>, 'wifi-bill-hathway');
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (foodBill) {
      await handleDownloadBill(foodBillRef as React.RefObject<HTMLDivElement>, 'food-bill-apoorva');
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (seminarBill) {
      await handleDownloadBill(seminarBillRef as React.RefObject<HTMLDivElement>, 'seminar-invoice-travelplus');
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (electricityBill) {
      await handleDownloadBill(electricityBillRef as React.RefObject<HTMLDivElement>, 'electricity-bill-msedcl');
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (aiCourseBill) {
      await handleDownloadBill(aiCourseBillRef as React.RefObject<HTMLDivElement>, 'ai-course-invoice-a2a');
    }
  };

  const handleCopy = (text: string) => {
    toast({
      title: 'Copied',
      description: text.slice(0, 30) + '...',
      status: 'info',
      duration: 1500,
    });
  };

  // Calculate grand total for all 5 bills
  const grandTotal = calculateGrandTotal(wifiBill, foodBill, seminarBill, electricityBill, aiCourseBill);

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="1400px">
        {/* Header */}
        <VStack spacing={2} mb={8} textAlign="center">
          <Heading size="lg" color="gray.800">
            Multi-Bill Generator
          </Heading>
          <Text color="gray.600">
            Generate UPI receipts, WiFi bills, Food bills, and Seminar invoices
          </Text>
        </VStack>

        {/* Common Date/Time Picker */}
        <Box bg="white" borderRadius="xl" p={6} mb={6} shadow="sm">
          <Heading size="sm" mb={4} color="gray.700">
            📅 Bill Date & Time (Common for all)
          </Heading>
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

          <Divider my={4} />

          {/* Customer Info Display */}
          <Box bg="blue.50" p={4} borderRadius="lg">
            <Text fontSize="sm" color="blue.800" fontWeight="600" mb={2}>
              📋 Invoice To: {customerName}
            </Text>
            <Text fontSize="xs" color="blue.700">
              Residential: Row house 7, matra montana, dhanori, pune, maharastra
            </Text>
            <Text fontSize="xs" color="blue.700">
              Corporate: Hushh.ai, 1021 5th St W, Kirkland, WA 98033
            </Text>
            <Text fontSize="xs" color="blue.700">
              Contact: +91 8004482372
            </Text>
          </Box>

          <Divider my={4} />

          {/* Quick Generate All Button */}
          <Button
            colorScheme="green"
            size="lg"
            w="100%"
            onClick={handleGenerateAllBills}
            leftIcon={<Text>🚀</Text>}
          >
            Generate All 5 Bills (₹2,804 + ₹2,635 + ₹5,273 + ₹2,472 + ₹2,800 = ₹15,984)
          </Button>
        </Box>

        {/* Grand Total Display */}
        {grandTotal > 0 && (
          <Alert status="success" mb={6} borderRadius="lg">
            <AlertIcon />
            <HStack justify="space-between" w="100%">
              <Text fontWeight="600">
                Grand Total: ₹{grandTotal.toFixed(2)}
              </Text>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<DownloadIcon />}
                onClick={handleDownloadAllBills}
              >
                Download All Bills
              </Button>
            </HStack>
          </Alert>
        )}

        {/* Tabs for Different Bill Types */}
        <Tabs colorScheme="purple" variant="enclosed">
          <TabList>
            <Tab>
              📱 UPI Receipt
              <Badge ml={2} colorScheme="purple" fontSize="xs">
                Slice
              </Badge>
            </Tab>
            <Tab>
              📶 WiFi Bill
              <Badge ml={2} colorScheme="red" fontSize="xs">
                Hathway
              </Badge>
            </Tab>
            <Tab>
              🍽️ Food Bill
              <Badge ml={2} colorScheme="orange" fontSize="xs">
                Apoorva
              </Badge>
            </Tab>
            <Tab>
              🎤 Seminar
              <Badge ml={2} colorScheme="blue" fontSize="xs">
                TravelPlus
              </Badge>
            </Tab>
            <Tab>
              ⚡ Electricity
              <Badge ml={2} colorScheme="cyan" fontSize="xs">
                MSEDCL
              </Badge>
            </Tab>
            <Tab>
              🤖 AI Course
              <Badge ml={2} colorScheme="purple" fontSize="xs">
                Udemy
              </Badge>
            </Tab>
          </TabList>

          <TabPanels>
            {/* UPI Receipt Tab */}
            <TabPanel px={0}>
              <Box bg="white" borderRadius="xl" p={6} shadow="sm">
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Text fontWeight="600" mb={3} color="gray.700">
                      Recipients
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {recipients.map((recipient) => (
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

                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={handleGenerateReceipts}
                    w="100%"
                  >
                    Generate UPI Receipts
                  </Button>
                </VStack>
              </Box>

              {/* Generated Receipts */}
              {generatedReceipts.length > 0 && (
                <Box mt={6}>
                  <Flex justify="space-between" align="center" mb={6}>
                    <Heading size="md" color="gray.800">
                      Generated Receipts ({generatedReceipts.length})
                    </Heading>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {generatedReceipts.map((receipt, index) => (
                      <Box key={index} position="relative">
                        <Box
                          ref={(el) => (receiptRefs.current[index] = el)}
                          shadow="lg"
                          borderRadius="xl"
                          overflow="hidden"
                        >
                          <ReceiptCard data={receipt} onCopy={handleCopy} />
                        </Box>
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
            </TabPanel>

            {/* WiFi Bill Tab */}
            <TabPanel px={0}>
              <Box bg="white" borderRadius="xl" p={6} shadow="sm" mb={6}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="600" color="gray.700">
                        Hathway Internet Bill
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        100 Mbps Unlimited Plan (incl. 18% GST)
                      </Text>
                    </Box>
                    <Badge colorScheme="red" fontSize="md" px={3} py={1}>
                      ₹2,804
                    </Badge>
                  </HStack>

                  <Button
                    colorScheme="red"
                    size="lg"
                    onClick={handleGenerateWiFiBill}
                    w="100%"
                  >
                    Generate WiFi Bill
                  </Button>
                </VStack>
              </Box>

              {wifiBill && (
                <Box>
                  <Flex justify="center" mb={4}>
                    <Box
                      ref={wifiBillRef}
                      shadow="lg"
                      borderRadius="xl"
                      overflow="hidden"
                    >
                      <WiFiBillCard data={wifiBill} />
                    </Box>
                  </Flex>
                  <Flex justify="center">
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="red"
                      onClick={() =>
                        handleDownloadBill(wifiBillRef as React.RefObject<HTMLDivElement>, 'wifi-bill-hathway')
                      }
                    >
                      Download WiFi Bill
                    </Button>
                  </Flex>
                </Box>
              )}
            </TabPanel>

            {/* Food Bill Tab */}
            <TabPanel px={0}>
              <Box bg="white" borderRadius="xl" p={6} shadow="sm" mb={6}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="600" color="gray.700">
                        Apoorva Delicacies Food Bill
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Restaurant bill with 5% GST
                      </Text>
                    </Box>
                    <Badge colorScheme="orange" fontSize="md" px={3} py={1}>
                      ₹2,635
                    </Badge>
                  </HStack>

                  <Button
                    colorScheme="orange"
                    size="lg"
                    onClick={handleGenerateFoodBill}
                    w="100%"
                  >
                    Generate Food Bill
                  </Button>
                </VStack>
              </Box>

              {foodBill && (
                <Box>
                  <Flex justify="center" mb={4}>
                    <Box
                      ref={foodBillRef}
                      shadow="lg"
                      borderRadius="xl"
                      overflow="hidden"
                    >
                      <FoodBillCard data={foodBill} />
                    </Box>
                  </Flex>
                  <Flex justify="center">
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="orange"
                      onClick={() =>
                        handleDownloadBill(foodBillRef as React.RefObject<HTMLDivElement>, 'food-bill-apoorva')
                      }
                    >
                      Download Food Bill
                    </Button>
                  </Flex>
                </Box>
              )}
            </TabPanel>

            {/* Seminar Bill Tab */}
            <TabPanel px={0}>
              <Box bg="white" borderRadius="xl" p={6} shadow="sm" mb={6}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="600" color="gray.700">
                        TravelPlus Conference Invoice (HALF)
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        AI & Data Privacy Summit 2024 - 18% GST
                      </Text>
                    </Box>
                    <Badge colorScheme="blue" fontSize="md" px={3} py={1}>
                      ₹5,273
                    </Badge>
                  </HStack>

                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleGenerateSeminarBill}
                    w="100%"
                  >
                    Generate Seminar Invoice
                  </Button>
                </VStack>
              </Box>

              {seminarBill && (
                <Box>
                  <Flex justify="center" mb={4}>
                    <Box
                      ref={seminarBillRef}
                      shadow="lg"
                      borderRadius="xl"
                      overflow="hidden"
                    >
                      <SeminarBillCard data={seminarBill} />
                    </Box>
                  </Flex>
                  <Flex justify="center">
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="blue"
                      onClick={() =>
                        handleDownloadBill(seminarBillRef as React.RefObject<HTMLDivElement>, 'seminar-invoice-travelplus')
                      }
                    >
                      Download Seminar Invoice
                    </Button>
                  </Flex>
                </Box>
              )}
            </TabPanel>

            {/* Electricity Bill Tab */}
            <TabPanel px={0}>
              <Box bg="white" borderRadius="xl" p={6} shadow="sm" mb={6}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="600" color="gray.700">
                        MSEDCL Electricity Bill
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Maharashtra State Electricity Distribution
                      </Text>
                    </Box>
                    <Badge colorScheme="cyan" fontSize="md" px={3} py={1}>
                      ₹2,472
                    </Badge>
                  </HStack>

                  <Button
                    colorScheme="cyan"
                    size="lg"
                    onClick={handleGenerateElectricityBill}
                    w="100%"
                  >
                    Generate Electricity Bill
                  </Button>
                </VStack>
              </Box>

              {electricityBill && (
                <Box>
                  <Flex justify="center" mb={4}>
                    <Box
                      ref={electricityBillRef}
                      shadow="lg"
                      borderRadius="xl"
                      overflow="hidden"
                    >
                      <ElectricityBillCard data={electricityBill} />
                    </Box>
                  </Flex>
                  <Flex justify="center">
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="cyan"
                      onClick={() =>
                        handleDownloadBill(electricityBillRef as React.RefObject<HTMLDivElement>, 'electricity-bill-msedcl')
                      }
                    >
                      Download Electricity Bill
                    </Button>
                  </Flex>
                </Box>
              )}
            </TabPanel>

            {/* AI Course Bill Tab */}
            <TabPanel px={0}>
              <Box bg="white" borderRadius="xl" p={6} shadow="sm" mb={6}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="600" color="gray.700">
                        Udemy - A2A Protocol Course
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Agentic AI Masterclass (incl. 18% GST)
                      </Text>
                    </Box>
                    <Badge colorScheme="purple" fontSize="md" px={3} py={1}>
                      ₹2,800
                    </Badge>
                  </HStack>

                  <Button
                    colorScheme="purple"
                    size="lg"
                    onClick={handleGenerateAICourseBill}
                    w="100%"
                  >
                    Generate AI Course Invoice
                  </Button>
                </VStack>
              </Box>

              {aiCourseBill && (
                <Box>
                  <Flex justify="center" mb={4}>
                    <Box
                      ref={aiCourseBillRef}
                      shadow="lg"
                      borderRadius="xl"
                      overflow="hidden"
                    >
                      <AICourseBillCard data={aiCourseBill} />
                    </Box>
                  </Flex>
                  <Flex justify="center">
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="purple"
                      onClick={() =>
                        handleDownloadBill(aiCourseBillRef as React.RefObject<HTMLDivElement>, 'udemy-course-invoice')
                      }
                    >
                      Download AI Course Invoice
                    </Button>
                  </Flex>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Summary Section - All 5 Bills */}
        {(wifiBill || foodBill || seminarBill || electricityBill || aiCourseBill) && (
          <Box bg="white" borderRadius="xl" p={6} mt={8} shadow="sm">
            <Heading size="md" mb={4} color="gray.800">
              📊 Bill Summary
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
              {wifiBill && (
                <Box p={4} bg="red.50" borderRadius="lg">
                  <Text fontSize="sm" color="red.600" fontWeight="600">
                    📶 WiFi Bill
                  </Text>
                  <Text fontSize="xl" fontWeight="700" color="red.700">
                    ₹{wifiBill.totalAmount.toFixed(2)}
                  </Text>
                </Box>
              )}
              {foodBill && (
                <Box p={4} bg="orange.50" borderRadius="lg">
                  <Text fontSize="sm" color="orange.600" fontWeight="600">
                    🍽️ Food Bill
                  </Text>
                  <Text fontSize="xl" fontWeight="700" color="orange.700">
                    ₹{foodBill.totalAmount.toFixed(2)}
                  </Text>
                </Box>
              )}
              {seminarBill && (
                <Box p={4} bg="blue.50" borderRadius="lg">
                  <Text fontSize="sm" color="blue.600" fontWeight="600">
                    🎤 Seminar Invoice
                  </Text>
                  <Text fontSize="xl" fontWeight="700" color="blue.700">
                    ₹{seminarBill.totalAmount.toFixed(2)}
                  </Text>
                </Box>
              )}
              {electricityBill && (
                <Box p={4} bg="cyan.50" borderRadius="lg">
                  <Text fontSize="sm" color="cyan.600" fontWeight="600">
                    ⚡ Electricity Bill
                  </Text>
                  <Text fontSize="xl" fontWeight="700" color="cyan.700">
                    ₹{electricityBill.totalAmount.toFixed(2)}
                  </Text>
                </Box>
              )}
              {aiCourseBill && (
                <Box p={4} bg="purple.50" borderRadius="lg">
                  <Text fontSize="sm" color="purple.600" fontWeight="600">
                    🤖 AI Course
                  </Text>
                  <Text fontSize="xl" fontWeight="700" color="purple.700">
                    ₹{aiCourseBill.totalAmount.toFixed(2)}
                  </Text>
                </Box>
              )}
            </SimpleGrid>

            <Divider my={4} />

            <Flex justify="space-between" align="center">
              <Text fontSize="xl" fontWeight="700" color="gray.800">
                Grand Total (5 Bills)
              </Text>
              <Text fontSize="2xl" fontWeight="700" color="green.600">
                ₹{grandTotal.toFixed(2)}
              </Text>
            </Flex>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ReceiptGeneratorPage;
