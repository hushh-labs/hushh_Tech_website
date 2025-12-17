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
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
} from '@chakra-ui/react';

export interface CourseItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface AICourseBillData {
  customerName: string;
  invoiceDate: Date;
  invoiceNumber: string;
  courseName: string;
  courseProvider: string;
  courseDuration: string;
  items: CourseItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  customerAddress: string;
  corporateAddress: string;
  customerPhone: string;
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL';
  paymentMode?: string;
}

interface AICourseBillCardProps {
  data: AICourseBillData;
}

/**
 * AI Course Bill Card - Online Learning Platform Style
 */
const AICourseBillCard = forwardRef<HTMLDivElement, AICourseBillCardProps>(
  ({ data }, ref) => {
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    };

    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }).format(amount);
    };

    const getPaymentBadgeColor = () => {
      switch (data.paymentStatus) {
        case 'PAID': return 'green';
        case 'PENDING': return 'red';
        case 'PARTIAL': return 'orange';
        default: return 'gray';
      }
    };

    return (
      <Box
        ref={ref}
        bg="white"
        borderRadius="8px"
        overflow="hidden"
        maxW="550px"
        w="100%"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        border="1px solid"
        borderColor="gray.200"
        p={0}
      >
        {/* Header - Modern Tech Style */}
        <Box 
          bgGradient="linear(to-r, #7C3AED, #A855F7)" 
          px={6} 
          py={5}
        >
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="22px" fontWeight="700" color="white" letterSpacing="0.5px">
                🤖 AI Academy
              </Text>
              <Text fontSize="10px" color="whiteAlpha.800">
                Agent-to-Agent (A2A) Protocol Training
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="18px" fontWeight="600" color="white">
                TAX INVOICE
              </Text>
              <Badge colorScheme={getPaymentBadgeColor()} fontSize="10px" px={2}>
                {data.paymentStatus}
              </Badge>
            </VStack>
          </HStack>
        </Box>

        {/* Invoice Details */}
        <Box px={6} py={4} bg="purple.50" borderBottom="1px solid" borderColor="gray.200">
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="10px" color="gray.500" fontWeight="500">INVOICE NUMBER</Text>
              <Text fontSize="14px" color="gray.800" fontWeight="600">{data.invoiceNumber}</Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="10px" color="gray.500" fontWeight="500">INVOICE DATE</Text>
              <Text fontSize="14px" color="gray.800" fontWeight="600">{formatDate(data.invoiceDate)}</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Bill To Section */}
        <Box px={6} py={4} borderBottom="1px solid" borderColor="gray.200">
          <VStack align="flex-start" spacing={2}>
            <Text fontSize="11px" color="purple.600" fontWeight="600" textTransform="uppercase">
              BILLED TO
            </Text>
            <Box>
              <Text fontSize="14px" color="gray.800" fontWeight="600">{data.customerName}</Text>
              <Text fontSize="11px" color="gray.600" mt={1} lineHeight="1.6">
                {data.customerAddress}
              </Text>
              <Text fontSize="11px" color="gray.600" mt={2} lineHeight="1.6">
                <Text as="span" fontWeight="500">Corporate:</Text> {data.corporateAddress}
              </Text>
              <Text fontSize="11px" color="gray.600" mt={1}>
                Contact: {data.customerPhone}
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Course Details */}
        <Box px={6} py={4} bg="purple.50" borderBottom="1px solid" borderColor="gray.200">
          <Text fontSize="11px" color="purple.600" fontWeight="600" textTransform="uppercase" mb={2}>
            COURSE DETAILS
          </Text>
          <VStack align="flex-start" spacing={1}>
            <HStack>
              <Text fontSize="12px" color="gray.600" w="100px">Course:</Text>
              <Text fontSize="12px" color="gray.800" fontWeight="500">{data.courseName}</Text>
            </HStack>
            <HStack>
              <Text fontSize="12px" color="gray.600" w="100px">Provider:</Text>
              <Text fontSize="12px" color="gray.800" fontWeight="500">{data.courseProvider}</Text>
            </HStack>
            <HStack>
              <Text fontSize="12px" color="gray.600" w="100px">Duration:</Text>
              <Text fontSize="12px" color="gray.800" fontWeight="500">{data.courseDuration}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Items Table */}
        <Box px={4} py={4}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg="gray.100">
                <Th fontSize="10px" color="gray.600" py={3} borderColor="gray.200">DESCRIPTION</Th>
                <Th fontSize="10px" color="gray.600" py={3} textAlign="center" borderColor="gray.200">QTY</Th>
                <Th fontSize="10px" color="gray.600" py={3} textAlign="right" borderColor="gray.200">UNIT PRICE</Th>
                <Th fontSize="10px" color="gray.600" py={3} textAlign="right" borderColor="gray.200">AMOUNT</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.items.map((item, index) => (
                <Tr key={index}>
                  <Td fontSize="12px" color="gray.800" py={3} borderColor="gray.100">{item.description}</Td>
                  <Td fontSize="12px" color="gray.800" py={3} textAlign="center" borderColor="gray.100">{item.quantity}</Td>
                  <Td fontSize="12px" color="gray.800" py={3} textAlign="right" borderColor="gray.100">{formatCurrency(item.unitPrice)}</Td>
                  <Td fontSize="12px" color="gray.800" py={3} textAlign="right" fontWeight="500" borderColor="gray.100">{formatCurrency(item.amount)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Totals Section */}
        <Box px={6} py={4} borderTop="1px solid" borderColor="gray.200">
          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text fontSize="12px" color="gray.600">Subtotal</Text>
              <Text fontSize="12px" color="gray.800" fontWeight="500">{formatCurrency(data.subtotal)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="11px" color="gray.500">CGST @ 9%</Text>
              <Text fontSize="11px" color="gray.600">{formatCurrency(data.cgst)}</Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="11px" color="gray.500">SGST @ 9%</Text>
              <Text fontSize="11px" color="gray.600">{formatCurrency(data.sgst)}</Text>
            </HStack>
            
            <Divider my={1} />
            
            <HStack justify="space-between">
              <Text fontSize="16px" color="gray.800" fontWeight="700">TOTAL AMOUNT</Text>
              <Text fontSize="18px" color="purple.700" fontWeight="700">{formatCurrency(data.totalAmount)}</Text>
            </HStack>

            {data.paymentMode && (
              <HStack justify="space-between" mt={1}>
                <Text fontSize="11px" color="gray.500">Payment Mode</Text>
                <Text fontSize="11px" color="gray.700" fontWeight="500">{data.paymentMode}</Text>
              </HStack>
            )}
          </VStack>
        </Box>

        {/* Footer */}
        <Box px={6} py={4} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
          <VStack spacing={2}>
            <Text fontSize="10px" color="gray.500" textAlign="center">
              GSTIN: 27AABCA1234F1ZP | PAN: AABCA1234F
            </Text>
            <Text fontSize="10px" color="gray.500" textAlign="center">
              AI Academy | Hushh.ai, 1021 5th St W, Kirkland, WA 98033
            </Text>
            <Text fontSize="9px" color="gray.400" textAlign="center" mt={1}>
              This is a computer generated invoice and does not require physical signature
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }
);

AICourseBillCard.displayName = 'AICourseBillCard';

export default AICourseBillCard;
