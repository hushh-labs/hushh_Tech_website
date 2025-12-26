'use client';

import React, { forwardRef } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Divider,
  Badge,
  HStack,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { ReceiptData, formatAmount, formatReceiptDate } from '../../utils/receiptUtils';

interface ReceiptCardProps {
  data: ReceiptData;
  onCopy?: (text: string) => void;
}

/**
 * ReceiptCard Component - Exact UI replica of Slice payment receipt
 */
const ReceiptCard = forwardRef<HTMLDivElement, ReceiptCardProps>(
  ({ data, onCopy }, ref) => {
    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      onCopy?.(text);
    };

    return (
      <Box
        ref={ref}
        bg="white"
        borderRadius="16px"
        overflow="hidden"
        maxW="400px"
        w="100%"
        fontFamily="'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      >
        {/* Header Section */}
        <Box px={6} pt={6} pb={5}>
          {/* Back Arrow */}
          <Box mb={6}>
            <Text fontSize="24px" color="gray.800" cursor="pointer">
              ‹
            </Text>
          </Box>

          {/* Amount and Checkmark */}
          <Flex justify="space-between" align="flex-start" mb={2}>
            <Text
              fontSize="28px"
              fontWeight="600"
              color="gray.900"
              letterSpacing="-0.5px"
            >
              Paid {formatAmount(data.amount)}
            </Text>
            
            {/* Green Checkmark Circle */}
            <Flex
              w="48px"
              h="48px"
              borderRadius="full"
              bg="#22C55E"
              align="center"
              justify="center"
            >
              <Icon as={CheckIcon} color="white" w={5} h={5} />
            </Flex>
          </Flex>

          {/* Recipient Name and Date */}
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Text fontSize="16px" color="gray.700" mb={1}>
                To {data.recipientName}
              </Text>
              <Text fontSize="14px" color="gray.500">
                {formatReceiptDate(data.date)}
              </Text>
            </Box>
            
            {/* Pay again button */}
            <Text
              fontSize="14px"
              fontWeight="500"
              color="#8B5CF6"
              cursor="pointer"
            >
              Pay again
            </Text>
          </Flex>

          {/* Notes Badge */}
          <Box mt={4}>
            <Badge
              bg="gray.100"
              color="gray.700"
              px={3}
              py={1.5}
              borderRadius="6px"
              fontWeight="400"
              fontSize="13px"
            >
              Notes: UPI
            </Badge>
          </Box>
        </Box>

        {/* Transfers Section */}
        <Box borderTop="1px solid" borderColor="gray.100" px={6} py={4}>
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              {/* Transfer Icon */}
              <Box
                w="32px"
                h="32px"
                borderRadius="full"
                border="1.5px solid"
                borderColor="gray.300"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="14px" color="gray.600">↺</Text>
              </Box>
              <Text fontSize="15px" fontWeight="500" color="gray.800">
                Transfers
              </Text>
            </HStack>
            <Text
              fontSize="14px"
              fontWeight="500"
              color="#8B5CF6"
              cursor="pointer"
            >
              Edit
            </Text>
          </Flex>
        </Box>

        {/* Details Section */}
        <Box borderTop="1px solid" borderColor="gray.100" px={6} py={4}>
          {/* Details Header */}
          <Flex justify="space-between" align="center" mb={5}>
            <Text fontSize="18px" fontWeight="600" color="gray.900">
              Details
            </Text>
            <Text
              fontSize="14px"
              fontWeight="500"
              color="#8B5CF6"
              cursor="pointer"
            >
              Share
            </Text>
          </Flex>

          {/* Divider */}
          <Divider borderColor="gray.100" mb={5} />

          {/* From Account */}
          <VStack align="stretch" spacing={5}>
            <Box>
              <Text fontSize="14px" color="gray.700" mb={1}>
                From: {data.fromAccount}
              </Text>
              <Text fontSize="13px" color="gray.500">
                {data.fromAccountNumber}
              </Text>
            </Box>

            {/* To Account */}
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="14px" color="gray.700" mb={1}>
                  To: {data.recipientName}
                </Text>
                <Text fontSize="13px" color="gray.500">
                  {data.upiId}
                </Text>
              </Box>
              <IconButton
                aria-label="Copy UPI ID"
                icon={<CopyIcon />}
                variant="ghost"
                size="sm"
                color="gray.400"
                onClick={() => handleCopy(data.upiId)}
              />
            </Flex>

            {/* UPI Ref ID */}
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="14px" color="gray.700" mb={1}>
                  UPI Ref ID
                </Text>
                <Text fontSize="13px" color="gray.500">
                  {data.upiRefId}
                </Text>
              </Box>
              <IconButton
                aria-label="Copy UPI Ref ID"
                icon={<CopyIcon />}
                variant="ghost"
                size="sm"
                color="gray.400"
                onClick={() => handleCopy(data.upiRefId)}
              />
            </Flex>

            {/* Transaction ID */}
            <Flex justify="space-between" align="flex-start">
              <Box>
                <Text fontSize="14px" color="gray.700" mb={1}>
                  Transaction ID
                </Text>
                <Text fontSize="13px" color="gray.500" wordBreak="break-all">
                  {data.transactionId}
                </Text>
              </Box>
              <IconButton
                aria-label="Copy Transaction ID"
                icon={<CopyIcon />}
                variant="ghost"
                size="sm"
                color="gray.400"
                onClick={() => handleCopy(data.transactionId)}
              />
            </Flex>
          </VStack>
        </Box>
      </Box>
    );
  }
);

ReceiptCard.displayName = 'ReceiptCard';

export default ReceiptCard;
