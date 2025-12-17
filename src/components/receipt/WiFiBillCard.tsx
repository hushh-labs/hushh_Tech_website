'use client';

import React, { forwardRef } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Divider,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
} from '@chakra-ui/react';

export interface WiFiBillData {
  customerName: string;
  billDate: Date;
  billNumber: string;
  planName: string;
  planSpeed: string;
  monthlyCharge: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  dueDate: Date;
  customerId: string;
  connectionAddress: string;
  billingPeriod: string;
}

interface WiFiBillCardProps {
  data: WiFiBillData;
}

/**
 * WiFi Bill Card - Official Black & White A4 Format
 * Hathway Internet Bill Style
 */
const WiFiBillCard = forwardRef<HTMLDivElement, WiFiBillCardProps>(
  ({ data }, ref) => {
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount: number): string => {
      return `₹${amount.toFixed(2)}`;
    };

    return (
      <Box
        ref={ref}
        bg="white"
        w="210mm"
        minH="297mm"
        fontFamily="'Times New Roman', Times, serif"
        border="1px solid black"
        p="15mm"
        color="black"
        sx={{
          '@media print': {
            width: '210mm',
            minHeight: '297mm',
          },
        }}
      >
        {/* Header */}
        <Box borderBottom="2px solid black" pb={4} mb={4}>
          <Flex justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="28px" fontWeight="bold" letterSpacing="2px">
                HATHWAY
              </Text>
              <Text fontSize="12px">Digital Cable Network Pvt. Ltd.</Text>
              <Text fontSize="11px">CIN: U64200MH2001PTC132576</Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Box border="2px solid black" px={4} py={2}>
                <Text fontSize="16px" fontWeight="bold">TAX INVOICE</Text>
              </Box>
              <Text fontSize="11px">GSTIN: 27AAACH7756R1ZW</Text>
              <Text fontSize="11px">PAN: AAACH7756R</Text>
            </VStack>
          </Flex>
          <Text fontSize="11px" mt={2}>
            Regd. Office: Unit 1, Techniplex-1, Techniplex Complex, Off Veer Savarkar Flyover, Goregaon (West), Mumbai - 400062
          </Text>
        </Box>

        {/* Bill Details */}
        <HStack justify="space-between" mb={6} spacing={8}>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">BILL DETAILS</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="40%">Bill Number:</Td>
                  <Td p={1} fontSize="11px">{data.billNumber}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Bill Date:</Td>
                  <Td p={1} fontSize="11px">{formatDate(data.billDate)}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Due Date:</Td>
                  <Td p={1} fontSize="11px">{formatDate(data.dueDate)}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Billing Period:</Td>
                  <Td p={1} fontSize="11px">{data.billingPeriod}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">CUSTOMER DETAILS</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="40%">Customer ID:</Td>
                  <Td p={1} fontSize="11px">{data.customerId}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Name:</Td>
                  <Td p={1} fontSize="11px">{data.customerName}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" verticalAlign="top">Address:</Td>
                  <Td p={1} fontSize="11px">{data.connectionAddress}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </HStack>

        {/* Plan Details */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">SUBSCRIPTION DETAILS</Text>
          <Table variant="simple" size="sm" border="1px solid black">
            <Thead>
              <Tr bg="gray.100">
                <Th border="1px solid black" fontSize="10px" p={2}>S.No.</Th>
                <Th border="1px solid black" fontSize="10px" p={2}>Description</Th>
                <Th border="1px solid black" fontSize="10px" p={2}>HSN/SAC</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="right">Amount (₹)</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>1</Td>
                <Td border="1px solid black" fontSize="11px" p={2}>
                  {data.planName} - {data.planSpeed}<br/>
                  <Text fontSize="10px" color="gray.600">Monthly Internet Subscription Charges</Text>
                </Td>
                <Td border="1px solid black" fontSize="11px" p={2}>998422</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.monthlyCharge.toFixed(2)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Tax Breakdown */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">TAX DETAILS</Text>
          <Table variant="simple" size="sm" border="1px solid black" maxW="400px">
            <Tbody>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>Taxable Amount</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.monthlyCharge.toFixed(2)}</Td>
              </Tr>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>CGST @ 9%</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.cgst.toFixed(2)}</Td>
              </Tr>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>SGST @ 9%</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.sgst.toFixed(2)}</Td>
              </Tr>
              <Tr bg="gray.100">
                <Td border="1px solid black" fontSize="12px" p={2} fontWeight="bold">TOTAL AMOUNT</Td>
                <Td border="1px solid black" fontSize="12px" p={2} textAlign="right" fontWeight="bold">{formatCurrency(data.totalAmount)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Amount in Words */}
        <Box mb={6} p={3} border="1px solid black">
          <Text fontSize="11px">
            <Text as="span" fontWeight="bold">Amount in Words: </Text>
            Rupees {numberToWords(Math.floor(data.totalAmount))} Only
          </Text>
        </Box>

        {/* Payment Info */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">PAYMENT INFORMATION</Text>
          <Text fontSize="11px" mb={1}>• Payment can be made via UPI, Net Banking, Credit/Debit Card, or Cash</Text>
          <Text fontSize="11px" mb={1}>• Late payment may attract penalty charges</Text>
          <Text fontSize="11px">• For online payment: Visit www.hathway.com or use Hathway App</Text>
        </Box>

        {/* Footer */}
        <Box borderTop="1px solid black" pt={4} mt="auto">
          <Flex justify="space-between" align="flex-end">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="10px">Customer Care: 1800-419-6666 (Toll Free)</Text>
              <Text fontSize="10px">Email: support@hathway.com</Text>
              <Text fontSize="10px">Website: www.hathway.com</Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="10px" mb={8}>For Hathway Digital Cable Network Pvt. Ltd.</Text>
              <Text fontSize="10px" fontStyle="italic">Authorized Signatory</Text>
            </VStack>
          </Flex>
          <Text fontSize="9px" textAlign="center" mt={4} color="gray.600">
            This is a computer generated invoice and does not require physical signature.
          </Text>
        </Box>
      </Box>
    );
  }
);

// Helper function to convert number to words
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  if (num < 20) return ones[num];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
}

WiFiBillCard.displayName = 'WiFiBillCard';

export default WiFiBillCard;
