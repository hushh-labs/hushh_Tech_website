import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import type { AccountStructure } from '../../types/onboarding';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function OnboardingStep7() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<AccountStructure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isFooterVisible = useFooterVisibility();

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
        .select('account_structure')
        .eq('user_id', user.id)
        .single();

      if (onboardingData?.account_structure) {
        setSelectedStructure(onboardingData.account_structure as AccountStructure);
      }
    };

    getCurrentUser();
  }, [navigate]);

  const handleContinue = async () => {
    if (!selectedStructure || !userId || !config.supabaseClient) return;

    setIsLoading(true);
    try {
      await config.supabaseClient
        .from('onboarding_data')
        .update({
          account_structure: selectedStructure,
          current_step: 7,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      navigate('/onboarding/step-8');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/step-6');
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
          <div className="mb-8">
            <h1 className="text-slate-900 text-[28px] font-bold leading-tight tracking-tight">
              What type of general account would you like to open?
            </h1>
          </div>

          {/* Account Options Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Individual Account Option */}
            <button
              onClick={() => setSelectedStructure('individual')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors border-b border-gray-100"
            >
              <span className="text-slate-900 text-base font-medium">Individual account</span>
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedStructure === 'individual'
                    ? 'border-[#2b8cee] bg-[#2b8cee]'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {selectedStructure === 'individual' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                )}
              </div>
            </button>

            {/* Other Account Type Option */}
            <button
              onClick={() => setSelectedStructure('other')}
              className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-900 text-base font-medium">Other account type</span>
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedStructure === 'other'
                    ? 'border-[#2b8cee] bg-[#2b8cee]'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {selectedStructure === 'other' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                )}
              </div>
            </button>
          </div>
        </main>

        {/* Fixed Footer - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" data-onboarding-footer>
            {/* Buttons */}
            <div className="flex flex-col gap-4">
              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!selectedStructure || isLoading}
                className={`flex w-full h-12 cursor-pointer items-center justify-center rounded-full text-base font-bold transition-all active:scale-[0.98] ${
                  selectedStructure && !isLoading
                    ? 'bg-[#2b8cee] text-white hover:bg-[#2070c0] shadow-md shadow-[#2b8cee]/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Saving...' : 'Continue'}
              </button>

              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex w-full cursor-pointer items-center justify-center rounded-full bg-transparent py-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors"
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
