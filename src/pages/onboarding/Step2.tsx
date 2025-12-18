import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import config from '../../resources/config/config';

// Back arrow icon
const BackIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default function OnboardingStep2() {
  const navigate = useNavigate();
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
    };

    getCurrentUser();
  }, [navigate]);

  const handleGetStarted = async () => {
    if (!userId || !config.supabaseClient) return;

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
    }
  };

  return (
    <div 
      className="min-h-screen bg-white flex flex-col items-center justify-between overflow-x-hidden antialiased"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Main Container for Mobile Form Factor */}
      <div className="relative w-full max-w-md h-full min-h-screen flex flex-col mx-auto bg-white">
        
        {/* Top Navigation / Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white z-10">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-gray-50 transition-colors text-black"
          >
            <BackIcon />
          </button>
          {/* Empty space for balance */}
          <div className="w-10" />
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center w-full px-6 pt-4 pb-8">
          
          {/* Hero Illustration */}
          <div className="flex-1 w-full flex items-center justify-center py-6 mb-4">
            <div className="w-full aspect-square max-w-[320px] rounded-full bg-blue-50/50 flex items-center justify-center relative overflow-hidden">
              {/* Lottie Animation - keeping existing */}
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

          {/* Content Card */}
          <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col items-center gap-6">
            <div className="flex flex-col gap-3 text-center">
              <h1 className="text-[28px] leading-[1.2] font-extrabold text-black tracking-tight">
                Let's find the best portfolio for you
              </h1>
              <p className="text-base font-medium text-gray-500 leading-normal px-2">
                Answer a few questions to help us understand your financial goals and risk tolerance.
              </p>
            </div>

            {/* CTA Button - Filled Primary Blue */}
            <button
              onClick={handleGetStarted}
              className="w-full h-14 bg-[#2B8CEE] hover:bg-[#2B8CEE]/90 active:scale-[0.98] transition-all rounded-full flex items-center justify-center text-white font-bold text-lg tracking-wide shadow-sm mt-2"
            >
              Get started
            </button>
          </div>
        </main>

        {/* Bottom Spacing for safe area */}
        <div className="h-4 w-full bg-white" />
      </div>
    </div>
  );
}
