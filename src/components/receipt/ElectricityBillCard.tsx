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

export interface ElectricityBillData {
  customerName: string;
  billDate: Date;
  billNumber: string;
  consumerNumber: string;
  meterNumber: string;
  connectionType: string;
  billingPeriod: string;
  unitsConsumed: number;
  ratePerUnit: number;
  energyCharges: number;
  fixedCharges: number;
  electricityDuty: number;
  totalAmount: number;
  dueDate: Date;
  customerAddress: string;
  sanctionedLoad: string;
}

interface ElectricityBillCardProps {
  data: ElectricityBillData;
}

/**
 * Electricity Bill Card - Official Black & White A4 Format
 * MSEDCL Style
 */
const ElectricityBillCard = forwardRef<HTMLDivElement, ElectricityBillCardProps>(
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
              <Text fontSize="24px" fontWeight="bold" letterSpacing="1px">
                MSEDCL
              </Text>
              <Text fontSize="14px" fontWeight="bold">
                Maharashtra State Electricity Distribution Co. Ltd.
              </Text>
              <Text fontSize="11px">Prakashganga, Plot No. G-9, Anant Kanekar Marg</Text>
              <Text fontSize="11px">Bandra (East), Mumbai - 400051</Text>
              <Text fontSize="11px">CIN: U40109MH2005SGC153645</Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Box border="2px solid black" px={4} py={2}>
                <Text fontSize="16px" fontWeight="bold">ELECTRICITY BILL</Text>
              </Box>
              <Text fontSize="11px" mt={2}>Bill No: {data.billNumber}</Text>
              <Text fontSize="11px">Bill Date: {formatDate(data.billDate)}</Text>
            </VStack>
          </Flex>
        </Box>

        {/* Consumer Details */}
        <HStack justify="space-between" mb={6} spacing={8}>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">CONSUMER DETAILS</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="45%">Consumer No:</Td>
                  <Td p={1} fontSize="11px">{data.consumerNumber}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Name:</Td>
                  <Td p={1} fontSize="11px">{data.customerName}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" verticalAlign="top">Address:</Td>
                  <Td p={1} fontSize="11px">{data.customerAddress}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">CONNECTION DETAILS</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="45%">Meter No:</Td>
                  <Td p={1} fontSize="11px">{data.meterNumber}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Connection Type:</Td>
                  <Td p={1} fontSize="11px">{data.connectionType}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Sanctioned Load:</Td>
                  <Td p={1} fontSize="11px">{data.sanctionedLoad}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Billing Period:</Td>
                  <Td p={1} fontSize="11px">{data.billingPeriod}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </HStack>

        {/* Meter Reading */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">CONSUMPTION DETAILS</Text>
          <Table variant="simple" size="sm" border="1px solid black" maxW="500px">
            <Thead>
              <Tr bg="gray.100">
                <Th border="1px solid black" fontSize="10px" p={2}>Description</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="right">Units/Rate</Th>
                <Th border="1px solid black" fontSize="10px" p={2} textAlign="right">Amount (₹)</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>Units Consumed</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.unitsConsumed} kWh</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">-</Td>
              </Tr>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>Energy Charges @ ₹{data.ratePerUnit}/unit</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.unitsConsumed} x {data.ratePerUnit}</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.energyCharges.toFixed(2)}</Td>
              </Tr>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>Fixed Charges</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">-</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.fixedCharges.toFixed(2)}</Td>
              </Tr>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>Electricity Duty</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">-</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.electricityDuty.toFixed(2)}</Td>
              </Tr>
              <Tr bg="gray.100">
                <Td border="1px solid black" fontSize="12px" p={2} fontWeight="bold" colSpan={2}>TOTAL AMOUNT PAYABLE</Td>
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

        {/* Due Date */}
        <Box mb={6} p={3} border="2px solid black" maxW="300px">
          <HStack justify="space-between">
            <Text fontSize="12px" fontWeight="bold">Due Date:</Text>
            <Text fontSize="12px" fontWeight="bold">{formatDate(data.dueDate)}</Text>
          </HStack>
          <Text fontSize="10px" mt={1} color="gray.600">Late payment surcharge applicable after due date</Text>
        </Box>

        {/* Payment Options */}
        <Box mb={6}>
          <Text fontSize="12px" fontWeight="bold" mb={2} textDecoration="underline">PAYMENT OPTIONS</Text>
          <Text fontSize="11px" mb={1}>• Online: www.mahadiscom.in</Text>
          <Text fontSize="11px" mb={1}>• MSEDCL Mobile App</Text>
          <Text fontSize="11px" mb={1}>• MSEDCL Cash Collection Centers</Text>
          <Text fontSize="11px" mb={1}>• Authorized Banks and Payment Gateways</Text>
          <Text fontSize="11px">• UPI / Net Banking / Credit-Debit Card</Text>
        </Box>

        {/* Important Notes */}
        <Box mb={6}>
          <Text fontSize="10px" fontWeight="bold" mb={1}>Important Notes:</Text>
          <Text fontSize="9px">• Please pay before due date to avoid disconnection</Text>
          <Text fontSize="9px">• Keep this bill for reference</Text>
          <Text fontSize="9px">• For complaints: 1912 (Toll Free)</Text>
          <Text fontSize="9px">• Subject to Maharashtra Electricity Regulatory Commission guidelines</Text>
        </Box>

        {/* Footer */}
        <Box borderTop="1px solid black" pt={4} mt="auto">
          <Flex justify="space-between" align="flex-end">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="10px">24x7 Helpline: 1912 (Toll Free)</Text>
              <Text fontSize="10px">Email: customercare@mahadiscom.in</Text>
              <Text fontSize="10px">Website: www.mahadiscom.in</Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="10px" mb={8}>For MSEDCL</Text>
              <Text fontSize="10px" fontStyle="italic">Authorized Signatory</Text>
            </VStack>
          </Flex>
          <Text fontSize="9px" textAlign="center" mt={4} color="gray.600">
            This is a computer generated bill and does not require physical signature.
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

ElectricityBillCard.displayName = 'ElectricityBillCard';

export default ElectricityBillCard;
