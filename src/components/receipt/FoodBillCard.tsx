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
  subtotal: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  paymentMode: string;
  tableNo?: string;
  serverName?: string;
  customerAddress: string;
  customerPhone: string;
}

interface FoodBillCardProps {
  data: FoodBillData;
}

/**
 * Food Bill Card - Apoorva Delicacies Restaurant Style
 */
const FoodBillCard = forwardRef<HTMLDivElement, FoodBillCardProps>(
  ({ data }, ref) => {
    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${day}/${month}/${year} ${hour12}:${minutes} ${ampm}`;
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
        maxW="400px"
        w="100%"
        fontFamily="'Courier New', Courier, monospace"
        border="1px solid"
        borderColor="gray.300"
        p={0}
      >
        {/* Header - Restaurant Style */}
        <Box px={5} py={4} textAlign="center" borderBottom="2px dashed" borderColor="gray.300">
          <Text fontSize="24px" fontWeight="700" color="orange.600" letterSpacing="2px">
            APOORVA
          </Text>
          <Text fontSize="12px" color="orange.500" fontWeight="600" mt={-1}>
            DELICACIES
          </Text>
          <Text fontSize="10px" color="gray.600" mt={2}>
            Pure Vegetarian Restaurant
          </Text>
          <Text fontSize="9px" color="gray.500" mt={1}>
            Shop No. 12, Phoenix Mall, Dhanori, Pune - 411015
          </Text>
          <Text fontSize="9px" color="gray.500">
            Tel: 020-27654321 | FSSAI: 11521034000789
          </Text>
        </Box>

        {/* Bill Info */}
        <Box px={4} py={3} bg="orange.50" borderBottom="1px dashed" borderColor="gray.300">
          <HStack justify="space-between">
            <VStack align="flex-start" spacing={0}>
              <Text fontSize="10px" color="gray.500">BILL NO</Text>
              <Text fontSize="11px" color="gray.800" fontWeight="600">{data.billNumber}</Text>
            </VStack>
            <VStack align="flex-end" spacing={0}>
              <Text fontSize="10px" color="gray.500">DATE & TIME</Text>
              <Text fontSize="11px" color="gray.800" fontWeight="600">{formatDate(data.billDate)}</Text>
            </VStack>
          </HStack>
          {data.tableNo && (
            <HStack justify="space-between" mt={2}>
              <Text fontSize="10px" color="gray.600">Table: {data.tableNo}</Text>
              {data.serverName && <Text fontSize="10px" color="gray.600">Server: {data.serverName}</Text>}
            </HStack>
          )}
        </Box>

        {/* Customer Info */}
        <Box px={4} py={3} borderBottom="1px dashed" borderColor="gray.300">
          <Text fontSize="10px" color="gray.500" mb={1}>CUSTOMER</Text>
          <Text fontSize="12px" color="gray.800" fontWeight="600">{data.customerName}</Text>
          <Text fontSize="9px" color="gray.600" mt={1}>{data.customerAddress}</Text>
          <Text fontSize="9px" color="gray.600">Ph: {data.customerPhone}</Text>
        </Box>

        {/* Items Table */}
        <Box px={3} py={3}>
          <Table variant="unstyled" size="sm">
            <Thead>
              <Tr borderBottom="1px solid" borderColor="gray.200">
                <Th px={1} py={2} fontSize="9px" color="gray.600" fontWeight="600" textTransform="uppercase">Item</Th>
                <Th px={1} py={2} fontSize="9px" color="gray.600" fontWeight="600" textAlign="center">Qty</Th>
                <Th px={1} py={2} fontSize="9px" color="gray.600" fontWeight="600" textAlign="right">Rate</Th>
                <Th px={1} py={2} fontSize="9px" color="gray.600" fontWeight="600" textAlign="right">Amt</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.items.map((item, index) => (
                <Tr key={index}>
                  <Td px={1} py={1.5} fontSize="11px" color="gray.800">{item.name}</Td>
                  <Td px={1} py={1.5} fontSize="11px" color="gray.800" textAlign="center">{item.quantity}</Td>
                  <Td px={1} py={1.5} fontSize="11px" color="gray.800" textAlign="right">{item.rate.toFixed(2)}</Td>
                  <Td px={1} py={1.5} fontSize="11px" color="gray.800" textAlign="right" fontWeight="500">{item.amount.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Divider */}
        <Divider borderStyle="dashed" borderColor="gray.300" />

        {/* Totals */}
        <Box px={4} py={3}>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="11px" color="gray.600">Sub Total</Text>
            <Text fontSize="11px" color="gray.800" fontWeight="500">{formatCurrency(data.subtotal)}</Text>
          </HStack>
          <HStack justify="space-between" mb={1}>
            <Text fontSize="10px" color="gray.500">CGST @ 2.5%</Text>
            <Text fontSize="10px" color="gray.600">{formatCurrency(data.cgst)}</Text>
          </HStack>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="10px" color="gray.500">SGST @ 2.5%</Text>
            <Text fontSize="10px" color="gray.600">{formatCurrency(data.sgst)}</Text>
          </HStack>
          
          <Divider my={2} />
          
          <HStack justify="space-between">
            <Text fontSize="14px" color="gray.800" fontWeight="700">GRAND TOTAL</Text>
            <Text fontSize="16px" color="orange.600" fontWeight="700">{formatCurrency(data.totalAmount)}</Text>
          </HStack>
          
          <HStack justify="space-between" mt={2}>
            <Text fontSize="10px" color="gray.500">Payment Mode</Text>
            <Text fontSize="10px" color="gray.700" fontWeight="500">{data.paymentMode}</Text>
          </HStack>
        </Box>

        {/* Footer */}
        <Box px={4} py={3} bg="orange.50" borderTop="2px dashed" borderColor="gray.300" textAlign="center">
          <Text fontSize="11px" color="orange.600" fontWeight="600">
            Thank You! Visit Again!
          </Text>
          <Text fontSize="8px" color="gray.500" mt={1}>
            GSTIN: 27AADCA1234F1Z5
          </Text>
          <Text fontSize="8px" color="gray.400" mt={1}>
            This is a computer generated bill
          </Text>
        </Box>
      </Box>
    );
  }
);

FoodBillCard.displayName = 'FoodBillCard';

export default FoodBillCard;
