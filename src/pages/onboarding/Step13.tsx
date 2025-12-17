import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';

// Share class configurations
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

const formatFullCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Crown icon for Gold tier
const CrownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill="#DAA520" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Diamond icon for Silver tier
const DiamondIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" 
          fill="#A1A1AA" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function OnboardingStep13() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const calculateTotal = () => {
    return (
      (shareUnits.class_a_units * 25000000) +
      (shareUnits.class_b_units * 5000000) +
      (shareUnits.class_c_units * 1000000)
    );
  };

  const totalInvestment = calculateTotal();

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
        .select('class_a_units, class_b_units, class_c_units, initial_investment_amount')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setShareUnits({
          class_a_units: data.class_a_units || 0,
          class_b_units: data.class_b_units || 0,
          class_c_units: data.class_c_units || 0,
        });
      }
    };

    loadData();
  }, []);

  const handleContinue = async () => {
    if (totalInvestment < 1000000) {
      setError('Minimum investment is $1 million');
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

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        initial_investment_amount: totalInvestment,
        current_step: 13,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/step-14');
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

  const hasAnyUnits = shareUnits.class_a_units > 0 || shareUnits.class_b_units > 0 || shareUnits.class_c_units > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-28 pb-12" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-[28px] md:text-[36px] mb-2" style={{ color: '#0B1120', fontWeight: 500 }}>
              Your Investment Summary
            </h1>
            <p className="text-[16px] text-[#64748B]">
              Review your share class allocation below
            </p>
          </div>

          {/* Share Class Breakdown */}
          <div className="bg-[#F8FAFC] rounded-[16px] p-5 mb-6 border border-[#E2E8F0]">
            <h2 className="text-[14px] uppercase tracking-wider text-[#64748B] mb-4">
              Share Class Units
            </h2>
            
            <div className="space-y-3">
              {SHARE_CLASSES.map((shareClass) => {
                const units = getUnits(shareClass.id);
                const subtotal = units * shareClass.unitPrice;
                const hasUnits = units > 0;

                return (
                  <div
                    key={shareClass.id}
                    className="flex items-center justify-between p-4 rounded-[12px] transition-all"
                    style={{
                      backgroundColor: hasUnits ? shareClass.colors.background : '#FFFFFF',
                      border: hasUnits 
                        ? `2px solid ${shareClass.colors.primary}` 
                        : '2px solid #E2E8F0',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Tier icon */}
                      {getTierIcon(shareClass.tier) && (
                        <div className="flex-shrink-0">
                          {getTierIcon(shareClass.tier)}
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-[16px] font-[600]"
                            style={{ color: hasUnits ? shareClass.colors.primary : '#94A3B8' }}
                          >
                            {shareClass.name}
                          </span>
                          <span className="text-[12px] text-[#94A3B8]">
                            @ {formatCurrency(shareClass.unitPrice)}/unit
                          </span>
                        </div>
                        {hasUnits && (
                          <div 
                            className="text-[14px]"
                            style={{ color: shareClass.colors.primary }}
                          >
                            Subtotal: {formatCurrency(subtotal)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Units count */}
                    <div 
                      className="flex items-center justify-center min-w-[60px] h-[40px] rounded-full text-[18px] font-[600]"
                      style={{
                        backgroundColor: hasUnits ? shareClass.colors.primary : '#E2E8F0',
                        color: hasUnits ? '#FFFFFF' : '#94A3B8',
                      }}
                    >
                      {units}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Edit link */}
            <button
              onClick={() => navigate('/onboarding/step-3')}
              className="text-[14px] text-[#00A9E0] hover:text-[#0087B8] mt-4 flex items-center gap-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit share class selection
            </button>
          </div>

          {/* Total Investment Display */}
          <div 
            className="rounded-[16px] p-6 mb-6 text-center"
            style={{ 
              background: hasAnyUnits 
                ? 'linear-gradient(135deg, #0B1120 0%, #1E293B 100%)' 
                : '#F1F5F9',
              color: hasAnyUnits ? '#FFFFFF' : '#64748B',
            }}
          >
            <div className="text-[14px] uppercase tracking-wider mb-2" style={{ opacity: 0.7 }}>
              Total Investment Amount
            </div>
            <div className="text-[36px] font-[600] mb-1">
              {hasAnyUnits ? formatFullCurrency(totalInvestment) : '$0'}
            </div>
            {hasAnyUnits && (
              <div className="text-[14px]" style={{ opacity: 0.7 }}>
                {[
                  shareUnits.class_a_units > 0 ? `${shareUnits.class_a_units} Class A` : '',
                  shareUnits.class_b_units > 0 ? `${shareUnits.class_b_units} Class B` : '',
                  shareUnits.class_c_units > 0 ? `${shareUnits.class_c_units} Class C` : '',
                ].filter(Boolean).join(' + ')} units
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-600 mb-4 text-center">{error}</p>
          )}

          {/* Investment requirement notice */}
          {!hasAnyUnits && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mt-1 flex-shrink-0">
                  <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <div>
                  <p className="text-sm text-amber-800 font-medium">No units selected</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Please go back to Step 3 to select your share class units before continuing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasAnyUnits && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mt-1 flex-shrink-0">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" fill="#0B1120"/>
                </svg>
                <div>
                  <p className="text-sm text-gray-700">
                    We are currently accepting investments of $1 million or greater for Hushh Fund A.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={loading || !hasAnyUnits || totalInvestment < 1000000}
          className="w-full py-4 rounded-lg text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: hasAnyUnits && totalInvestment >= 1000000 
              ? 'linear-gradient(to right, #00A9E0, #6DD3EF)' 
              : '#E2E8F0',
            color: hasAnyUnits && totalInvestment >= 1000000 ? '#0B1120' : '#94A3B8',
            fontWeight: 500,
          }}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>

        {/* Back button */}
        <button
          onClick={() => navigate('/onboarding/step-12')}
          className="w-full text-[17px] font-[500] text-[#64748B] hover:text-[#0B1120] transition-colors py-3 mt-3"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default OnboardingStep13;
