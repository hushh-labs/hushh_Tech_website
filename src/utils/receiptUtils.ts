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

// ============================================
// WIFI BILL UTILITIES
// ============================================

import { WiFiBillData } from '../components/receipt/WiFiBillCard';
import { FoodBillData, FoodItem } from '../components/receipt/FoodBillCard';
import { SeminarBillData, SeminarItem } from '../components/receipt/SeminarBillCard';

/**
 * Generate WiFi Bill Number
 * Example: "HTW-2024-12345678"
 */
export const generateWiFiBillNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `HTW-${year}-${randomNum}`;
};

/**
 * Generate WiFi Customer ID
 * Example: "CUS1234567890"
 */
export const generateWiFiCustomerId = (): string => {
  const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
  return `CUS${randomNum}`;
};

/**
 * Generate WiFi Bill Data
 * Total: ₹2804 (Base: ₹2376.27 + CGST: ₹213.86 + SGST: ₹213.87)
 */
export const generateWiFiBillData = (
  customerName: string,
  billDate: Date
): WiFiBillData => {
  const monthlyCharge = 2376.27; // Base amount to get ₹2804 with 18% GST
  const cgst = monthlyCharge * 0.09; // 9%
  const sgst = monthlyCharge * 0.09; // 9%
  const totalAmount = 2804; // Fixed total

  // Get billing period (current month)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[billDate.getMonth()];
  const year = billDate.getFullYear();

  // Due date is 15 days from bill date
  const dueDate = new Date(billDate);
  dueDate.setDate(dueDate.getDate() + 15);

  return {
    customerName,
    billDate,
    billNumber: generateWiFiBillNumber(),
    planName: 'Hathway Play 100 Mbps',
    planSpeed: '100 Mbps Unlimited',
    monthlyCharge: Math.round(monthlyCharge * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    dueDate,
    customerId: generateWiFiCustomerId(),
    connectionAddress: 'Row house 7, matra montana, dhanori, pune, maharastra',
    billingPeriod: `${month} ${year}`,
  };
};

// ============================================
// FOOD BILL UTILITIES
// ============================================

/**
 * Generate Food Bill Number
 * Example: "APV-123456"
 */
export const generateFoodBillNumber = (): string => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `APV-${randomNum}`;
};

/**
 * Generate Food Bill Data
 * Total: ₹2635 (with 5% GST)
 */
export const generateFoodBillData = (
  customerName: string,
  billDate: Date
): FoodBillData => {
  // Food items that sum up to ₹2510 (before 5% GST = ₹2635)
  const items: FoodItem[] = [
    { name: 'Paneer Butter Masala', quantity: 2, rate: 320, amount: 640 },
    { name: 'Butter Naan', quantity: 6, rate: 55, amount: 330 },
    { name: 'Dal Makhani', quantity: 2, rate: 280, amount: 560 },
    { name: 'Veg Biryani', quantity: 2, rate: 320, amount: 640 },
    { name: 'Sweet Lassi', quantity: 4, rate: 85, amount: 340 },
  ];

  const subtotal = 2510; // Fixed subtotal
  const cgst = 62.75; // 2.5%
  const sgst = 62.25; // 2.5%
  const totalAmount = 2635; // Fixed total

  return {
    customerName,
    billDate,
    billNumber: generateFoodBillNumber(),
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    paymentMode: 'UPI',
    tableNo: 'T-07',
    serverName: 'Rahul',
    customerAddress: 'Row house 7, matra montana, dhanori, pune, maharastra',
    customerPhone: '+91 8004482372',
  };
};

// ============================================
// SEMINAR BILL UTILITIES
// ============================================

/**
 * Generate Seminar Invoice Number
 * Example: "TPE-2024-001234"
 */
export const generateSeminarInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `TPE-${year}-${randomNum}`;
};

/**
 * Generate Seminar Bill Data
 * Total: ₹10,545 (Base: ₹8,936.44 + GST 18%)
 */
export const generateSeminarBillData = (
  customerName: string,
  invoiceDate: Date,
  eventName: string = 'AI & Data Privacy Summit 2024',
  eventDate: string = '20-21 Nov 2024',
  eventVenue: string = 'Marriott Convention Center, Pune'
): SeminarBillData => {
  // Items that sum up to ₹8,936 (before 18% GST = ₹10,545)
  const items: SeminarItem[] = [
    { description: 'Conference Pass - Premium (2 Days)', quantity: 1, unitPrice: 5500, amount: 5500 },
    { description: 'Workshop: Advanced AI Implementation', quantity: 1, unitPrice: 2200, amount: 2200 },
    { description: 'Networking Dinner', quantity: 1, unitPrice: 1236, amount: 1236 },
  ];

  const subtotal = 8936; // Fixed subtotal
  const cgst = 804.24; // 9%
  const sgst = 804.76; // 9%
  const totalAmount = 10545; // Fixed total

  return {
    customerName,
    invoiceDate,
    invoiceNumber: generateSeminarInvoiceNumber(),
    eventName,
    eventDate,
    eventVenue,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    customerAddress: 'Row house 7, matra montana, dhanori, pune, maharastra',
    corporateAddress: 'Hushh.ai, 1021 5th St W, Kirkland, WA 98033',
    customerPhone: '+91 8004482372',
    paymentStatus: 'PAID',
    paymentMode: 'Bank Transfer',
  };
};

/**
 * Calculate grand total of all bills
 */
export const calculateGrandTotal = (
  wifiBill: WiFiBillData | null,
  foodBill: FoodBillData | null,
  seminarBill: SeminarBillData | null
): number => {
  let total = 0;
  if (wifiBill) total += wifiBill.totalAmount;
  if (foodBill) total += foodBill.totalAmount;
  if (seminarBill) total += seminarBill.totalAmount;
  return Math.round(total * 100) / 100;
};
