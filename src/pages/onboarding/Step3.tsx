import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Minus icon
const MinusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12H19" />
  </svg>
);

// Plus icon
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5V19M5 12H19" />
  </svg>
);

// Share class configurations matching HTML template
interface ShareClass {
  id: string;
  name: string;
  tier: 'ultra' | 'premium' | 'standard';
  unitPrice: number;
  displayPrice: string;
  description: string;
  stripeGradient: string;
  hoverBorder: string;
}

const SHARE_CLASSES: ShareClass[] = [
  {
    id: 'class_a',
    name: 'Class A',
    tier: 'ultra',
    unitPrice: 25000000,
    displayPrice: '$25M/unit',
    description: 'Ultra High Net Worth tier with maximum allocation priority and exclusive benefits.',
    stripeGradient: 'from-slate-300 to-slate-500',
    hoverBorder: 'hover:border-slate-300',
  },
  {
    id: 'class_b',
    name: 'Class B',
    tier: 'premium',
    unitPrice: 5000000,
    displayPrice: '$5M/unit',
    description: 'Premium tier with enhanced portfolio access and dedicated relationship management.',
    stripeGradient: 'from-amber-300 to-amber-500',
    hoverBorder: 'hover:border-amber-200',
  },
  {
    id: 'class_c',
    name: 'Class C',
    tier: 'standard',
    unitPrice: 1000000,
    displayPrice: '$1M/unit',
    description: 'Standard tier with full access to AI-powered multi-strategy alpha portfolio.',
    stripeGradient: 'bg-[#2b8cee]',
    hoverBorder: 'hover:border-[#2b8cee]/30',
  },
];

// Format currency for display
const formatCurrency = (amount: number): string => {
  if (amount === 0) return '$0';
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(0)}M`;
  }
  return `$${amount.toLocaleString()}`;
};

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [units, setUnits] = useState<Record<string, number>>({
    class_a: 0,
    class_b: 0,
    class_c: 0,
  });

  // Calculate total investment
  const totalInvestment = SHARE_CLASSES.reduce((total, shareClass) => {
    return total + (units[shareClass.id] * shareClass.unitPrice);
  }, 0);

  // Check if at least one unit is selected
  const hasSelection = Object.values(units).some(count => count > 0);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const getCurrentUser = async () => {
      if (!config.supabaseClient) return;
      
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);

      // Load existing selections if any
      const { data: onboardingData } = await config.supabaseClient
        .from('onboarding_data')
        .select('class_a_units, class_b_units, class_c_units')
        .eq('user_id', user.id)
        .single();

      if (onboardingData) {
        setUnits({
          class_a: onboardingData.class_a_units || 0,
          class_b: onboardingData.class_b_units || 0,
          class_c: onboardingData.class_c_units || 0,
        });
      }
    };

    getCurrentUser();
  }, [navigate]);

  const handleUnitChange = (classId: string, delta: number) => {
    setUnits(prev => ({
      ...prev,
      [classId]: Math.max(0, prev[classId] + delta),
    }));
  };

  const handleNext = async () => {
    if (!userId || !config.supabaseClient || !hasSelection) return;

    setIsLoading(true);
    try {
      // Save share unit selections to database
      await config.supabaseClient
        .from('onboarding_data')
        .update({
          selected_fund: 'hushh_fund_a',
          class_a_units: units.class_a,
          class_b_units: units.class_b,
          class_c_units: units.class_c,
          initial_investment_amount: totalInvestment,
          current_step: 3,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Navigate to step 4
      navigate('/onboarding/step-4');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/step-2');
  };

  // Render share class card
  const renderShareClassCard = (shareClass: ShareClass) => {
    const unitCount = units[shareClass.id];
    const isUltra = shareClass.tier === 'ultra';
    const isPremium = shareClass.tier === 'premium';

    return (
      <div
        key={shareClass.id}
        className={`group relative rounded-xl border border-slate-200 bg-white p-5 transition-all ${shareClass.hoverBorder} hover:shadow-md`}
      >
        {/* Left colored vertical stripe */}
        <div 
          className={`absolute left-0 top-4 h-8 w-1 rounded-r-full ${
            shareClass.tier === 'standard' 
              ? 'bg-[#2b8cee]' 
              : `bg-gradient-to-b ${shareClass.stripeGradient}`
          }`}
        />
        
        <div className="flex flex-col gap-4">
          {/* Top row: Class name, badge, price */}
          <div className="flex items-start justify-between">
            <div className="max-w-[65%]">
              <h3 className="text-slate-900 text-lg font-bold">{shareClass.name}</h3>
              
              {/* Tier badge */}
              {isUltra && (
                <div className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                  ULTRA
                </div>
              )}
              {isPremium && (
                <div className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wide">
                  PREMIUM
                </div>
              )}
              
              <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
                {shareClass.description}
              </p>
            </div>
            
            <div className="text-right shrink-0">
              <p className="text-slate-900 text-lg font-bold">{shareClass.displayPrice}</p>
            </div>
          </div>

          {/* Bottom row: Units selector */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Units</span>
            
            <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-100">
              {/* Minus button */}
              <button
                onClick={() => handleUnitChange(shareClass.id, -1)}
                disabled={unitCount === 0}
                className="flex size-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-300 transition-colors disabled:opacity-50"
              >
                <MinusIcon />
              </button>
              
              {/* Unit count */}
              <span className="w-8 text-center text-slate-900 font-bold text-lg">
                {unitCount}
              </span>
              
              {/* Plus button */}
              <button
                onClick={() => handleUnitChange(shareClass.id, 1)}
                className="flex size-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-900 shadow-sm hover:border-slate-300 active:bg-slate-50 transition-colors"
              >
                <PlusIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
        <main className="flex-1 flex flex-col px-6 pb-44">
          {/* Header Section */}
          <div className="mb-8 mt-2 flex flex-col items-center text-center">
            <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight mb-2">
              Hushh Fund A: AI-Powered Multi-Strategy Alpha
            </h1>
            <p className="text-slate-500 text-sm font-bold tracking-wide uppercase">
              TAGLINE: The AI-Powered Berkshire Hathaway
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <p className="text-slate-900 font-bold mb-2 text-base">
              Select the number of units for each share class. You can invest in multiple classes.
            </p>
            <p className="text-slate-600 text-sm font-medium leading-relaxed">
              Our inaugural fund demonstrating an AI-driven value investing strategy designed to deliver consistent, market-beating returns and sustainable, risk-adjusted alpha.
            </p>
          </div>

          {/* Share Class Cards */}
          <div className="flex flex-col gap-6">
            {SHARE_CLASSES.map(renderShareClassCard)}
          </div>
        </main>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          {/* Total Investment */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              TOTAL INVESTMENT
            </span>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalInvestment)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!hasSelection || isLoading}
              className={`flex w-full cursor-pointer items-center justify-center rounded-full bg-[#2b8cee] py-4 text-white text-base font-bold transition-all hover:bg-blue-600 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 ${
                !hasSelection || isLoading ? 'disabled:cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Saving...' : 'Next'}
            </button>

            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex w-full cursor-pointer items-center justify-center rounded-full bg-transparent py-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors"
            >
              Back
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-400 leading-tight">
              Minimum investment per unit • Units can be adjusted later
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
