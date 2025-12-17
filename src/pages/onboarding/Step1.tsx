import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { AccountType, ACCOUNT_TIERS, migrateAccountType } from '../../types/onboarding';

// Crown icon for Ultra High Net Worth tier
const CrownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill="#DAA520" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Diamond icon for Silver tier
const DiamondIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" 
          fill="#A1A1AA" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 9H22" stroke="#71717A" strokeWidth="1.5"/>
    <path d="M12 21L9 9L12 3L15 9L12 21Z" stroke="#71717A" strokeWidth="1.5"/>
  </svg>
);

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState<AccountType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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

  // Render account tier card
  const renderAccountCard = (accountType: AccountType) => {
    const tier = ACCOUNT_TIERS[accountType];
    const isSelected = selectedAccount === accountType;
    const isGold = tier.tierLevel === 'gold';
    const isSilver = tier.tierLevel === 'silver';

    return (
      <button
        key={accountType}
        onClick={() => setSelectedAccount(accountType)}
        className="w-full text-left p-6 rounded-[16px] border-2 transition-all duration-200 relative overflow-hidden"
        style={{
          borderColor: isSelected ? tier.colors.selectedBorder : tier.colors.border,
          backgroundColor: isSelected ? tier.colors.selectedBackground : tier.colors.background,
        }}
      >
        {/* Premium tier badge */}
        {isGold && (
          <div 
            className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1"
            style={{ 
              background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 50%, #FFD700 100%)',
              color: '#FFFFFF'
            }}
          >
            <CrownIcon />
            <span>ULTRA</span>
          </div>
        )}
        {isSilver && (
          <div 
            className="absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg flex items-center gap-1"
            style={{ 
              background: 'linear-gradient(135deg, #71717A 0%, #A1A1AA 50%, #D4D4D8 100%)',
              color: '#FFFFFF'
            }}
          >
            <DiamondIcon />
            <span>PREMIUM</span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            {/* Minimum amount */}
            <div 
              className="text-[14px] mb-2 font-medium"
              style={{ color: isGold ? tier.colors.primary : isSilver ? tier.colors.primary : '#64748B' }}
            >
              {tier.minimum}
            </div>
            
            {/* Account name */}
            <h3 
              className="text-[20px] font-[500] mb-2"
              style={{ 
                color: isGold ? tier.colors.accent : isSilver ? tier.colors.accent : '#0B1120',
                background: isGold ? 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)' : 'none',
                WebkitBackgroundClip: isGold ? 'text' : 'border-box',
                WebkitTextFillColor: isGold ? 'transparent' : 'inherit',
              }}
            >
              {tier.name}
            </h3>
            
            {/* Description */}
            <p 
              className="text-[16px] leading-[1.5]"
              style={{ color: isGold ? '#8B6914' : isSilver ? '#52525B' : '#64748B' }}
            >
              {tier.description}
            </p>
          </div>
          
          {/* Selection indicator */}
          <div className="flex-shrink-0 mt-2">
            <div 
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: isSelected ? tier.colors.primary : (isGold ? tier.colors.border : isSilver ? tier.colors.border : '#CBD5E1'),
                backgroundColor: isSelected ? tier.colors.primary : tier.colors.background,
              }}
            >
              {isSelected && (
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: isGold ? '#FFFEF7' : isSilver ? '#FAFAFA' : '#FFFFFF' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Decorative bottom gradient for premium tiers */}
        {isGold && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ 
              background: 'linear-gradient(90deg, #B8860B 0%, #DAA520 50%, #FFD700 100%)'
            }}
          />
        )}
        {isSilver && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ 
              background: 'linear-gradient(90deg, #71717A 0%, #A1A1AA 50%, #D4D4D8 100%)'
            }}
          />
        )}
      </button>
    );
  };

  // Get button gradient based on selected tier
  const getButtonGradient = () => {
    if (!selectedAccount) return '#E2E8F0';
    const tier = ACCOUNT_TIERS[selectedAccount];
    if (tier.tierLevel === 'gold') {
      return 'linear-gradient(to right, #B8860B, #DAA520)';
    }
    if (tier.tierLevel === 'silver') {
      return 'linear-gradient(to right, #71717A, #A1A1AA)';
    }
    return 'linear-gradient(to right, #00A9E0, #6DD3EF)';
  };

  const getButtonTextColor = () => {
    if (!selectedAccount) return '#94A3B8';
    const tier = ACCOUNT_TIERS[selectedAccount];
    return tier.tierLevel === 'gold' || tier.tierLevel === 'silver' ? '#FFFFFF' : '#0B1120';
  };

  return (
    <div 
      className="min-h-screen bg-white flex items-center justify-center px-6 pt-28 pb-12"
      style={{ fontFamily: 'Inter, -apple-system, system-ui, "SF Pro Text", sans-serif' }}
    >
      <div className="max-w-[640px] w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-[28px] md:text-[36px] font-[500] leading-[1.2] text-[#0B1120] mb-4">
            What account would you like to open?
          </h1>
          <p className="text-[18px] leading-[1.6] text-[#64748B]">
            Select a wealth investment tier that matches your goals. You can upgrade anytime.
          </p>
        </div>

        {/* Account Options - Ordered from lowest to highest tier */}
        <div className="space-y-4 mb-8">
          {renderAccountCard('wealth_1m')}
          {renderAccountCard('wealth_5m')}
          {renderAccountCard('ultra_25m')}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedAccount || isLoading}
          className={`w-full h-[56px] rounded-[16px] text-[17px] font-[500] tracking-[0.01em] transition-all duration-200 ${
            selectedAccount && !isLoading
              ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
              : 'cursor-not-allowed'
          }`}
          style={{
            background: getButtonGradient(),
            color: getButtonTextColor(),
          }}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>

        {/* Footer note */}
        <p className="text-center text-[14px] text-[#94A3B8] mt-6">
          All accounts benefit from Hushh's AI-powered investment strategies
        </p>
      </div>
    </div>
  );
}
