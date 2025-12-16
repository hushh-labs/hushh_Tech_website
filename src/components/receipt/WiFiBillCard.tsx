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
 * WiFi Bill Card - Hathway Internet Bill Style
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
        borderRadius="8px"
        overflow="hidden"
        maxW="450px"
        w="100%"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        border="1px solid"
        borderColor="gray.200"
        p={0}
      >
        {/* Header - Hathway Style */}
        <Box bg="#E53935" px={5} py={4}>
          <HStack justify="space-between" align="center">
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="22px" fontWeight="700" color="white" letterSpacing="1px">
                HATHWAY
              </Text>
              <Text fontSize="10px" color="white" opacity={0.9}>
                Digital Cable Network
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={0}>
              <Text fontSize="11px" color="white" fontWeight="500">
                TAX INVOICE
              </Text>
              <Text fontSize="10px" color="white" opacity={0.8}>
                GSTIN: 27AAACH7756R1ZW
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Bill Info Section */}
        <Box px={5} py={4} bg="gray.50">
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="11px" color="gray.500" fontWeight="500">
                BILL NUMBER
              </Text>
              <Text fontSize="13px" color="gray.800" fontWeight="600">
                {data.billNumber}
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="11px" color="gray.500" fontWeight="500">
                BILL DATE
              </Text>
              <Text fontSize="13px" color="gray.800" fontWeight="600">
                {formatDate(data.billDate)}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Divider />

        {/* Customer Details */}
        <Box px={5} py={4}>
          <Text fontSize="11px" color="gray.500" fontWeight="500" mb={2}>
            CUSTOMER DETAILS
          </Text>
          <VStack align="flex-start" spacing={2}>
            <Box>
              <Text fontSize="14px" color="gray.800" fontWeight="600">
                {data.customerName}
              </Text>
              <Text fontSize="12px" color="gray.600" mt={1}>
                Customer ID: {data.customerId}
              </Text>
            </Box>
            <Text fontSize="12px" color="gray.600" lineHeight="1.5">
              {data.connectionAddress}
            </Text>
          </VStack>
        </Box>

        <Divider />

        {/* Plan Details */}
        <Box px={5} py={4}>
          <Text fontSize="11px" color="gray.500" fontWeight="500" mb={3}>
            PLAN DETAILS
          </Text>
          <HStack justify="space-between" bg="red.50" p={3} borderRadius="6px">
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="13px" color="gray.800" fontWeight="600">
                {data.planName}
              </Text>
              <Text fontSize="11px" color="gray.600">
                {data.planSpeed}
              </Text>
            </VStack>
            <Text fontSize="12px" color="gray.600">
              Billing Period: {data.billingPeriod}
            </Text>
          </HStack>
        </Box>

        <Divider />

        {/* Charges Breakdown */}
        <Box px={5} py={4}>
          <Text fontSize="11px" color="gray.500" fontWeight="500" mb={3}>
            CHARGES BREAKDOWN
          </Text>
          <Table variant="unstyled" size="sm">
            <Tbody>
              <Tr>
                <Td px={0} py={2} fontSize="13px" color="gray.700">
                  Monthly Subscription Charge
                </Td>
                <Td px={0} py={2} fontSize="13px" color="gray.800" textAlign="right" fontWeight="500">
                  {formatCurrency(data.monthlyCharge)}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} fontSize="13px" color="gray.700">
                  CGST @ 9%
                </Td>
                <Td px={0} py={2} fontSize="13px" color="gray.800" textAlign="right" fontWeight="500">
                  {formatCurrency(data.cgst)}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} fontSize="13px" color="gray.700">
                  SGST @ 9%
                </Td>
                <Td px={0} py={2} fontSize="13px" color="gray.800" textAlign="right" fontWeight="500">
                  {formatCurrency(data.sgst)}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Total Amount */}
        <Box px={5} py={4} bg="#E53935">
          <Flex justify="space-between" align="center">
            <Text fontSize="14px" color="white" fontWeight="600">
              Total Amount Due
            </Text>
            <Text fontSize="20px" color="white" fontWeight="700">
              {formatCurrency(data.totalAmount)}
            </Text>
          </Flex>
          <Text fontSize="11px" color="white" opacity={0.85} mt={1}>
            Due Date: {formatDate(data.dueDate)}
          </Text>
        </Box>

        {/* Footer */}
        <Box px={5} py={3} bg="gray.50">
          <Text fontSize="10px" color="gray.500" textAlign="center">
            For queries: 1800-419-6666 | support@hathway.com
          </Text>
          <Text fontSize="9px" color="gray.400" textAlign="center" mt={1}>
            This is a computer generated invoice and does not require signature
          </Text>
        </Box>
      </Box>
    );
  }
);

WiFiBillCard.displayName = 'WiFiBillCard';

export default WiFiBillCard;
