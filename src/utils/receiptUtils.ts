/**
 * Receipt Generator Utility Functions
 * Generates random UPI IDs, Reference IDs, and Transaction IDs
 */

// Bank suffixes for UPI IDs
const BANK_SUFFIXES = [
  'okhdfcbank',
  'okicici',
  'oksbi',
  'okaxis',
  'ybl',
  'paytm',
  'ibl',
];

/**
 * Generate UPI ID from name
 * Example: "Akshay Kumar" -> "akshaykumar@okhdfcbank"
 */
export const generateUpiId = (name: string): string => {
  // Remove special characters and spaces, convert to lowercase
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Add random number suffix (5 digits)
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  
  // Pick random bank suffix
  const bankSuffix = BANK_SUFFIXES[Math.floor(Math.random() * BANK_SUFFIXES.length)];
  
  return `${cleanName}${randomNum}@${bankSuffix}`;
};

/**
 * Generate random 12-digit UPI Reference ID
 * Example: "532335586845"
 */
export const generateUpiRefId = (): string => {
  let refId = '';
  for (let i = 0; i < 12; i++) {
    refId += Math.floor(Math.random() * 10);
  }
  return refId;
};

/**
 * Generate random Transaction ID
 * Example: "NEF50e53537809942e0be46b983a05caedf"
 */
export const generateTransactionId = (): string => {
  const prefix = 'NEF';
  const chars = '0123456789abcdef';
  let txnId = prefix;
  
  // Generate 32 hex characters
  for (let i = 0; i < 32; i++) {
    txnId += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return txnId;
};

/**
 * Format amount to Indian Rupee format
 * Example: 20000 -> "₹20,000"
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date for receipt
 * Example: new Date() -> "19 Nov '25, 12:23 pm"
 */
export const formatReceiptDate = (date: Date): string => {
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  
  return `${day} ${month} '${year}, ${hours}:${minutes} ${ampm}`;
};

/**
 * Parse amount string to number
 * Handles formats like "20K", "20000", "20,000", "Rs20K"
 */
export const parseAmount = (amountStr: string): number => {
  // Remove currency symbols and spaces
  let cleaned = amountStr.replace(/[₹Rs\s,]/gi, '').trim();
  
  // Handle K/L/Cr suffixes
  const multipliers: Record<string, number> = {
    'k': 1000,
    'l': 100000,
    'lakh': 100000,
    'cr': 10000000,
    'crore': 10000000,
  };
  
  for (const [suffix, multiplier] of Object.entries(multipliers)) {
    if (cleaned.toLowerCase().endsWith(suffix)) {
      const numPart = cleaned.slice(0, -suffix.length);
      return parseFloat(numPart) * multiplier;
    }
  }
  
  return parseFloat(cleaned) || 0;
};

/**
 * Receipt data interface
 */
export interface ReceiptData {
  recipientName: string;
  amount: number;
  date: Date;
  upiId: string;
  upiRefId: string;
  transactionId: string;
  fromAccount: string;
  fromAccountNumber: string;
}

/**
 * Generate complete receipt data from name and amount
 */
export const generateReceiptData = (
  recipientName: string,
  amount: number,
  date: Date = new Date()
): ReceiptData => {
  return {
    recipientName,
    amount,
    date,
    upiId: generateUpiId(recipientName),
    upiRefId: generateUpiRefId(),
    transactionId: generateTransactionId(),
    fromAccount: 'slice savings',
    fromAccountNumber: 'xx3682',
  };
};
