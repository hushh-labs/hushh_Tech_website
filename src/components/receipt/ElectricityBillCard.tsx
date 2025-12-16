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

export interface ElectricityBillData {
  customerName: string;
  billDate: Date;
  billNumber: string;
  consumerNumber: string;
  meterNumber: string;
  unitsConsumed: number;
  ratePerUnit: number;
  energyCharge: number;
  fixedCharge: number;
  fuelAdjustment: number;
  electricityDuty: number;
  totalAmount: number;
  dueDate: Date;
  connectionAddress: string;
  billingPeriod: string;
}

interface ElectricityBillCardProps {
  data: ElectricityBillData;
}

/**
 * Electricity Bill Card - MSEDCL Style
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
        borderRadius="8px"
        overflow="hidden"
        maxW="450px"
        w="100%"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        border="1px solid"
        borderColor="gray.200"
        p={0}
      >
        {/* Header - MSEDCL Style */}
        <Box bg="#1565C0" px={5} py={4}>
          <HStack justify="space-between" align="center">
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="20px" fontWeight="700" color="white" letterSpacing="1px">
                MSEDCL
              </Text>
              <Text fontSize="9px" color="white" opacity={0.9}>
                Maharashtra State Electricity Distribution Co. Ltd.
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={0}>
              <Text fontSize="11px" color="white" fontWeight="500">
                ELECTRICITY BILL
              </Text>
              <Text fontSize="9px" color="white" opacity={0.8}>
                LT Consumer
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Bill Info Section */}
        <Box px={5} py={4} bg="blue.50">
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="10px" color="gray.500" fontWeight="500">
                BILL NUMBER
              </Text>
              <Text fontSize="12px" color="gray.800" fontWeight="600">
                {data.billNumber}
              </Text>
            </VStack>
            <VStack align="center" spacing={1}>
              <Text fontSize="10px" color="gray.500" fontWeight="500">
                CONSUMER NO
              </Text>
              <Text fontSize="12px" color="gray.800" fontWeight="600">
                {data.consumerNumber}
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="10px" color="gray.500" fontWeight="500">
                BILL DATE
              </Text>
              <Text fontSize="12px" color="gray.800" fontWeight="600">
                {formatDate(data.billDate)}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Divider />

        {/* Customer Details */}
        <Box px={5} py={4}>
          <Text fontSize="10px" color="gray.500" fontWeight="500" mb={2}>
            CONSUMER DETAILS
          </Text>
          <VStack align="flex-start" spacing={1}>
            <Text fontSize="13px" color="gray.800" fontWeight="600">
              {data.customerName}
            </Text>
            <Text fontSize="11px" color="gray.600" lineHeight="1.4">
              {data.connectionAddress}
            </Text>
            <HStack mt={1}>
              <Text fontSize="10px" color="gray.500">Meter No:</Text>
              <Text fontSize="10px" color="gray.700" fontWeight="500">{data.meterNumber}</Text>
            </HStack>
          </VStack>
        </Box>

        <Divider />

        {/* Consumption Details */}
        <Box px={5} py={4} bg="gray.50">
          <HStack justify="space-between">
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="10px" color="gray.500">BILLING PERIOD</Text>
              <Text fontSize="12px" color="gray.800" fontWeight="600">{data.billingPeriod}</Text>
            </VStack>
            <VStack align="flex-end" spacing={0}>
              <Text fontSize="10px" color="gray.500">UNITS CONSUMED</Text>
              <Text fontSize="16px" color="blue.700" fontWeight="700">{data.unitsConsumed} kWh</Text>
            </VStack>
          </HStack>
        </Box>

        <Divider />

        {/* Charges Breakdown */}
        <Box px={5} py={4}>
          <Text fontSize="10px" color="gray.500" fontWeight="500" mb={3}>
            CHARGES BREAKDOWN
          </Text>
          <Table variant="unstyled" size="sm">
            <Tbody>
              <Tr>
                <Td px={0} py={1.5} fontSize="12px" color="gray.700">
                  Energy Charge ({data.unitsConsumed} units × ₹{data.ratePerUnit})
                </Td>
                <Td px={0} py={1.5} fontSize="12px" color="gray.800" textAlign="right" fontWeight="500">
                  {formatCurrency(data.energyCharge)}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={1.5} fontSize="12px" color="gray.700">
                  Fixed Charge
                </Td>
                <Td px={0} py={1.5} fontSize="12px" color="gray.800" textAlign="right" fontWeight="500">
                  {formatCurrency(data.fixedCharge)}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={1.5} fontSize="12px" color="gray.700">
                  Fuel Adjustment Charge
                </Td>
                <Td px={0} py={1.5} fontSize="12px" color="gray.800" textAlign="right" fontWeight="500">
                  {formatCurrency(data.fuelAdjustment)}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={1.5} fontSize="12px" color="gray.700">
                  Electricity Duty
                </Td>
                <Td px={0} py={1.5} fontSize="12px" color="gray.800" textAlign="right" fontWeight="500">
                  {formatCurrency(data.electricityDuty)}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Total Amount */}
        <Box px={5} py={4} bg="#1565C0">
          <Flex justify="space-between" align="center">
            <Text fontSize="14px" color="white" fontWeight="600">
              Total Amount Payable
            </Text>
            <Text fontSize="20px" color="white" fontWeight="700">
              {formatCurrency(data.totalAmount)}
            </Text>
          </Flex>
          <Text fontSize="10px" color="white" opacity={0.85} mt={1}>
            Due Date: {formatDate(data.dueDate)}
          </Text>
        </Box>

        {/* Footer */}
        <Box px={5} py={3} bg="gray.50">
          <Text fontSize="9px" color="gray.500" textAlign="center">
            Pay online at www.mahadiscom.in | Toll Free: 1800-233-3435
          </Text>
          <Text fontSize="8px" color="gray.400" textAlign="center" mt={1}>
            This is a computer generated bill and does not require signature
          </Text>
        </Box>
      </Box>
    );
  }
);

ElectricityBillCard.displayName = 'ElectricityBillCard';

export default ElectricityBillCard;
