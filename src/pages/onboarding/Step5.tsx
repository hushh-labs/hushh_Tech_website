import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function OnboardingStep5() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
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
    };

    getCurrentUser();
  }, [navigate]);

  const handleContinue = async () => {
    if (!userId || !config.supabaseClient) return;

    setIsLoading(true);
    try {
      // Update current step in database
      await config.supabaseClient
        .from('onboarding_data')
        .update({
          current_step: 5,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Navigate to step 6
      navigate('/onboarding/step-6');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/step-4');
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
          {/* Lottie Animation */}
          <div className="flex justify-center mb-6">
            <div style={{ width: '200px', height: '200px' }}>
              <DotLottieReact
                src="https://lottie.host/58d10cd9-7087-4394-bb55-3ad6f07d3db6/9epWGP0u3F.lottie"
                loop
                autoplay
              />
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            {/* Heading */}
            <h1 className="text-slate-900 text-2xl font-bold leading-tight tracking-tight mb-4 text-center">
              Let's continue with some information about you
            </h1>

            {/* Description */}
            <p className="text-slate-500 text-base font-medium leading-relaxed text-center">
              To comply with federal regulations, and as is typical with any investment platform, we are required to collect certain personal information about you.
            </p>
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
                disabled={isLoading}
                className="flex w-full h-12 cursor-pointer items-center justify-center rounded-full bg-[#2b8cee] text-white text-base font-bold transition-all hover:bg-[#2070c0] active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Continue'}
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
                Secure. Private. AI-Powered.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
