import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// Back arrow icon
const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export default function OnboardingStep9() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFooterVisible = useFooterVisibility();

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!config.supabaseClient) return;

      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data } = await config.supabaseClient
        .from('onboarding_data')
        .select('legal_first_name, legal_last_name')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setFirstName(data.legal_first_name || '');
        setLastName(data.legal_last_name || '');
      }
    };

    loadData();
  }, [navigate]);

  const handleContinue = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first and last name');
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!config.supabaseClient) {
      setError('Configuration error');
      setIsLoading(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        legal_first_name: firstName.trim(),
        legal_last_name: lastName.trim(),
        current_step: 9,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save data');
      setIsLoading(false);
      return;
    }

    navigate('/onboarding/step-10');
  };

  const handleBack = () => {
    navigate('/onboarding/step-8');
  };

  const isValid = firstName.trim() && lastName.trim();

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
          {/* Header Section - Center Aligned */}
          <div className="mb-8 text-center">
            <h1 className="text-slate-900 text-[22px] font-bold leading-tight tracking-tight mb-3">
              Enter your full legal name
            </h1>
            <p className="text-slate-500 text-[14px] font-normal leading-relaxed">
              We are required to collect this info for verification.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="flex flex-col gap-6 w-full">
            {/* First Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 text-base font-medium leading-normal pl-1">
                Legal first name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Jane"
                className="w-full h-14 px-5 rounded-full border border-gray-200 bg-white text-slate-900 placeholder:text-slate-400 text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] transition-all"
              />
            </div>

            {/* Last Name Field */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-900 text-base font-medium leading-normal pl-1">
                Legal last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="w-full h-14 px-5 rounded-full border border-gray-200 bg-white text-slate-900 placeholder:text-slate-400 text-base font-normal focus:outline-none focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] transition-all"
              />
            </div>
          </div>
        </main>

        {/* Fixed Footer - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex flex-col gap-3" data-onboarding-footer>
            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!isValid || isLoading}
              className={`
                flex w-full cursor-pointer items-center justify-center rounded-full h-14 px-5 text-base font-bold tracking-wide transition-all active:scale-[0.98]
                ${isValid && !isLoading
                  ? 'bg-[#2b8cee] hover:bg-[#2070c0] text-white shadow-lg shadow-[#2b8cee]/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }
              `}
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
        )}
      </div>
    </div>
  );
}
