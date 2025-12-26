import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// SVG Icons
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const BankIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2b8cee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21H21M3 10H21M5 6L12 3L19 6M4 10V21M20 10V21M8 14V17M12 14V17M16 14V17" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2b8cee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const ArrowForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </svg>
);

// Share class pill icons
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1">
    <polygon points="12,2 15,8.5 22,9.3 17,14 18.2,21 12,17.5 5.8,21 7,14 2,9.3 9,8.5" />
  </svg>
);

const DiamondIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" />
  </svg>
);

const VerifiedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2b8cee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15 5L19 5L19 9L22 12L19 15L19 19L15 19L12 22L9 19L5 19L5 15L2 12L5 9L5 5L9 5L12 2Z" />
    <polyline points="9,12 11,14 15,10" />
  </svg>
);

// Share class configurations
interface ShareClassInfo {
  id: string;
  name: string;
  unitPrice: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

const SHARE_CLASSES: ShareClassInfo[] = [
  {
    id: 'class_a',
    name: 'Class A',
    unitPrice: 25000000,
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    icon: <DiamondIcon />,
  },
  {
    id: 'class_b',
    name: 'Class B',
    unitPrice: 5000000,
    color: '#B8860B',
    bgColor: '#FFFAEB',
    borderColor: 'rgba(255, 215, 0, 0.4)',
    icon: <StarIcon />,
  },
  {
    id: 'class_c',
    name: 'Class C',
    unitPrice: 1000000,
    color: '#2b8cee',
    bgColor: '#F0F7FF',
    borderColor: 'rgba(43, 140, 238, 0.3)',
    icon: <VerifiedIcon />,
  },
];

// Country list
const COUNTRIES = [
  { code: '', name: 'Select Country' },
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

function OnboardingStep15() {
  const navigate = useNavigate();
  const isFooterVisible = useFooterVisibility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Banking form state
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [bankCity, setBankCity] = useState('');
  const [bankCountry, setBankCountry] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings'>('checking');
  
  // Touched state for showing validation errors only after user interaction
  const [touched, setTouched] = useState({
    bankName: false,
    accountHolderName: false,
    accountNumber: false,
    confirmAccountNumber: false,
    routingNumber: false,
    bankCountry: false,
    bankCity: false,
  });
  
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
          bank_routing_number, bank_address_city, bank_address_country
        `)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setShareUnits({
          class_a_units: data.class_a_units || 0,
          class_b_units: data.class_b_units || 0,
          class_c_units: data.class_c_units || 0,
        });
        
        if (data.legal_first_name && data.legal_last_name && !data.bank_account_holder_name) {
          setAccountHolderName(`${data.legal_first_name} ${data.legal_last_name}`);
        }
        
        if (data.bank_name) setBankName(data.bank_name);
        if (data.bank_account_holder_name) setAccountHolderName(data.bank_account_holder_name);
        if (data.bank_account_type) setAccountType(data.bank_account_type as 'checking' | 'savings');
        if (data.bank_routing_number) setRoutingNumber(data.bank_routing_number);
        if (data.bank_address_city) setBankCity(data.bank_address_city);
        if (data.bank_address_country) setBankCountry(data.bank_address_country);
      }
    };

    loadData();
  }, []);

  // Get units for a class
  const getUnits = (classId: string): number => {
    if (classId === 'class_a') return shareUnits.class_a_units;
    if (classId === 'class_b') return shareUnits.class_b_units;
    if (classId === 'class_c') return shareUnits.class_c_units;
    return 0;
  };

  // Mark field as touched on blur
  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Validation functions for each field
  const validateBankName = (value: string): string | null => {
    if (!value.trim()) return 'Bank name is required';
    if (value.trim().length < 2) return 'Bank name must be at least 2 characters';
    if (value.trim().length > 100) return 'Bank name is too long';
    return null;
  };

  const validateAccountHolderName = (value: string): string | null => {
    if (!value.trim()) return 'Account holder name is required';
    if (value.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[a-zA-Z\s\-'.]+$/.test(value.trim())) return 'Name should only contain letters';
    if (value.trim().length > 100) return 'Name is too long';
    return null;
  };

  const validateAccountNumber = (value: string): string | null => {
    if (!value.trim()) return 'Account number is required';
    if (!/^\d+$/.test(value)) return 'Account number must contain only digits';
    if (value.length < 4) return 'Account number must be at least 4 digits';
    if (value.length > 17) return 'Account number is too long';
    return null;
  };

  const validateConfirmAccountNumber = (value: string, original: string): string | null => {
    if (!value.trim()) return 'Please confirm your account number';
    if (value !== original) return 'Account numbers do not match';
    return null;
  };

  const validateBankCountry = (value: string): string | null => {
    if (!value) return 'Please select a country';
    return null;
  };

  const validateRoutingNumber = (value: string, country: string): string | null => {
    if (!value.trim()) return 'Routing number is required';
    if (!/^\d+$/.test(value)) return 'Routing number must contain only digits';
    // US routing numbers must be exactly 9 digits
    if (country === 'US' && value.length !== 9) return 'US routing number must be exactly 9 digits';
    // For other countries, allow 5-15 digits
    if (country !== 'US' && (value.length < 5 || value.length > 15)) return 'Routing number must be 5-15 digits';
    return null;
  };

  // Get error for each field
  const bankNameError = validateBankName(bankName);
  const accountHolderNameError = validateAccountHolderName(accountHolderName);
  const accountNumberError = validateAccountNumber(accountNumber);
  const confirmAccountNumberError = validateConfirmAccountNumber(confirmAccountNumber, accountNumber);
  const bankCountryError = validateBankCountry(bankCountry);
  const routingNumberError = validateRoutingNumber(routingNumber, bankCountry);

  // Check if form is valid
  const isFormValid = (): boolean => {
    return (
      !bankNameError &&
      !accountHolderNameError &&
      !accountNumberError &&
      !confirmAccountNumberError &&
      !bankCountryError &&
      !routingNumberError
    );
  };

  // Save banking info and continue
  const handleContinue = async () => {
    if (!bankName.trim()) {
      setError('Please enter your bank name');
      return;
    }
    if (!accountHolderName.trim()) {
      setError('Please enter the account holder name');
      return;
    }
    if (!accountNumber.trim()) {
      setError('Please enter your account number');
      return;
    }
    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match');
      return;
    }
    if (!bankCountry) {
      setError('Please select your bank country');
      return;
    }
    if (!routingNumber.trim()) {
      setError('Please enter the routing number');
      return;
    }

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

    const encryptedAccountNumber = btoa(accountNumber);

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        bank_name: bankName.trim(),
        bank_account_holder_name: accountHolderName.trim(),
        bank_account_number_encrypted: encryptedAccountNumber,
        bank_routing_number: routingNumber.trim(),
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

  return (
    <div 
      className="bg-slate-50 min-h-screen"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-white max-w-[500px] mx-auto shadow-xl overflow-hidden border-x border-slate-100">
        
        {/* Sticky Header */}
        <header className="flex items-center px-4 pt-4 pb-2 bg-white sticky top-0 z-10">
          <button 
            onClick={handleBack}
            aria-label="Go back"
            className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
          >
            <BackIcon />
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-64">
          {/* Header Section - 22px title, 14px subtitle, center aligned */}
          <div className="px-5 pt-2 pb-6 flex flex-col items-center text-center">
            {/* Bank Icon */}
            <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2b8cee]/10">
              <BankIcon />
            </div>
            
            <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight mb-2">
              Wire Transfer Details
            </h1>
            <p className="text-slate-500 text-sm font-bold">
              Provide your banking information for investment transfers
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-5 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Investment Amount Card */}
          {hasAnyUnits && (
            <div className="mx-5 mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1">
                  INVESTMENT AMOUNT
                </p>
                <div className="text-3xl font-bold text-slate-900 mb-4">
                  {formatCurrency(totalInvestment)}
                </div>
                
                {/* Share Class Pills */}
                <div className="flex flex-wrap gap-2">
                  {SHARE_CLASSES.map((shareClass) => {
                    const units = getUnits(shareClass.id);
                    if (units === 0) return null;
                    
                    return (
                      <div
                        key={shareClass.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{
                          backgroundColor: shareClass.bgColor,
                          border: `1px solid ${shareClass.borderColor}`,
                        }}
                      >
                        {shareClass.icon}
                        <span 
                          className="text-xs font-bold"
                          style={{ color: shareClass.color }}
                        >
                          {shareClass.name} ×{units}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="px-5 space-y-5">
            {/* Bank Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">Bank Name*</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                onBlur={() => handleBlur('bankName')}
                placeholder="e.g. Chase Bank"
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all ${
                  touched.bankName && bankNameError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : touched.bankName && !bankNameError
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                    : 'border-slate-200 focus:border-[#2b8cee] focus:ring-[#2b8cee]'
                }`}
              />
              {touched.bankName && bankNameError && (
                <p className="text-red-500 text-xs font-medium">{bankNameError}</p>
              )}
              {touched.bankName && !bankNameError && bankName && (
                <p className="text-green-600 text-xs font-medium">✓ Valid bank name</p>
              )}
            </div>

            {/* Account Holder Name */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">Account Holder Name*</label>
              <input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                onBlur={() => handleBlur('accountHolderName')}
                placeholder="e.g. John Doe"
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all ${
                  touched.accountHolderName && accountHolderNameError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : touched.accountHolderName && !accountHolderNameError
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                    : 'border-slate-200 focus:border-[#2b8cee] focus:ring-[#2b8cee]'
                }`}
              />
              {touched.accountHolderName && accountHolderNameError && (
                <p className="text-red-500 text-xs font-medium">{accountHolderNameError}</p>
              )}
              {touched.accountHolderName && !accountHolderNameError && accountHolderName && (
                <p className="text-green-600 text-xs font-medium">✓ Valid name</p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">Account Type*</label>
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAccountType('checking')}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
                    accountType === 'checking'
                      ? 'bg-white text-[#2b8cee] shadow-sm border border-slate-100'
                      : 'bg-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Checking
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('savings')}
                  className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
                    accountType === 'savings'
                      ? 'bg-white text-[#2b8cee] shadow-sm border border-slate-100'
                      : 'bg-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Savings
                </button>
              </div>
            </div>

            {/* Account Number */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">Account Number*</label>
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('accountNumber')}
                placeholder="000000000"
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all ${
                  touched.accountNumber && accountNumberError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : touched.accountNumber && !accountNumberError
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                    : 'border-slate-200 focus:border-[#2b8cee] focus:ring-[#2b8cee]'
                }`}
              />
              {touched.accountNumber && accountNumberError && (
                <p className="text-red-500 text-xs font-medium">{accountNumberError}</p>
              )}
              {touched.accountNumber && !accountNumberError && accountNumber && (
                <p className="text-green-600 text-xs font-medium">✓ Valid account number ({accountNumber.length} digits)</p>
              )}
            </div>

            {/* Confirm Account Number */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">Confirm Account Number*</label>
              <input
                type="text"
                inputMode="numeric"
                value={confirmAccountNumber}
                onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                onBlur={() => handleBlur('confirmAccountNumber')}
                placeholder="000000000"
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all ${
                  touched.confirmAccountNumber && confirmAccountNumberError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : touched.confirmAccountNumber && !confirmAccountNumberError
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                    : 'border-slate-200 focus:border-[#2b8cee] focus:ring-[#2b8cee]'
                }`}
              />
              {touched.confirmAccountNumber && confirmAccountNumberError && (
                <p className="text-red-500 text-xs font-medium">{confirmAccountNumberError}</p>
              )}
              {touched.confirmAccountNumber && !confirmAccountNumberError && confirmAccountNumber && (
                <p className="text-green-600 text-xs font-medium">✓ Account numbers match</p>
              )}
            </div>

            {/* Bank Country */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">Bank Country*</label>
              <div className="relative">
                <select
                  value={bankCountry}
                  onChange={(e) => {
                    setBankCountry(e.target.value);
                    handleBlur('bankCountry');
                  }}
                  onBlur={() => handleBlur('bankCountry')}
                  className={`w-full appearance-none rounded-xl border bg-white px-4 py-3.5 text-base font-medium text-slate-900 focus:outline-none focus:ring-1 transition-all ${
                    touched.bankCountry && bankCountryError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : touched.bankCountry && !bankCountryError
                      ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                      : 'border-slate-200 focus:border-[#2b8cee] focus:ring-[#2b8cee]'
                  }`}
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code} disabled={country.code === ''}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <ChevronDownIcon />
                </div>
              </div>
              {touched.bankCountry && bankCountryError && (
                <p className="text-red-500 text-xs font-medium">{bankCountryError}</p>
              )}
              {touched.bankCountry && !bankCountryError && bankCountry && (
                <p className="text-green-600 text-xs font-medium">✓ Country selected</p>
              )}
            </div>

            {/* Routing Number */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">Routing Number (ABA)*</label>
              <input
                type="text"
                inputMode="numeric"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, bankCountry === 'US' ? 9 : 15))}
                onBlur={() => handleBlur('routingNumber')}
                placeholder={bankCountry === 'US' ? '000000000' : 'Enter routing number'}
                maxLength={bankCountry === 'US' ? 9 : 15}
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all ${
                  touched.routingNumber && routingNumberError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                    : touched.routingNumber && !routingNumberError
                    ? 'border-green-400 focus:border-green-500 focus:ring-green-500'
                    : 'border-slate-200 focus:border-[#2b8cee] focus:ring-[#2b8cee]'
                }`}
              />
              {touched.routingNumber && routingNumberError && (
                <p className="text-red-500 text-xs font-medium">{routingNumberError}</p>
              )}
              {touched.routingNumber && !routingNumberError && routingNumber && (
                <p className="text-green-600 text-xs font-medium">✓ Valid routing number ({routingNumber.length} digits)</p>
              )}
              {!touched.routingNumber && (
                <p className="text-xs font-medium text-slate-500 pt-1 pl-1">
                  {bankCountry === 'US' ? 'Must be exactly 9 digits (bottom left of your check)' : 'Usually 5-15 digits'}
                </p>
              )}
            </div>

            {/* Bank City (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900">
                Bank City <span className="text-slate-400 font-medium">(Optional)</span>
              </label>
              <input
                type="text"
                value={bankCity}
                onChange={(e) => setBankCity(e.target.value)}
                placeholder="e.g. New York"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#2b8cee] focus:outline-none focus:ring-1 focus:ring-[#2b8cee] transition-all"
              />
            </div>
          </div>

          {/* Security Note */}
          <div className="mx-5 mt-6 mb-8">
            <div className="flex gap-4 rounded-xl bg-[#F0F7FF] p-4 border border-[#2b8cee]/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2b8cee]/10">
                <LockIcon />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Bank-level Security</h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  Your data is encrypted with 256-bit SSL security and sent securely to your bank.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Fixed Footer - matching Step3 pattern */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 left-0 right-0 w-full max-w-[500px] mx-auto bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50" data-onboarding-footer>
            <div className="p-5 pb-8 flex flex-col gap-3">
              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={loading || !isFormValid()}
                className={`w-full bg-[#2b8cee] hover:bg-blue-600 text-white font-bold text-base py-4 rounded-full shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                  loading || !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : 'Continue'}
                {!loading && <ArrowForwardIcon />}
              </button>

              {/* Skip Button */}
              <button
                onClick={handleSkip}
                disabled={loading}
                className="w-full text-center text-slate-500 hover:text-slate-900 text-sm font-semibold py-2 transition-colors"
              >
                I'll do this later
              </button>

              {/* Back Button */}
              <button
                onClick={handleBack}
                disabled={loading}
                className="w-full text-center text-slate-400 hover:text-slate-900 text-sm font-semibold py-2 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingStep15;
