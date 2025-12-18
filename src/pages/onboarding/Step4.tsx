import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import type { ReferralSource } from '../../types/onboarding';

// Back arrow icon
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

// Referral options matching the HTML template
interface ReferralOption {
  value: ReferralSource;
  label: string;
  description?: string;
}

const referralOptions: ReferralOption[] = [
  { value: 'social_media_ad', label: 'Social Media', description: 'Instagram, TikTok, Twitter' },
  { value: 'family_friend', label: 'Friend or Family' },
  { value: 'podcast', label: 'Podcast' },
  { value: 'website_blog_article', label: 'News Article' },
  { value: 'ai_tool', label: 'Google Search' },
  { value: 'other', label: 'Other' },
];

export default function OnboardingStep4() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<ReferralSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

      // Load existing data if any
      const { data: onboardingData } = await config.supabaseClient
        .from('onboarding_data')
        .select('referral_source')
        .eq('user_id', user.id)
        .single();

      if (onboardingData?.referral_source) {
        setSelectedSource(onboardingData.referral_source as ReferralSource);
      }
    };

    getCurrentUser();
  }, [navigate]);

  const handleContinue = async () => {
    if (!userId || !config.supabaseClient || !selectedSource) return;

    setIsLoading(true);
    try {
      await config.supabaseClient
        .from('onboarding_data')
        .update({
          referral_source: selectedSource,
          current_step: 4,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      navigate('/onboarding/step-5');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (userId && config.supabaseClient) {
      try {
        await config.supabaseClient
          .from('onboarding_data')
          .update({
            current_step: 4,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    navigate('/onboarding/step-5');
  };

  const handleBack = () => {
    navigate('/onboarding/step-3');
  };

  return (
    <div 
      className="bg-slate-50 min-h-screen"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="relative flex min-h-screen w-full flex-col bg-white max-w-[500px] mx-auto shadow-xl overflow-hidden border-x border-slate-100">
        
        {/* Sticky Header */}
        <header className="flex items-center px-4 pt-6 pb-4 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-900 hover:text-[#2b8cee] transition-colors"
          >
            <BackIcon />
            <span className="text-base font-bold tracking-tight">Back</span>
          </button>
          <div className="flex-1" />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col px-6 pb-48">
          {/* Headline */}
          <div className="flex flex-col items-center text-center mt-2 mb-8">
            <h1 className="text-slate-900 tracking-tight text-[28px] font-extrabold leading-[1.2] max-w-[320px]">
              How did you hear about Hushh Fund A?
            </h1>
          </div>

          {/* Radio Options Cards */}
          <div className="flex flex-col gap-4 w-full">
            {referralOptions.map((option) => {
              const isSelected = selectedSource === option.value;
              
              return (
                <label
                  key={option.value}
                  className={`
                    group relative flex items-center justify-between gap-4 rounded-xl border-2 bg-white p-4 cursor-pointer transition-all duration-200
                    ${isSelected 
                      ? 'border-[#2b8cee] shadow-[0_2px_8px_rgba(43,140,238,0.15)]' 
                      : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <div className="flex grow flex-col">
                    <p className={`text-slate-900 text-base leading-normal ${isSelected ? 'font-bold' : 'font-medium'}`}>
                      {option.label}
                    </p>
                    {option.description && (
                      <p className="text-slate-500 text-sm font-medium">
                        {option.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Custom Radio Button */}
                  <input
                    type="radio"
                    name="referral-source"
                    value={option.value}
                    checked={isSelected}
                    onChange={() => setSelectedSource(option.value)}
                    className="sr-only"
                  />
                  <div 
                    className={`
                      w-6 h-6 rounded-full border-2 relative transition-all duration-200 shrink-0
                      ${isSelected 
                        ? 'border-[#2b8cee]' 
                        : 'border-slate-200'
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#2b8cee] rounded-full" />
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </main>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex flex-col gap-3">
          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedSource || isLoading}
            className={`
              flex w-full cursor-pointer items-center justify-center rounded-full h-[52px] px-5 text-base font-bold tracking-wide transition-all
              ${selectedSource && !isLoading
                ? 'bg-[#2b8cee] hover:bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? 'Saving...' : 'Continue'}
          </button>
          
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="flex w-full cursor-pointer items-center justify-center rounded-full h-[52px] px-5 bg-transparent border-2 border-slate-200 hover:bg-slate-50 transition-colors text-slate-600 text-base font-bold tracking-wide"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
