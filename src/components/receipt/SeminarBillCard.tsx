'use client';

import React, { forwardRef } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
} from '@chakra-ui/react';

export interface SeminarBillData {
  customerName: string;
  invoiceDate: Date;
  invoiceNumber: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  registrationFee: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  companyName: string;
  companyAddress: string;
  gstin: string;
  customerAddress: string;
  customerContact: string;
}

interface SeminarBillCardProps {
  data: SeminarBillData;
}

/**
 * Seminar Bill Card - Official Black & White A4 Format
 * Conference/Seminar Invoice Style
 */
const SeminarBillCard = forwardRef<HTMLDivElement, SeminarBillCardProps>(
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
                {data.companyName}
              </Text>
              <Text fontSize="12px">Event Management & Travel Services</Text>
              <Text fontSize="11px">{data.companyAddress}</Text>
              <Text fontSize="11px">GSTIN: {data.gstin}</Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Box border="2px solid black" px={4} py={2}>
                <Text fontSize="16px" fontWeight="bold">TAX INVOICE</Text>
              </Box>
              <Text fontSize="11px" mt={2}>Invoice No: {data.invoiceNumber}</Text>
              <Text fontSize="11px">Date: {formatDate(data.invoiceDate)}</Text>
            </VStack>
          </Flex>
        </Box>

        {/* Bill To / Ship To */}
        <HStack justify="space-between" mb={6} spacing={8}>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">BILL TO</Text>
            <Text fontSize="12px" fontWeight="bold">{data.customerName}</Text>
            <Text fontSize="11px" mt={1}>{data.customerAddress}</Text>
            <Text fontSize="11px" mt={1}>Contact: {data.customerContact}</Text>
          </Box>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">EVENT DETAILS</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="35%">Event:</Td>
                  <Td p={1} fontSize="11px">{data.eventName}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Date:</Td>
                  <Td p={1} fontSize="11px">{data.eventDate}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Venue:</Td>
                  <Td p={1} fontSize="11px">{data.eventVenue}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </HStack>

        {/* Service Details */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">SERVICE DETAILS</Text>
          <Table variant="simple" size="sm" border="1px solid black">
            <Thead>
              <Tr bg="gray.100">
                <Th border="1px solid black" fontSize="10px" p={2}>S.No.</Th>
                <Th border="1px solid black" fontSize="10px" p={2}>Description</Th>
                <Th border="1px solid black" fontSize="10px" p={2}>HSN/SAC</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="center">Qty</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="right">Rate (₹)</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="right">Amount (₹)</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>1</Td>
                <Td border="1px solid black" fontSize="11px" p={2}>
                  Conference Registration Fee<br/>
                  <Text fontSize="10px" color="gray.600">{data.eventName}</Text>
                  <Text fontSize="10px" color="gray.600">Includes: Entry, Materials, Lunch & Networking</Text>
                </Td>
                <Td border="1px solid black" fontSize="11px" p={2}>998596</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="center">1</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.registrationFee.toFixed(2)}</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.registrationFee.toFixed(2)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Tax & Total */}
        <Flex justify="flex-end" mb={6}>
          <Table variant="simple" size="sm" border="1px solid black" maxW="400px">
            <Tbody>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>Taxable Amount</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.registrationFee.toFixed(2)}</Td>
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
        </Flex>

        {/* Amount in Words */}
        <Box mb={6} p={3} border="1px solid black">
          <Text fontSize="11px">
            <Text as="span" fontWeight="bold">Amount in Words: </Text>
            Rupees {numberToWords(Math.floor(data.totalAmount))} Only
          </Text>
        </Box>

        {/* Bank Details */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">BANK DETAILS FOR PAYMENT</Text>
          <Table variant="unstyled" size="sm" maxW="400px">
            <Tbody>
              <Tr>
                <Td p={1} fontSize="11px" fontWeight="bold" w="35%">Bank Name:</Td>
                <Td p={1} fontSize="11px">HDFC Bank</Td>
              </Tr>
              <Tr>
                <Td p={1} fontSize="11px" fontWeight="bold">Account No:</Td>
                <Td p={1} fontSize="11px">50100XXXXXXXX</Td>
              </Tr>
              <Tr>
                <Td p={1} fontSize="11px" fontWeight="bold">IFSC Code:</Td>
                <Td p={1} fontSize="11px">HDFC0001234</Td>
              </Tr>
              <Tr>
                <Td p={1} fontSize="11px" fontWeight="bold">Branch:</Td>
                <Td p={1} fontSize="11px">Kirkland, WA</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Terms */}
        <Box mb={6}>
          <Text fontSize="10px" fontWeight="bold" mb={1}>Terms & Conditions:</Text>
          <Text fontSize="9px">• Registration is non-refundable and non-transferable</Text>
          <Text fontSize="9px">• Entry is subject to valid ID proof</Text>
          <Text fontSize="9px">• Organizers reserve the right to modify the program</Text>
          <Text fontSize="9px">• Subject to Pune Jurisdiction</Text>
        </Box>

        {/* Footer */}
        <Box borderTop="1px solid black" pt={4} mt="auto">
          <Flex justify="space-between" align="flex-end">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="10px">For queries: +91 8004482372</Text>
              <Text fontSize="10px">Email: events@travelplus.com</Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="10px" mb={8}>For {data.companyName}</Text>
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

SeminarBillCard.displayName = 'SeminarBillCard';

export default SeminarBillCard;
