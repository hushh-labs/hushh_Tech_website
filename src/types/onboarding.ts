// Onboarding Type Definitions

// Updated account types based on Manish Sainani's feedback
// - All accounts are "Wealth Investment Account" with Hushh prefix
// - Three tiers: $1M, $5M (Silver), $25M (Gold/Platinum for Ultra High Net Worth)
export type AccountType = 'wealth_1m' | 'wealth_5m' | 'ultra_25m';

// Legacy account types for backward compatibility
export type LegacyAccountType = 'general' | 'retirement';

export type ReferralSource = 
  | 'podcast'
  | 'social_media_influencer'
  | 'social_media_ad'
  | 'yahoo_finance'
  | 'ai_tool'
  | 'website_blog_article'
  | 'penny_hoarder'
  | 'family_friend'
  | 'tv_radio'
  | 'other';

export type AccountStructure = 'individual' | 'other';

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'bimonthly';

// Account tier information for UI display
export interface AccountTierInfo {
  type: AccountType;
  name: string;
  minimum: string;
  minimumAmount: number;
  description: string;
  tierLevel: 'standard' | 'silver' | 'gold';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    background: string;
    selectedBorder: string;
    selectedBackground: string;
  };
}

// Account tier configurations
export const ACCOUNT_TIERS: Record<AccountType, AccountTierInfo> = {
  wealth_1m: {
    type: 'wealth_1m',
    name: 'Hushh Wealth Investment Account',
    minimum: '$1 million minimum',
    minimumAmount: 1000000,
    description: 'A flexible wealth investment account designed to help you build and preserve long-term wealth through AI-powered strategies.',
    tierLevel: 'standard',
    colors: {
      primary: '#00A9E0',
      secondary: '#6DD3EF',
      accent: '#0B1120',
      border: '#E2E8F0',
      background: '#FFFFFF',
      selectedBorder: '#00A9E0',
      selectedBackground: '#F0F9FF',
    },
  },
  wealth_5m: {
    type: 'wealth_5m',
    name: 'Hushh Wealth Investment Account',
    minimum: '$5 million minimum',
    minimumAmount: 5000000,
    description: 'Enhanced wealth management with premium portfolio strategies and dedicated relationship support.',
    tierLevel: 'silver',
    colors: {
      primary: '#71717A',
      secondary: '#A1A1AA',
      accent: '#3F3F46',
      border: '#D4D4D8',
      background: '#FAFAFA',
      selectedBorder: '#71717A',
      selectedBackground: '#F4F4F5',
    },
  },
  ultra_25m: {
    type: 'ultra_25m',
    name: 'Hushh Ultra High Net Worth Investment Account',
    minimum: '$25 million minimum',
    minimumAmount: 25000000,
    description: 'Exclusive investment access tailored for ultra high net worth individuals and families worldwide, with bespoke portfolio solutions.',
    tierLevel: 'gold',
    colors: {
      primary: '#B8860B',
      secondary: '#DAA520',
      accent: '#8B6914',
      border: '#D4AF37',
      background: '#FFFEF7',
      selectedBorder: '#B8860B',
      selectedBackground: '#FFF9E6',
    },
  },
};

export interface OnboardingData {
  id: string;
  user_id: string;
  
  // Step 1: Account Type
  account_type?: AccountType | LegacyAccountType;
  
  // Step 3: Fund Selection
  selected_fund?: string;
  
  // Step 4: Referral Source
  referral_source?: ReferralSource;
  referral_source_other?: string;
  
  // Step 6: Residence
  citizenship_country?: string;
  residence_country?: string;
  
  // Step 7: Account Structure
  account_structure?: AccountStructure;
  
  // Step 8: Phone Number
  phone_number?: string;
  phone_country_code?: string;
  
  // Step 9: Legal Name
  legal_first_name?: string;
  legal_last_name?: string;
  
  // Step 10: Address
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  address_phone_number?: string;
  
  // Step 11: Sensitive Info
  ssn_encrypted?: string;
  date_of_birth?: string;
  
  // Step 12: Initial Investment
  initial_investment_amount?: number;
  
  // Step 13: Recurring Investment
  recurring_investment_enabled?: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_amount?: number;
  recurring_day_of_month?: number;
  
  // Progress Tracking
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  completed_at?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Partial types for each step
export interface Step1Data {
  account_type: AccountType;
}

export interface Step3Data {
  selected_fund: string;
}

export interface Step4Data {
  referral_source: ReferralSource;
  referral_source_other?: string;
}

export interface Step6Data {
  citizenship_country: string;
  residence_country: string;
}

export interface Step7Data {
  account_structure: AccountStructure;
}

export interface Step8Data {
  phone_number: string;
  phone_country_code: string;
}

export interface Step9Data {
  legal_first_name: string;
  legal_last_name: string;
}

export interface Step10Data {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code: string;
  address_phone_number: string;
}

export interface Step11Data {
  ssn_encrypted: string;
  date_of_birth: string;
}

export interface Step12Data {
  initial_investment_amount: number;
}

export interface Step13Data {
  recurring_investment_enabled: boolean;
  recurring_frequency?: RecurringFrequency;
  recurring_amount?: number;
  recurring_day_of_month?: number;
}

// Onboarding context/state type
export interface OnboardingState {
  data: Partial<OnboardingData>;
  currentStep: number;
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface OnboardingResponse {
  success: boolean;
  data?: OnboardingData;
  error?: string;
}

export interface OnboardingStepUpdate {
  step: number;
  data: Partial<OnboardingData>;
  markComplete?: boolean;
}

// Helper function to migrate legacy account types
export function migrateAccountType(legacyType: string): AccountType {
  if (legacyType === 'general') return 'wealth_1m';
  if (legacyType === 'retirement') return 'wealth_5m';
  return legacyType as AccountType;
}
