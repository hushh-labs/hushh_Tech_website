import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

type RecurringFrequency = 'once_a_month' | 'twice_a_month' | 'weekly' | 'every_other_week';

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Edit icon
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Chevron down icon
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

// Check icon
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

// Arrow forward icon
const ArrowForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </svg>
);

// Share class configurations
interface ShareClassInfo {
  id: string;
  name: string;
  unitPrice: number;
  color: string;
}

const SHARE_CLASSES: ShareClassInfo[] = [
  {
    id: 'class_a',
    name: 'Class A',
    unitPrice: 25000000,
    color: '#E5E4E2', // Platinum (gray)
  },
  {
    id: 'class_b',
    name: 'Class B',
    unitPrice: 5000000,
    color: '#D4AF37', // Gold (yellow)
  },
  {
    id: 'class_c',
    name: 'Class C',
    unitPrice: 1000000,
    color: '#2b8cee', // Primary blue
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

// Validation constants
const MIN_AMOUNT = 100; // Minimum $100
const MAX_AMOUNT = 100000000; // Maximum $100 million

// Format number with commas
const formatNumberWithCommas = (value: string): string => {
  const numbers = value.replace(/[^\d]/g, '');
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse formatted number to raw number
const parseFormattedNumber = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, '')) || 0;
};

function OnboardingStep14() {
  const navigate = useNavigate();
  const isFooterVisible = useFooterVisibility();
  const [frequency, setFrequency] = useState<RecurringFrequency>('once_a_month');
  const [investmentDay, setInvestmentDay] = useState('1st');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(750000);
  const [customAmount, setCustomAmount] = useState('');
  const [customAmountError, setCustomAmountError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  // Calculate allocation percentages for progress bar
  const getPercentages = () => {
    if (totalInvestment === 0) return { a: 0, b: 0, c: 0 };
    const aAmount = shareUnits.class_a_units * 25000000;
    const bAmount = shareUnits.class_b_units * 5000000;
    const cAmount = shareUnits.class_c_units * 1000000;
    return {
      a: (aAmount / totalInvestment) * 100,
      b: (bAmount / totalInvestment) * 100,
      c: (cAmount / totalInvestment) * 100,
    };
  };

  const percentages = getPercentages();

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
        .select('recurring_frequency, recurring_day_of_month, recurring_amount, class_a_units, class_b_units, class_c_units')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setShareUnits({
          class_a_units: data.class_a_units || 0,
          class_b_units: data.class_b_units || 0,
          class_c_units: data.class_c_units || 0,
        });
        
        if (data.recurring_frequency) {
          const freqMap: Record<string, RecurringFrequency> = {
            'monthly': 'once_a_month',
            'bimonthly': 'twice_a_month',
            'weekly': 'weekly',
            'biweekly': 'every_other_week'
          };
          setFrequency(freqMap[data.recurring_frequency] || 'once_a_month');
        }
        if (data.recurring_day_of_month) {
          const dayNum = data.recurring_day_of_month;
          if (dayNum === 31) {
            setInvestmentDay('Last');
          } else {
            const suffix = dayNum === 1 ? 'st' : dayNum === 2 ? 'nd' : dayNum === 3 ? 'rd' : 'th';
            setInvestmentDay(`${dayNum}${suffix}`);
          }
        }
        if (data.recurring_amount) {
          const amount = data.recurring_amount;
          if ([500000, 750000, 1000000, 1500000].includes(amount)) {
            setSelectedAmount(amount);
          } else {
            setSelectedAmount(null);
            setCustomAmount(amount.toString());
          }
        }
      }
    };

    loadData();
  }, []);

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setCustomAmountError(null);
    setError(null);
  };

  // Validate custom amount input
  const validateAmount = (rawValue: number): string | null => {
    if (rawValue === 0) return null; // Empty is okay, will be caught on submit
    if (rawValue < MIN_AMOUNT) {
      return `Minimum amount is $${MIN_AMOUNT.toLocaleString()}`;
    }
    if (rawValue > MAX_AMOUNT) {
      return `Maximum amount is $${(MAX_AMOUNT / 1000000).toFixed(0)}M`;
    }
    return null;
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setError(null);
    
    // Extract only digits
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    
    // Limit input to prevent extremely long numbers (max 12 digits = $999,999,999,999)
    if (rawValue.length > 12) {
      return;
    }
    
    // Format with commas for display
    const formattedValue = formatNumberWithCommas(rawValue);
    setCustomAmount(formattedValue);
    
    // Validate
    const numericValue = parseFormattedNumber(formattedValue);
    const validationError = validateAmount(numericValue);
    setCustomAmountError(validationError);
  };

  const getFinalAmount = () => {
    if (selectedAmount) return selectedAmount;
    return parseFormattedNumber(customAmount);
  };
  
  // Check if form is valid for submission
  const isFormValid = () => {
    const finalAmount = getFinalAmount();
    if (finalAmount === 0) return false;
    if (customAmountError) return false;
    if (customAmount && !selectedAmount) {
      const numericValue = parseFormattedNumber(customAmount);
      if (numericValue < MIN_AMOUNT || numericValue > MAX_AMOUNT) return false;
    }
    return true;
  };

  const getUnits = (classId: string): number => {
    if (classId === 'class_a') return shareUnits.class_a_units;
    if (classId === 'class_b') return shareUnits.class_b_units;
    if (classId === 'class_c') return shareUnits.class_c_units;
    return 0;
  };

  const completeOnboarding = async (skipRecurring: boolean = false) => {
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

    const finalAmount = getFinalAmount();
    
    const convertDayToInt = (day: string | number): number => {
      if (typeof day === 'number') return day;
      if (day === 'Last') return 31;
      return parseInt(day.replace(/\D/g, ''));
    };
    
    const convertFrequencyToDb = (freq: RecurringFrequency): string => {
      const frequencyMap: Record<RecurringFrequency, string> = {
        'once_a_month': 'monthly',
        'twice_a_month': 'bimonthly',
        'weekly': 'weekly',
        'every_other_week': 'biweekly'
      };
      return frequencyMap[freq];
    };
    
    const updateData: Record<string, unknown> = {
      user_id: user.id,
      current_step: 14,
      is_completed: true,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!skipRecurring && finalAmount > 0) {
      updateData.recurring_frequency = convertFrequencyToDb(frequency);
      updateData.recurring_day_of_month = convertDayToInt(investmentDay);
      updateData.recurring_amount = finalAmount;
    }

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert(updateData, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/step-15');
  };

  const handleContinue = () => {
    const finalAmount = getFinalAmount();
    
    // Check if there's already a validation error
    if (customAmountError) {
      setError(customAmountError);
      return;
    }
    
    // Validate amount
    if (finalAmount === 0) {
      setError('Please select or enter an amount');
      return;
    }
    
    if (finalAmount < MIN_AMOUNT) {
      setError(`Minimum amount is $${MIN_AMOUNT.toLocaleString()}`);
      return;
    }
    
    if (finalAmount > MAX_AMOUNT) {
      setError(`Maximum amount is $${(MAX_AMOUNT / 1000000).toFixed(0)}M`);
      return;
    }
    
    completeOnboarding(false);
  };

  const handleSkip = () => {
    completeOnboarding(true);
  };

  const handleBack = () => {
    navigate('/onboarding/step-13');
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
            <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight mb-2">
              Make a recurring investment
            </h1>
            <p className="text-slate-500 text-sm font-bold">
              Grow your wealth with periodic contributions.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-5 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Investment Allocation Card */}
          {hasAnyUnits && (
            <div className="mx-5 mb-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    YOUR INVESTMENT ALLOCATION
                  </h2>
                  <button 
                    onClick={() => navigate('/onboarding/step-3')}
                    className="text-[#2b8cee] text-sm font-semibold hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    <EditIcon />
                    Edit allocation
                  </button>
                </div>
                
                {/* Total Amount */}
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900">
                    {formatCurrency(totalInvestment)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex h-3 w-full rounded-full overflow-hidden mb-4">
                  {percentages.a > 0 && (
                    <div 
                      className="h-full" 
                      style={{ width: `${percentages.a}%`, backgroundColor: '#E5E4E2' }}
                    />
                  )}
                  {percentages.b > 0 && (
                    <div 
                      className="h-full" 
                      style={{ width: `${percentages.b}%`, backgroundColor: '#D4AF37' }}
                    />
                  )}
                  {percentages.c > 0 && (
                    <div 
                      className="h-full" 
                      style={{ width: `${percentages.c}%`, backgroundColor: '#2b8cee' }}
                    />
                  )}
                </div>

                {/* Class Pills */}
                <div className="flex flex-wrap gap-2">
                  {SHARE_CLASSES.map((shareClass) => {
                    const units = getUnits(shareClass.id);
                    if (units === 0) return null;
                    
                    return (
                      <div
                        key={shareClass.id}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 py-1.5 px-3"
                      >
                        <span 
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: shareClass.color }}
                        />
                        <span className="text-xs font-semibold text-slate-900">
                          {shareClass.name} ×{units}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Frequency Section */}
          <div className="mx-5 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Frequency</h2>
              
              {/* 2x2 Grid Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { value: 'once_a_month', label: 'Once a month' },
                  { value: 'twice_a_month', label: 'Twice a month' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'every_other_week', label: 'Every other week' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFrequency(option.value as RecurringFrequency)}
                    className={`flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                      frequency === option.value
                        ? 'bg-[#2b8cee] text-white shadow-sm ring-2 ring-[#2b8cee] ring-offset-1'
                        : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Investment Days Dropdown */}
              <div className="relative mt-4">
                <label className="absolute -top-2 left-3 bg-white px-1 text-xs font-medium text-slate-500">
                  Investment days
                </label>
                <select
                  value={investmentDay}
                  onChange={(e) => setInvestmentDay(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-300 bg-white text-slate-900 px-3 text-base font-medium focus:border-[#2b8cee] focus:ring-1 focus:ring-[#2b8cee] outline-none appearance-none cursor-pointer transition-shadow"
                >
                  <option value="1st">1st</option>
                  <option value="2nd">2nd</option>
                  <option value="5th">5th</option>
                  <option value="10th">10th</option>
                  <option value="15th">15th</option>
                  <option value="20th">20th</option>
                  <option value="25th">25th</option>
                  <option value="Last">Last day of month</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Amount Section */}
          <div className="mx-5 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Recurring Amount</h2>
              
              {/* Amount Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[500000, 750000, 1000000, 1500000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleAmountClick(amount)}
                    className={`relative flex flex-col items-center justify-center py-3 rounded-xl transition-all ${
                      selectedAmount === amount
                        ? 'border-2 border-[#2b8cee] bg-[#2b8cee]/5'
                        : 'border border-slate-200 bg-white hover:border-[#2b8cee]/50 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`text-base font-bold ${
                      selectedAmount === amount ? 'text-[#2b8cee]' : 'text-slate-900'
                    }`}>
                      ${amount.toLocaleString()}
                    </span>
                    {selectedAmount === amount && (
                      <div className="absolute -top-2 -right-2 bg-[#2b8cee] text-white rounded-full p-0.5">
                        <CheckIcon />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="space-y-2">
                <div className="relative">
                  <span className={`absolute inset-y-0 left-0 pl-3 flex items-center font-medium text-lg ${
                    customAmountError ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                    placeholder="Other Amount"
                    className={`w-full h-12 rounded-xl border bg-white text-slate-900 pl-8 pr-3 text-lg font-bold outline-none transition-all placeholder:text-slate-300 ${
                      customAmountError 
                        ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                        : 'border-slate-300 focus:border-[#2b8cee] focus:ring-1 focus:ring-[#2b8cee]'
                    }`}
                  />
                </div>
                
                {/* Validation Error Message */}
                {customAmountError && (
                  <p className="text-red-500 text-xs font-medium flex items-center gap-1 px-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {customAmountError}
                  </p>
                )}
                
                {/* Helper text */}
                {!customAmountError && customAmount && (
                  <p className="text-green-600 text-xs font-medium flex items-center gap-1 px-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                    Amount: ${parseFormattedNumber(customAmount).toLocaleString()}
                  </p>
                )}
                
                {/* Min/Max hint */}
                {!customAmount && !selectedAmount && (
                  <p className="text-slate-400 text-xs px-1">
                    Min: $100 • Max: $100M
                  </p>
                )}
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

export default OnboardingStep14;
