import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';

type RecurringFrequency = 'once_a_month' | 'twice_a_month' | 'weekly' | 'every_other_week';

// Share class configurations (consistent with Step 3 and Step 13)
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

function OnboardingStep14() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState<RecurringFrequency>('once_a_month');
  const [investmentDay, setInvestmentDay] = useState('1st');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500000);
  const [customAmount, setCustomAmount] = useState('');
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

  // Load existing data
  useEffect(() => {
    // Scroll to top on component mount
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
        // Load share class units
        setShareUnits({
          class_a_units: data.class_a_units || 0,
          class_b_units: data.class_b_units || 0,
          class_c_units: data.class_c_units || 0,
        });
        
        // Load recurring investment preferences
        if (data.recurring_frequency) setFrequency(data.recurring_frequency);
        if (data.recurring_day_of_month) setInvestmentDay(data.recurring_day_of_month);
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
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    setCustomAmount(e.target.value.replace(/[^\d]/g, ''));
  };

  const getFinalAmount = () => {
    return selectedAmount || parseInt(customAmount) || 0;
  };

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
    
    // Convert day string to integer
    const convertDayToInt = (day: string | number): number => {
      // If already a number, return it
      if (typeof day === 'number') return day;
      // If string "Last", return 31
      if (day === 'Last') return 31;
      // Extract number from string like "1st", "2nd", etc.
      return parseInt(day.replace(/\D/g, ''));
    };
    
    // Map frequency to database values
    const convertFrequencyToDb = (freq: RecurringFrequency): string => {
      const frequencyMap: Record<RecurringFrequency, string> = {
        'once_a_month': 'monthly',
        'twice_a_month': 'bimonthly',
        'weekly': 'weekly',
        'every_other_week': 'biweekly'
      };
      return frequencyMap[freq];
    };
    
    const updateData: any = {
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

    // Redirect to identity verification
    // Redirect to Meet CEO page (payment layer)
    navigate('/onboarding/meet-ceo');
  };

  const handleContinue = () => {
    const finalAmount = getFinalAmount();
    if (finalAmount < 10) {
      setError('Amount must be at least $10');
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
    <div className="min-h-screen flex items-center justify-center p-4 pt-28 pb-12" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-[28px] md:text-[36px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
              Make a recurring investment
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Grow your wealth with periodic contributions.
            </p>
          </div>

          {/* Share Class Allocation Summary */}
          {hasAnyUnits && (
            <div className="bg-[#F8FAFC] rounded-[16px] p-4 mb-6 border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[13px] uppercase tracking-wider text-[#64748B]">
                  Your Investment Allocation
                </h2>
                <span className="text-[16px] font-[600] text-[#0B1120]">
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

              {/* Edit link */}
              <button
                onClick={() => navigate('/onboarding/step-3')}
                className="text-[13px] text-[#00A9E0] hover:text-[#0087B8] mt-3 flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit allocation
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Frequency */}
          <div className="mb-6">
            <label className="block text-base mb-3" style={{ color: '#0B1120', fontWeight: 500 }}>
              Frequency
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'once_a_month', label: 'Once a month' },
                { value: 'twice_a_month', label: 'Twice a month' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'every_other_week', label: 'Every other week' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFrequency(option.value as RecurringFrequency)}
                  className="px-6 py-3 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: frequency === option.value ? '#0B1120' : '#D1D5DB',
                    backgroundColor: frequency === option.value ? '#F3F4F6' : '#FFFFFF',
                    color: '#0B1120',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Investment days */}
          <div className="mb-6">
            <label className="block text-base mb-3" style={{ color: '#0B1120', fontWeight: 500 }}>
              Investment days
            </label>
            <div className="relative">
              <select
                value={investmentDay}
                onChange={(e) => setInvestmentDay(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-gray-400 appearance-none"
                style={{ backgroundColor: '#FFFFFF' }}
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
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                  <path d="M1 1L8 8L15 1" stroke="#0B1120" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-8">
            <label className="block text-base mb-3" style={{ color: '#0B1120', fontWeight: 500 }}>
              Recurring Amount
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {[500000, 750000, 1000000, 1500000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleAmountClick(amount)}
                  className="px-6 py-3 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: selectedAmount === amount ? '#0B1120' : '#D1D5DB',
                    backgroundColor: selectedAmount === amount ? '#F3F4F6' : '#FFFFFF',
                    color: '#0B1120',
                  }}
                >
                  ${amount.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-400">
                $
              </span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Other Amount"
                className="w-full pl-10 pr-4 py-4 border-2 border-gray-300 rounded-lg text-lg focus:outline-none focus:border-gray-400"
                style={{ 
                  backgroundColor: '#FFFFFF',
                  color: customAmount ? '#0B1120' : '#9CA3AF'
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={loading || getFinalAmount() < 10}
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
          style={{ color: '#8B4513' }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep14;
