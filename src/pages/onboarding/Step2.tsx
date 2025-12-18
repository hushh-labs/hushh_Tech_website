import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import config from '../../resources/config/config';

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function OnboardingStep2() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

        {/* Fixed Footer */}
        <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
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
      </div>
    </div>
  );
}
