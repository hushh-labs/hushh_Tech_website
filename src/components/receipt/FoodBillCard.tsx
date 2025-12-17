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

export interface FoodItem {
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface FoodBillData {
  customerName: string;
  billDate: Date;
  billNumber: string;
  items: FoodItem[];
  subTotal: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  restaurantName: string;
  restaurantAddress: string;
  gstin: string;
  tableNumber?: string;
}

interface FoodBillCardProps {
  data: FoodBillData;
}

/**
 * Food Bill Card - Official Black & White A4 Format
 * Restaurant Bill Style
 */
const FoodBillCard = forwardRef<HTMLDivElement, FoodBillCardProps>(
  ({ data }, ref) => {
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const formatTime = (date: Date): string => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
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
        <Box borderBottom="2px solid black" pb={4} mb={4} textAlign="center">
          <Text fontSize="28px" fontWeight="bold" letterSpacing="2px">
            {data.restaurantName}
          </Text>
          <Text fontSize="12px" mt={1}>
            {data.restaurantAddress}
          </Text>
          <Text fontSize="11px" mt={1}>
            GSTIN: {data.gstin}
          </Text>
          <Box border="2px solid black" display="inline-block" px={4} py={2} mt={3}>
            <Text fontSize="16px" fontWeight="bold">TAX INVOICE</Text>
          </Box>
        </Box>

        {/* Bill Info */}
        <HStack justify="space-between" mb={6} spacing={8}>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">BILL DETAILS</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="40%">Bill No:</Td>
                  <Td p={1} fontSize="11px">{data.billNumber}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Date:</Td>
                  <Td p={1} fontSize="11px">{formatDate(data.billDate)}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Time:</Td>
                  <Td p={1} fontSize="11px">{formatTime(data.billDate)}</Td>
                </Tr>
                {data.tableNumber && (
                  <Tr>
                    <Td p={1} fontSize="11px" fontWeight="bold">Table No:</Td>
                    <Td p={1} fontSize="11px">{data.tableNumber}</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">CUSTOMER DETAILS</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="30%">Name:</Td>
                  <Td p={1} fontSize="11px">{data.customerName}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Mode:</Td>
                  <Td p={1} fontSize="11px">Dine-In</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </HStack>

        {/* Items Table */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">ORDER DETAILS</Text>
          <Table variant="simple" size="sm" border="1px solid black">
            <Thead>
              <Tr bg="gray.100">
                <Th border="1px solid black" fontSize="10px" p={2}>S.No.</Th>
                <Th border="1px solid black" fontSize="10px" p={2}>Item Description</Th>
                <Th border="1px solid black" fontSize="10px" p={2}>HSN/SAC</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="center">Qty</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="right">Rate (₹)</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="right">Amount (₹)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.items.map((item, index) => (
                <Tr key={index}>
                  <Td border="1px solid black" fontSize="11px" p={2}>{index + 1}</Td>
                  <Td border="1px solid black" fontSize="11px" p={2}>{item.name}</Td>
                  <Td border="1px solid black" fontSize="11px" p={2}>996331</Td>
                  <Td border="1px solid black" fontSize="11px" p={2} textAlign="center">{item.quantity}</Td>
                  <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{item.rate.toFixed(2)}</Td>
                  <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{item.amount.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Tax & Total */}
        <Flex justify="flex-end" mb={6}>
          <Table variant="simple" size="sm" border="1px solid black" maxW="350px">
            <Tbody>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>Sub Total</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.subTotal.toFixed(2)}</Td>
              </Tr>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>CGST @ 2.5%</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.cgst.toFixed(2)}</Td>
              </Tr>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>SGST @ 2.5%</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.sgst.toFixed(2)}</Td>
              </Tr>
              <Tr bg="gray.100">
                <Td border="1px solid black" fontSize="12px" p={2} fontWeight="bold">GRAND TOTAL</Td>
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

        {/* Payment Info */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">PAYMENT DETAILS</Text>
          <Table variant="unstyled" size="sm" maxW="300px">
            <Tbody>
              <Tr>
                <Td p={1} fontSize="11px" fontWeight="bold">Payment Mode:</Td>
                <Td p={1} fontSize="11px">Cash / UPI / Card</Td>
              </Tr>
              <Tr>
                <Td p={1} fontSize="11px" fontWeight="bold">Payment Status:</Td>
                <Td p={1} fontSize="11px">PAID</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Terms */}
        <Box mb={6}>
          <Text fontSize="10px" fontWeight="bold" mb={1}>Terms & Conditions:</Text>
          <Text fontSize="9px">• Goods once sold will not be taken back or exchanged</Text>
          <Text fontSize="9px">• Subject to Pune Jurisdiction</Text>
        </Box>

        {/* Footer */}
        <Box borderTop="1px solid black" pt={4} mt="auto">
          <Flex justify="space-between" align="flex-end">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="10px">Thank you for dining with us!</Text>
              <Text fontSize="10px">Visit Again!</Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="10px" mb={8}>For {data.restaurantName}</Text>
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

FoodBillCard.displayName = 'FoodBillCard';

export default FoodBillCard;
