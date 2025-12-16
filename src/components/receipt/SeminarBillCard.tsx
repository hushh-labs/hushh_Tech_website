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

export interface SeminarItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface SeminarBillData {
  customerName: string;
  invoiceDate: Date;
  invoiceNumber: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  items: SeminarItem[];
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

interface SeminarBillCardProps {
  data: SeminarBillData;
}

/**
 * Seminar/Conference Bill Card - TravelPlus Style Invoice
 */
const SeminarBillCard = forwardRef<HTMLDivElement, SeminarBillCardProps>(
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
        {/* Header - Professional Style */}
        <Box 
          bgGradient="linear(to-r, #1a365d, #2c5282)" 
          px={6} 
          py={5}
        >
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="24px" fontWeight="700" color="white" letterSpacing="1px">
                TravelPlus
              </Text>
              <Text fontSize="10px" color="whiteAlpha.800">
                Corporate Events & Conferences
              </Text>
            </VStack>
            <VStack align="flex-end" spacing={1}>
              <Text fontSize="20px" fontWeight="600" color="white">
                TAX INVOICE
              </Text>
              <Badge colorScheme={getPaymentBadgeColor()} fontSize="10px" px={2}>
                {data.paymentStatus}
              </Badge>
            </VStack>
          </HStack>
        </Box>

        {/* Invoice Details */}
        <Box px={6} py={4} bg="gray.50" borderBottom="1px solid" borderColor="gray.200">
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
          <HStack align="flex-start" spacing={8}>
            <VStack align="flex-start" spacing={2} flex={1}>
              <Text fontSize="11px" color="blue.600" fontWeight="600" textTransform="uppercase">
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
          </HStack>
        </Box>

        {/* Event Details */}
        <Box px={6} py={4} bg="blue.50" borderBottom="1px solid" borderColor="gray.200">
          <Text fontSize="11px" color="blue.600" fontWeight="600" textTransform="uppercase" mb={2}>
            EVENT DETAILS
          </Text>
          <VStack align="flex-start" spacing={1}>
            <HStack>
              <Text fontSize="12px" color="gray.600" w="80px">Event:</Text>
              <Text fontSize="12px" color="gray.800" fontWeight="500">{data.eventName}</Text>
            </HStack>
            <HStack>
              <Text fontSize="12px" color="gray.600" w="80px">Date:</Text>
              <Text fontSize="12px" color="gray.800" fontWeight="500">{data.eventDate}</Text>
            </HStack>
            <HStack>
              <Text fontSize="12px" color="gray.600" w="80px">Venue:</Text>
              <Text fontSize="12px" color="gray.800" fontWeight="500">{data.eventVenue}</Text>
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
              <Text fontSize="18px" color="blue.700" fontWeight="700">{formatCurrency(data.totalAmount)}</Text>
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
              GSTIN: 27AABCT1234F1ZP | PAN: AABCT1234F
            </Text>
            <Text fontSize="10px" color="gray.500" textAlign="center">
              TravelPlus Events Pvt. Ltd. | 45 MG Road, Bangalore - 560001
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

SeminarBillCard.displayName = 'SeminarBillCard';

export default SeminarBillCard;
