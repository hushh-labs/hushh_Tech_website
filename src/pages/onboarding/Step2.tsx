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

// Help icon
const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function OnboardingStep2() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    };

    getCurrentUser();
  }, [navigate]);

  const handleGetStarted = async () => {
    if (!userId || !config.supabaseClient) return;

    setIsLoading(true);
    try {
      // Update current step in database
      await config.supabaseClient
        .from('onboarding_data')
        .update({
          current_step: 2,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      // Navigate to step 3
      navigate('/onboarding/step-3');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/step-1');
  };

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
              onClick={handleBack}
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
        <main className="flex-1 flex flex-col items-center px-6 pb-52">
          {/* Hero Illustration */}
          <div className="w-full flex items-center justify-center py-6 mb-4">
            <div className="w-full aspect-square max-w-[280px] rounded-full bg-blue-50/50 flex items-center justify-center relative overflow-hidden">
              {/* Lottie Animation */}
              <div className="w-full h-full flex items-center justify-center transform scale-90">
                <DotLottieReact
                  src="https://lottie.host/cafd861e-6fc0-4a50-8e48-b9d665ddfe8d/VEyMEPbIo3.lottie"
                  loop
                  autoplay
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="w-full flex flex-col items-center gap-6 text-center">
            <div className="flex flex-col gap-3">
              <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight">
                Let's find the best portfolio for you
              </h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                Answer a few questions to help us understand your financial goals and risk tolerance.
              </p>
            </div>
          </div>
        </main>

        {/* Fixed Footer - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" data-onboarding-footer>
            {/* Get Started Button */}
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="flex w-full cursor-pointer items-center justify-center rounded-full bg-[#2b8cee] py-4 text-white text-base font-bold transition-all hover:bg-blue-600 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400"
            >
              {isLoading ? 'Loading...' : 'Get started'}
            </button>

            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex w-full cursor-pointer items-center justify-center rounded-full bg-transparent py-2 mt-4 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors"
            >
              Back
            </button>

            {/* Footer Note */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-400 leading-tight">
                This takes about 2-3 minutes to complete
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
