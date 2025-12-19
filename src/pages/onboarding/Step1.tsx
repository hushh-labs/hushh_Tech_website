import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { AccountType, ACCOUNT_TIERS, migrateAccountType } from '../../types/onboarding';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// Diamond icon for Premium tier
const DiamondIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" />
  </svg>
);

// Verified/Star icon for Ultra tier
const VerifiedIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Help icon
const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const isFooterVisible = useFooterVisibility();

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      if (!config.supabaseClient) return;
      
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUserId(user.id);

      // Check if user already has onboarding data
      const { data: onboardingData } = await config.supabaseClient
        .from('onboarding_data')
        .select('account_type, current_step')
        .eq('user_id', user.id)
        .single();

      if (onboardingData?.account_type) {
        // Migrate legacy account types if needed
        const migratedType = migrateAccountType(onboardingData.account_type);
        setSelectedAccount(migratedType);
      }
    };

    getCurrentUser();
  }, [navigate]);

  const handleContinue = async () => {
    if (!selectedAccount || !userId || !config.supabaseClient) return;

    setIsLoading(true);
    try {
      // Save to Supabase
      const { error } = await config.supabaseClient
        .from('onboarding_data')
        .upsert({
          user_id: userId,
          account_type: selectedAccount,
          current_step: 1,
          completed_steps: [1],
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving onboarding data:', error);
        return;
      }

      // Navigate to step 2
      navigate('/onboarding/step-2');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Account tier data matching the HTML template
  const tierData = [
    {
      id: 'wealth_1m' as AccountType,
      minimum: '$1 million',
      name: 'Hushh Wealth Investment Account',
      description: 'A flexible wealth investment account designed to help you build and preserve long-term wealth through AI-powered strategies.',
      badge: null,
    },
    {
      id: 'wealth_5m' as AccountType,
      minimum: '$5 million',
      name: 'Hushh Wealth Investment Account',
      description: 'Enhanced wealth management with premium portfolio strategies and dedicated relationship support.',
      badge: 'PREMIUM',
    },
    {
      id: 'ultra_25m' as AccountType,
      minimum: '$25 million',
      name: 'Hushh Ultra High Net Worth Investment Account',
      description: 'Exclusive investment access tailored for ultra high net worth individuals and families worldwide, with bespoke portfolio solutions.',
      badge: 'ULTRA',
    },
  ];

  return (
    <div 
      className="bg-slate-50 min-h-screen"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-white max-w-[500px] mx-auto shadow-xl overflow-hidden border-x border-slate-100">
        
        {/* Fixed Header - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <header className="fixed top-0 z-20 w-full max-w-[500px] flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]" data-onboarding-header>
            <button 
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
            >
              <BackIcon />
            </button>
            <button 
              className="flex size-10 shrink-0 items-center justify-center text-slate-900 rounded-full hover:bg-slate-50 transition-colors"
              aria-label="Help"
            >
              <HelpIcon />
            </button>
          </header>
        )}
        
        {/* Spacer for fixed header */}
        <div className="h-16" />

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-6 pb-52">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center mt-2 mb-8 space-y-3">
            <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight">
              Select Your Account
            </h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[280px]">
              Choose the investment level that best fits your financial goals.
            </p>
          </div>

          {/* Account Options */}
          <div className="flex flex-col gap-4 w-full">
            {tierData.map((tier) => {
              const isSelected = selectedAccount === tier.id;
              const isPremium = tier.badge === 'PREMIUM';
              const isUltra = tier.badge === 'ULTRA';

              return (
                <label
                  key={tier.id}
                  className="group relative flex flex-col w-full cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name="tier_selection"
                    value={tier.id}
                    checked={isSelected}
                    onChange={() => setSelectedAccount(tier.id)}
                    className="peer sr-only"
                  />
                  <div
                    className={`
                      flex flex-col p-5 rounded-2xl border-2 bg-white transition-all duration-300 ease-out
                      ${isSelected 
                        ? 'border-[#2b8cee] shadow-[0_0_20px_-5px_rgba(43,140,238,0.3)] bg-[rgba(43,140,238,0.03)]' 
                        : 'border-slate-200 group-hover:border-slate-300'
                      }
                    `}
                  >
                    {/* Minimum Amount & Radio Button Row */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col">
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {tier.minimum}{' '}
                          <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide ml-0.5">
                            minimum
                          </span>
                        </span>
                      </div>
                      {/* Custom Radio UI */}
                      <div 
                        className={`
                          w-6 h-6 rounded-full border-2 relative transition-all duration-200 shrink-0
                          ${isSelected 
                            ? 'bg-[#2b8cee] border-[#2b8cee]' 
                            : 'border-slate-300'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>

                    {/* Account Name & Badge Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {tier.name}
                      </h3>
                      {isPremium && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-gray-100 to-[#E5E4E2] text-slate-600 border border-slate-200 shadow-sm flex items-center gap-1 shrink-0">
                          <DiamondIcon /> PREMIUM
                        </span>
                      )}
                      {isUltra && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-[#FFF8E1] to-[#FFE082] text-yellow-800 border border-yellow-200 shadow-sm flex items-center gap-1 shrink-0">
                          <VerifiedIcon /> ULTRA
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      {tier.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </main>

        {/* Fixed Footer - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" data-onboarding-footer>
            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedAccount || isLoading}
              className={`
                w-full flex items-center justify-center h-14 rounded-full font-bold text-base tracking-wide transition-all mb-4
                ${selectedAccount && !isLoading
                  ? 'bg-[#2b8cee] hover:bg-blue-600 active:scale-[0.98] text-white cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
            
            {/* Footer Note */}
            <p className="text-center text-[10px] text-slate-400 px-4 leading-tight">
              By continuing, you agree to the{' '}
              <a href="/terms" className="underline decoration-slate-300 hover:text-[#2b8cee] transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline decoration-slate-300 hover:text-[#2b8cee] transition-colors">
                Privacy Policy
              </a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
