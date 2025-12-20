import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';

// Back arrow icon (same as Step3)
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Shield icon (filled)
const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="#2b8cee" stroke="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);


function OnboardingStep12() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    
    // Update current step in database
    if (config.supabaseClient) {
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (user) {
        await config.supabaseClient
          .from('onboarding_data')
          .upsert({
            user_id: user.id,
            current_step: 12,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });
      }
    }

    navigate('/onboarding/step-13');
  };

  const handleBack = () => {
    navigate('/onboarding/step-11');
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

        {/* Main Content Area: Centered Card */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Carded Content Block */}
          <div className="w-full max-w-[360px] flex flex-col items-center border border-[#E5E5E5] rounded-2xl p-8 bg-white">
            {/* Shield Icon */}
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2b8cee]/10">
              <ShieldIcon />
            </div>

            {/* Headline - 24px (text-2xl), bold */}
            <h1 className="text-center text-2xl font-bold leading-tight tracking-[-0.015em] text-black mb-4">
              Finish up and invest
            </h1>

            {/* Description - 16px (text-base), normal weight, gray */}
            <p className="text-center text-base font-normal leading-relaxed text-[#617589] mb-8">
              Complete your profile to start building your wealth securely with Hushh.
            </p>

            {/* Primary CTA - rounded-lg (not full), semibold */}
            <button
              onClick={handleContinue}
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#2b8cee] text-white text-base font-semibold leading-normal hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
            >
              <span className="truncate">{loading ? 'Loading...' : 'Continue'}</span>
            </button>
          </div>
        </main>

        {/* Bottom Spacer for FAB */}
        <div className="h-6 w-full"></div>
      </div>
    </div>
  );
}

export default OnboardingStep12;
