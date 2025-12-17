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

export interface AICourseBillData {
  customerName: string;
  invoiceDate: Date;
  invoiceNumber: string;
  courseName: string;
  courseDescription: string;
  courseDuration: string;
  courseFee: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  companyName: string;
  companyAddress: string;
  gstin: string;
  customerAddress: string;
  customerEmail: string;
  customerContact: string;
  enrollmentId: string;
}

interface AICourseBillCardProps {
  data: AICourseBillData;
}

/**
 * AI Course Bill Card - Official Black & White A4 Format
 * Training/Course Invoice Style
 */
const AICourseBillCard = forwardRef<HTMLDivElement, AICourseBillCardProps>(
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
              <Text fontSize="26px" fontWeight="bold" letterSpacing="1px">
                {data.companyName}
              </Text>
              <Text fontSize="12px">AI & Technology Training Institute</Text>
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

        {/* Student / Billing Details */}
        <HStack justify="space-between" mb={6} spacing={8}>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">BILL TO (STUDENT DETAILS)</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="35%">Name:</Td>
                  <Td p={1} fontSize="11px">{data.customerName}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Enrollment ID:</Td>
                  <Td p={1} fontSize="11px">{data.enrollmentId}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" verticalAlign="top">Address:</Td>
                  <Td p={1} fontSize="11px">{data.customerAddress}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Email:</Td>
                  <Td p={1} fontSize="11px">{data.customerEmail}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Contact:</Td>
                  <Td p={1} fontSize="11px">{data.customerContact}</Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
          <Box flex={1} border="1px solid black" p={3}>
            <Text fontSize="10px" fontWeight="bold" mb={2} textDecoration="underline">COURSE DETAILS</Text>
            <Table variant="unstyled" size="sm">
              <Tbody>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" w="35%">Course:</Td>
                  <Td p={1} fontSize="11px">{data.courseName}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold" verticalAlign="top">Description:</Td>
                  <Td p={1} fontSize="11px">{data.courseDescription}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Duration:</Td>
                  <Td p={1} fontSize="11px">{data.courseDuration}</Td>
                </Tr>
                <Tr>
                  <Td p={1} fontSize="11px" fontWeight="bold">Mode:</Td>
                  <Td p={1} fontSize="11px">Online + Live Sessions</Td>
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
                  {data.courseName}<br/>
                  <Text fontSize="10px" color="gray.600">{data.courseDescription}</Text>
                  <Text fontSize="10px" color="gray.600">Duration: {data.courseDuration}</Text>
                  <Text fontSize="10px" color="gray.600">Includes: Video Lectures, Assignments, Certificate</Text>
                </Td>
                <Td border="1px solid black" fontSize="11px" p={2}>999293</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="center">1</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.courseFee.toFixed(2)}</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.courseFee.toFixed(2)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Tax & Total */}
        <Flex justify="flex-end" mb={6}>
          <Table variant="simple" size="sm" border="1px solid black" maxW="400px">
            <Tbody>
              <Tr>
                <Td border="1px solid black" fontSize="11px" p={2}>Course Fee (Taxable)</Td>
                <Td border="1px solid black" fontSize="11px" p={2} textAlign="right">{data.courseFee.toFixed(2)}</Td>
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
                <Td p={1} fontSize="11px" fontWeight="bold">Account Name:</Td>
                <Td p={1} fontSize="11px">{data.companyName}</Td>
              </Tr>
              <Tr>
                <Td p={1} fontSize="11px" fontWeight="bold">Account No:</Td>
                <Td p={1} fontSize="11px">50100XXXXXXXX</Td>
              </Tr>
              <Tr>
                <Td p={1} fontSize="11px" fontWeight="bold">IFSC Code:</Td>
                <Td p={1} fontSize="11px">HDFC0001234</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Course Access Info */}
        <Box mb={6} p={3} border="1px solid black" bg="gray.50">
          <Text fontSize="11px" fontWeight="bold" mb={2}>COURSE ACCESS INFORMATION</Text>
          <Text fontSize="10px">• Login credentials will be sent to registered email within 24 hours</Text>
          <Text fontSize="10px">• Access to course portal: https://academy.hushh.ai</Text>
          <Text fontSize="10px">• Course materials are accessible for 12 months from enrollment date</Text>
          <Text fontSize="10px">• Certificate will be issued upon successful completion</Text>
        </Box>

        {/* Terms */}
        <Box mb={6}>
          <Text fontSize="10px" fontWeight="bold" mb={1}>Terms & Conditions:</Text>
          <Text fontSize="9px">• Course fee is non-refundable once access is granted</Text>
          <Text fontSize="9px">• Course materials are for personal use only and cannot be shared</Text>
          <Text fontSize="9px">• Subject to Pune Jurisdiction</Text>
        </Box>

        {/* Footer */}
        <Box borderTop="1px solid black" pt={4} mt="auto">
          <Flex justify="space-between" align="flex-end">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="10px">Support: support@hushhacademy.ai</Text>
              <Text fontSize="10px">Contact: +91 8004482372</Text>
              <Text fontSize="10px">Website: www.hushhacademy.ai</Text>
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

AICourseBillCard.displayName = 'AICourseBillCard';

export default AICourseBillCard;
