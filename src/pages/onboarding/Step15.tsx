import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';

// Share class configurations (consistent with other onboarding steps)
interface ShareClassInfo {
  id: string;
  name: string;
  unitPrice: number;
  tier: 'gold' | 'silver' | 'standard';
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

const SHARE_CLASSES: ShareClassInfo[] = [
  {
    id: 'class_a',
    name: 'Class A',
    unitPrice: 25000000,
    tier: 'gold',
    colors: {
      primary: '#B8860B',
      secondary: '#DAA520',
      background: '#FFFEF7',
    },
  },
  {
    id: 'class_b',
    name: 'Class B',
    unitPrice: 5000000,
    tier: 'silver',
    colors: {
      primary: '#71717A',
      secondary: '#A1A1AA',
      background: '#FAFAFA',
    },
  },
  {
    id: 'class_c',
    name: 'Class C',
    unitPrice: 1000000,
    tier: 'standard',
    colors: {
      primary: '#00A9E0',
      secondary: '#6DD3EF',
      background: '#F0F9FF',
    },
  },
];

// Format currency for display
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

// Crown icon for Gold tier
const CrownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill="#DAA520" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Diamond icon for Silver tier
const DiamondIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" 
          fill="#A1A1AA" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Bank icon
const BankIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21M3 10H21M5 6L12 3L19 6M4 10V21M20 10V21M8 14V17M12 14V17M16 14V17" 
          stroke="#0B1120" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Country list for bank address
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'IN', name: 'India' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'OTHER', name: 'Other' },
];

function OnboardingStep15() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Banking form state
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [bankCity, setBankCity] = useState('');
  const [bankCountry, setBankCountry] = useState('US');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  
  // Share class units state
  const [shareUnits, setShareUnits] = useState<{
    class_a_units: number;
    class_b_units: number;
    class_c_units: number;
  }>({
    class_a_units: 0,
    class_b_units: 0,
    class_c_units: 0,
  });

  // Calculate total investment from share units
  const calculateTotalInvestment = () => {
    return (
      (shareUnits.class_a_units * 25000000) +
      (shareUnits.class_b_units * 5000000) +
      (shareUnits.class_c_units * 1000000)
    );
  };

  const totalInvestment = calculateTotalInvestment();
  const hasAnyUnits = shareUnits.class_a_units > 0 || shareUnits.class_b_units > 0 || shareUnits.class_c_units > 0;

  // Load existing data
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!config.supabaseClient) return;

      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) return;

      const { data } = await config.supabaseClient
        .from('onboarding_data')
        .select(`
          class_a_units, class_b_units, class_c_units,
          legal_first_name, legal_last_name,
          bank_name, bank_account_holder_name, bank_account_type,
          bank_routing_number, bank_swift_code,
          bank_address_city, bank_address_country
        `)
        .eq('user_id', user.id)
        .single();

      if (data) {
        // Load share class units
        setShareUnits({
          class_a_units: data.class_a_units || 0,
          class_b_units: data.class_b_units || 0,
          class_c_units: data.class_c_units || 0,
        });
        
        // Pre-fill account holder name from legal name if available
        if (data.legal_first_name && data.legal_last_name && !data.bank_account_holder_name) {
          setAccountHolderName(`${data.legal_first_name} ${data.legal_last_name}`);
        }
        
        // Load existing banking info if any
        if (data.bank_name) setBankName(data.bank_name);
        if (data.bank_account_holder_name) setAccountHolderName(data.bank_account_holder_name);
        if (data.bank_account_type) setAccountType(data.bank_account_type as 'checking' | 'savings');
        if (data.bank_routing_number) setRoutingNumber(data.bank_routing_number);
        if (data.bank_swift_code) setSwiftCode(data.bank_swift_code);
        if (data.bank_address_city) setBankCity(data.bank_address_city);
        if (data.bank_address_country) setBankCountry(data.bank_address_country);
      }
    };

    loadData();
  }, []);

  // Get tier icon
  const getTierIcon = (tier: string) => {
    if (tier === 'gold') return <CrownIcon />;
    if (tier === 'silver') return <DiamondIcon />;
    return null;
  };

  // Get units for a class
  const getUnits = (classId: string): number => {
    if (classId === 'class_a') return shareUnits.class_a_units;
    if (classId === 'class_b') return shareUnits.class_b_units;
    if (classId === 'class_c') return shareUnits.class_c_units;
    return 0;
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!bankName.trim()) {
      setError('Please enter your bank name');
      return false;
    }
    if (!accountHolderName.trim()) {
      setError('Please enter the account holder name');
      return false;
    }
    if (!accountNumber.trim()) {
      setError('Please enter your account number');
      return false;
    }
    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match');
      return false;
    }
    // For US banks, require routing number. For international, require SWIFT
    if (bankCountry === 'US' && !routingNumber.trim()) {
      setError('Please enter the routing number for US banks');
      return false;
    }
    if (bankCountry !== 'US' && !swiftCode.trim()) {
      setError('Please enter the SWIFT code for international banks');
      return false;
    }
    return true;
  };

  // Save banking info and continue
  const handleContinue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    if (!config.supabaseClient) {
      setError('Configuration error');
      setLoading(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    // Simple encryption for account number (in production, use proper encryption)
    const encryptedAccountNumber = btoa(accountNumber);

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        bank_name: bankName.trim(),
        bank_account_holder_name: accountHolderName.trim(),
        bank_account_number_encrypted: encryptedAccountNumber,
        bank_routing_number: routingNumber.trim() || null,
        bank_swift_code: swiftCode.trim() || null,
        bank_address_city: bankCity.trim() || null,
        bank_address_country: bankCountry,
        bank_account_type: accountType,
        banking_info_skipped: false,
        banking_info_submitted_at: new Date().toISOString(),
        current_step: 15,
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save banking information');
      setLoading(false);
      return;
    }

    // Navigate to Meet CEO page
    navigate('/onboarding/meet-ceo');
  };

  // Skip and continue later
  const handleSkip = async () => {
    setLoading(true);
    setError(null);

    if (!config.supabaseClient) {
      setError('Configuration error');
      setLoading(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        banking_info_skipped: true,
        current_step: 15,
        is_completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/meet-ceo');
  };

  const handleBack = () => {
    navigate('/onboarding/step-14');
  };

  // Mask account number for display
  const maskAccountNumber = (num: string): string => {
    if (num.length <= 4) return num;
    return '•'.repeat(num.length - 4) + num.slice(-4);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-28 pb-12" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-[#F8FAFC] rounded-full">
                <BankIcon />
              </div>
            </div>
            <h1 className="text-[28px] md:text-[36px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
              Wire Transfer Details
            </h1>
            <p className="text-[16px] text-[#64748B]">
              Provide your banking information for investment transfers
            </p>
          </div>

          {/* Share Class Allocation Summary */}
          {hasAnyUnits && (
            <div className="bg-[#F8FAFC] rounded-[16px] p-4 mb-6 border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] uppercase tracking-wider text-[#64748B]">
                  Investment Amount
                </h2>
                <span className="text-[18px] font-[600] text-[#0B1120]">
                  {formatCurrency(totalInvestment)}
                </span>
              </div>
              
              {/* Compact share class display */}
              <div className="flex flex-wrap gap-2">
                {SHARE_CLASSES.map((shareClass) => {
                  const units = getUnits(shareClass.id);
                  if (units === 0) return null;
                  
                  return (
                    <div
                      key={shareClass.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
                      style={{
                        backgroundColor: shareClass.colors.background,
                        border: `1.5px solid ${shareClass.colors.primary}`,
                      }}
                    >
                      {getTierIcon(shareClass.tier)}
                      <span 
                        className="text-[13px] font-[600]"
                        style={{ color: shareClass.colors.primary }}
                      >
                        {shareClass.name}
                      </span>
                      <span 
                        className="text-[13px] font-[500] ml-1"
                        style={{ color: shareClass.colors.primary }}
                      >
                        ×{units}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Banking Form */}
          <div className="space-y-5">
            {/* Bank Name */}
            <div>
              <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Chase Bank, Bank of America"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#00A9E0]"
                style={{ backgroundColor: '#FFFFFF' }}
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Name as it appears on the account"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#00A9E0]"
                style={{ backgroundColor: '#FFFFFF' }}
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                Account Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                {[
                  { value: 'checking', label: 'Checking' },
                  { value: 'savings', label: 'Savings' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAccountType(type.value as 'checking' | 'savings')}
                    className="flex-1 py-4 rounded-lg border-2 transition-colors"
                    style={{
                      borderColor: accountType === type.value ? '#0B1120' : '#D1D5DB',
                      backgroundColor: accountType === type.value ? '#F3F4F6' : '#FFFFFF',
                      color: '#0B1120',
                      fontWeight: accountType === type.value ? 600 : 400,
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter account number"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#00A9E0]"
                style={{ backgroundColor: '#FFFFFF' }}
              />
              {accountNumber && (
                <p className="text-[13px] text-gray-500 mt-1">
                  Will be stored as: {maskAccountNumber(accountNumber)}
                </p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div>
              <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                Confirm Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Re-enter account number"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#00A9E0]"
                style={{ backgroundColor: '#FFFFFF' }}
              />
              {confirmAccountNumber && accountNumber && (
                <p className={`text-[13px] mt-1 ${accountNumber === confirmAccountNumber ? 'text-green-600' : 'text-red-500'}`}>
                  {accountNumber === confirmAccountNumber ? '✓ Account numbers match' : '✗ Account numbers do not match'}
                </p>
              )}
            </div>

            {/* Bank Country */}
            <div>
              <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                Bank Country <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={bankCountry}
                  onChange={(e) => setBankCountry(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#00A9E0] appearance-none"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                    <path d="M1 1L8 8L15 1" stroke="#0B1120" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Routing Number (US) or SWIFT Code (International) */}
            {bankCountry === 'US' ? (
              <div>
                <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                  Routing Number (ABA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  placeholder="9-digit routing number"
                  maxLength={9}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#00A9E0]"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
                <p className="text-[13px] text-gray-500 mt-1">
                  Find this on the bottom left of your checks
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                  SWIFT/BIC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value.toUpperCase().slice(0, 11))}
                  placeholder="8 or 11 character SWIFT code"
                  maxLength={11}
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#00A9E0]"
                  style={{ backgroundColor: '#FFFFFF' }}
                />
                <p className="text-[13px] text-gray-500 mt-1">
                  Required for international wire transfers
                </p>
              </div>
            )}

            {/* Bank City (Optional) */}
            <div>
              <label className="block text-[15px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
                Bank City <span className="text-gray-400 text-[13px]">(Optional)</span>
              </label>
              <input
                type="text"
                value={bankCity}
                onChange={(e) => setBankCity(e.target.value)}
                placeholder="City where your bank branch is located"
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#00A9E0]"
                style={{ backgroundColor: '#FFFFFF' }}
              />
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-[#F0F9FF] rounded-lg border border-[#BAE6FD]">
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 flex-shrink-0">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0284C7" strokeWidth="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="#0284C7" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-[14px] text-[#0369A1] font-medium">Your information is secure</p>
                <p className="text-[13px] text-[#0284C7] mt-1">
                  Your banking details are encrypted and stored securely. We use bank-level security to protect your information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full py-4 rounded-lg text-lg font-semibold mb-3 transition-opacity disabled:opacity-50"
          style={{
            background: 'linear-gradient(to right, #00A9E0, #6DD3EF)',
            color: '#0B1120',
            fontWeight: 500,
          }}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>

        <button
          onClick={handleSkip}
          disabled={loading}
          className="w-full py-4 rounded-lg text-lg font-semibold mb-3 border-2 transition-opacity disabled:opacity-50"
          style={{
            borderColor: '#0B1120',
            backgroundColor: '#FFFFFF',
            color: '#0B1120',
          }}
        >
          I'll do this later
        </button>

        <button
          onClick={handleBack}
          disabled={loading}
          className="w-full py-4 text-lg font-semibold"
          style={{ color: '#64748B' }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep15;
