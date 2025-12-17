import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';

// Share class configurations
interface ShareClass {
  id: string;
  name: string;
  tier: 'gold' | 'silver' | 'standard';
  unitPrice: number;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    background: string;
  };
}

const SHARE_CLASSES: ShareClass[] = [
  {
    id: 'class_a',
    name: 'Class A',
    tier: 'gold',
    unitPrice: 25000000,
    description: 'Ultra High Net Worth tier with maximum allocation priority and exclusive benefits.',
    colors: {
      primary: '#B8860B',
      secondary: '#DAA520',
      accent: '#8B6914',
      border: '#D4AF37',
      background: '#FFFEF7',
    },
  },
  {
    id: 'class_b',
    name: 'Class B',
    tier: 'silver',
    unitPrice: 5000000,
    description: 'Premium tier with enhanced portfolio access and dedicated relationship management.',
    colors: {
      primary: '#71717A',
      secondary: '#A1A1AA',
      accent: '#3F3F46',
      border: '#D4D4D8',
      background: '#FAFAFA',
    },
  },
  {
    id: 'class_c',
    name: 'Class C',
    tier: 'standard',
    unitPrice: 1000000,
    description: 'Standard tier with full access to AI-powered multi-strategy alpha portfolio.',
    colors: {
      primary: '#00A9E0',
      secondary: '#6DD3EF',
      accent: '#0B1120',
      border: '#E2E8F0',
      background: '#FFFFFF',
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill="#DAA520" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Diamond icon for Silver tier
const DiamondIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" 
          fill="#A1A1AA" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 9H22" stroke="#71717A" strokeWidth="1.5"/>
    <path d="M12 21L9 9L12 3L15 9L12 21Z" stroke="#71717A" strokeWidth="1.5"/>
  </svg>
);

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

  // Render unit selector
  const renderShareClassCard = (shareClass: ShareClass) => {
    const unitCount = units[shareClass.id];
    const isGold = shareClass.tier === 'gold';
    const isSilver = shareClass.tier === 'silver';
    const hasUnits = unitCount > 0;

    return (
      <div
        key={shareClass.id}
        className="p-5 rounded-[16px] border-2 transition-all duration-200 relative overflow-hidden"
        style={{
          borderColor: hasUnits ? shareClass.colors.primary : shareClass.colors.border,
          backgroundColor: hasUnits ? `${shareClass.colors.background}` : shareClass.colors.background,
          boxShadow: hasUnits ? `0 0 0 1px ${shareClass.colors.primary}20` : 'none',
        }}
      >
        {/* Tier badge */}
        {isGold && (
          <div 
            className="absolute top-0 right-0 px-2.5 py-1 text-[11px] font-semibold rounded-bl-lg flex items-center gap-1"
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
            className="absolute top-0 right-0 px-2.5 py-1 text-[11px] font-semibold rounded-bl-lg flex items-center gap-1"
            style={{ 
              background: 'linear-gradient(135deg, #71717A 0%, #A1A1AA 50%, #D4D4D8 100%)',
              color: '#FFFFFF'
            }}
          >
            <DiamondIcon />
            <span>PREMIUM</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Class name and price per unit */}
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="text-[18px] font-[600]"
                style={{ 
                  color: shareClass.colors.accent,
                  background: isGold ? 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)' : 'none',
                  WebkitBackgroundClip: isGold ? 'text' : 'border-box',
                  WebkitTextFillColor: isGold ? 'transparent' : 'inherit',
                }}
              >
                {shareClass.name}
              </h3>
              <span 
                className="text-[14px] font-[500] px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${shareClass.colors.primary}15`,
                  color: shareClass.colors.primary,
                }}
              >
                {formatCurrency(shareClass.unitPrice)}/unit
              </span>
            </div>
            
            {/* Description */}
            <p 
              className="text-[14px] leading-[1.4] mb-3"
              style={{ color: isGold ? '#8B6914' : isSilver ? '#52525B' : '#64748B' }}
            >
              {shareClass.description}
            </p>

            {/* Subtotal if units selected */}
            {hasUnits && (
              <div 
                className="text-[14px] font-[500]"
                style={{ color: shareClass.colors.primary }}
              >
                Subtotal: {formatCurrency(unitCount * shareClass.unitPrice)}
              </div>
            )}
          </div>
          
          {/* Unit selector */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <span className="text-[12px] text-[#64748B] mb-2">Units</span>
            <div 
              className="flex items-center gap-2 p-1 rounded-full"
              style={{ backgroundColor: `${shareClass.colors.primary}10` }}
            >
              <button
                onClick={() => handleUnitChange(shareClass.id, -1)}
                disabled={unitCount === 0}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                style={{ 
                  backgroundColor: shareClass.colors.background,
                  color: shareClass.colors.primary,
                  border: `1px solid ${shareClass.colors.border}`,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <span 
                className="w-10 text-center text-[18px] font-[600]"
                style={{ color: shareClass.colors.accent }}
              >
                {unitCount}
              </span>
              <button
                onClick={() => handleUnitChange(shareClass.id, 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{ 
                  backgroundColor: shareClass.colors.primary,
                  color: '#FFFFFF',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
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
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-white flex items-center justify-center px-6 pt-28 pb-12"
      style={{ fontFamily: 'Inter, -apple-system, system-ui, "SF Pro Text", sans-serif' }}
    >
      <div className="max-w-[640px] w-full">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-[26px] md:text-[32px] font-[500] leading-[1.2] text-[#0B1120] mb-2">
            Hushh Fund A: AI-Powered Multi-Strategy Alpha
          </h1>
          {/* Tagline */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[14px] text-[#94A3B8] uppercase tracking-wider">Tagline:</span>
            <span 
              className="text-[16px] font-[500] bg-gradient-to-r from-[#B8860B] to-[#DAA520] bg-clip-text"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              The AI-Powered Berkshire Hathaway
            </span>
          </div>
          <p className="text-[16px] leading-[1.6] text-[#64748B]">
            Select the number of units for each share class. You can invest in multiple classes.
          </p>
        </div>

        {/* Fund Description Card */}
        <div className="p-4 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] mb-6">
          <p className="text-[14px] leading-[1.5] text-[#64748B]">
            Our inaugural fund demonstrating an AI-driven value investing strategy designed to deliver 
            consistent, market-beating returns and sustainable, risk-adjusted alpha.
          </p>
        </div>

        {/* Share Class Selection */}
        <div className="space-y-4 mb-6">
          {SHARE_CLASSES.map(renderShareClassCard)}
        </div>

        {/* Total Investment Display */}
        <div 
          className="p-5 rounded-[16px] mb-6 text-center"
          style={{ 
            background: hasSelection 
              ? 'linear-gradient(135deg, #0B1120 0%, #1E293B 100%)' 
              : '#F1F5F9',
            color: hasSelection ? '#FFFFFF' : '#64748B',
          }}
        >
          <div className="text-[14px] uppercase tracking-wider mb-1" style={{ opacity: 0.7 }}>
            Total Investment
          </div>
          <div className="text-[32px] font-[600]">
            {hasSelection ? formatCurrency(totalInvestment) : '$0'}
          </div>
          {hasSelection && (
            <div className="text-[14px] mt-1" style={{ opacity: 0.7 }}>
              {Object.entries(units)
                .filter(([_, count]) => count > 0)
                .map(([classId, count]) => {
                  const shareClass = SHARE_CLASSES.find(sc => sc.id === classId);
                  return shareClass ? `${count} ${shareClass.name}` : '';
                })
                .join(' + ')} unit{Object.values(units).reduce((a, b) => a + b, 0) > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!hasSelection || isLoading}
            className={`w-full h-[56px] rounded-[16px] text-[17px] font-[500] tracking-[0.01em] transition-all duration-200 ${
              hasSelection && !isLoading
                ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.99]'
                : 'cursor-not-allowed'
            }`}
            style={{
              background: hasSelection 
                ? 'linear-gradient(to right, #00A9E0, #6DD3EF)' 
                : '#E2E8F0',
              color: hasSelection ? '#0B1120' : '#94A3B8',
            }}
          >
            {isLoading ? 'Saving...' : 'Next'}
          </button>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="w-full text-[17px] font-[500] text-[#64748B] hover:text-[#0B1120] transition-colors py-3"
          >
            Back
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[13px] text-[#94A3B8] mt-6">
          Minimum investment per unit • Units can be adjusted later
        </p>
      </div>
    </div>
  );
}
