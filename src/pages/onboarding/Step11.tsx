import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// Back arrow icon (same as Step3)
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

// Lock icon
const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Calendar icon
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// Info icon
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// Chevron down icon
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

function OnboardingStep11() {
  const navigate = useNavigate();
  const isFooterVisible = useFooterVisibility();
  const [ssn, setSsn] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const formatIsoToDisplay = (iso?: string | null) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      return `${mm}/${dd}/${yyyy}`;
    }
    return iso;
  };

  const parseDobToIso = (value: string) => {
    if (!value) return null;

    const parts = value.split('/');
    if (parts.length === 3) {
      let [p1, p2, year] = parts.map((p) => p.trim());
      let month = p1;
      let day = p2;

      if (parseInt(p1, 10) > 12) {
        day = p1;
        month = p2;
      }

      const iso = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      if (!Number.isNaN(Date.parse(iso))) {
        return iso;
      }
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))) {
      return value;
    }

    return null;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!config.supabaseClient) return;

      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) return;

      const { data } = await config.supabaseClient
        .from('onboarding_data')
        .select('ssn_encrypted, date_of_birth')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setDob(formatIsoToDisplay(data.date_of_birth) || '');
      }
    };

    loadData();
  }, []);

  const formatSSN = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setSsn(formatted);
  };

  const formatDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setDob(formatted);
  };

  const isFormValid = ssn.length === 11 && dob.length === 10;
  const canSkip = dob.length === 10;

  const handleContinue = async () => {
    if (!isFormValid) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    if (!config.supabaseClient) {
      setError('Configuration error');
      setLoading(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const isoDob = parseDobToIso(dob);
    if (!isoDob) {
      setError('Please enter a valid date in MM/DD/YYYY or DD/MM/YYYY format');
      setLoading(false);
      return;
    }

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        ssn_encrypted: ssn,
        date_of_birth: isoDob,
        current_step: 11,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/step-12');
  };

  const handleSkip = async () => {
    if (!canSkip) {
      setError('Please enter your date of birth before skipping');
      return;
    }

    setLoading(true);
    setError(null);

    if (!config.supabaseClient) {
      setError('Configuration error');
      setLoading(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const isoDob = parseDobToIso(dob);
    if (!isoDob) {
      setError('Please enter a valid date in MM/DD/YYYY or DD/MM/YYYY format');
      setLoading(false);
      return;
    }

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        ssn_encrypted: '999-99-9999',
        date_of_birth: isoDob,
        current_step: 11,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/step-12');
  };

  const handleBack = () => {
    navigate('/onboarding/step-10');
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
        <main className="flex-1 flex flex-col px-6 pb-44">
          {/* Header Section - 22px title, 14px subtitle, center aligned */}
          <div className="mb-8 mt-2 flex flex-col items-center text-center">
            <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight mb-2">
              We just need a few more details
            </h1>
            <p className="text-slate-500 text-sm font-bold">
              Federal law requires us to collect this info for tax reporting.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* SSN Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <label className="flex flex-col w-full">
              <p className="text-slate-900 text-sm font-semibold leading-normal pb-2">Social Security number</p>
              <div className="relative">
                <input
                  type="text"
                  value={ssn}
                  onChange={handleSSNChange}
                  placeholder="000-00-0000"
                  maxLength={11}
                  inputMode="numeric"
                  className="flex w-full rounded-lg text-slate-900 border border-slate-200 bg-white h-12 px-4 pr-10 text-base font-medium placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <LockIcon />
                </span>
              </div>
            </label>
            
            {/* Accordion for SSN info */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <details 
                className="group"
                open={showInfo}
                onToggle={(e) => setShowInfo((e.target as HTMLDetailsElement).open)}
              >
                <summary className="flex cursor-pointer items-center gap-2 py-1 text-[#2b8cee] hover:text-[#2b8cee]/80 transition-colors list-none select-none">
                  <InfoIcon />
                  <span className="text-sm font-bold">Why do we need your SSN?</span>
                  <ChevronDownIcon className="ml-auto transition-transform group-open:rotate-180" />
                </summary>
                <div className="pt-3 pb-1">
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    We are required by federal law to collect this information to prevent fraud and verify your identity before opening an investment account.
                  </p>
                </div>
              </details>
            </div>
          </div>

          {/* DOB Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <label className="flex flex-col w-full">
              <p className="text-slate-900 text-sm font-semibold leading-normal pb-2">Date of birth</p>
              <div className="relative">
                <input
                  type="text"
                  value={dob}
                  onChange={handleDobChange}
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                  inputMode="numeric"
                  className="flex w-full rounded-lg text-slate-900 border border-slate-200 bg-white h-12 px-4 pr-10 text-base font-medium placeholder:text-slate-400 focus:outline-0 focus:ring-2 focus:ring-[#2b8cee]/20 focus:border-[#2b8cee] transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <CalendarIcon />
                </span>
              </div>
            </label>
          </div>
        </main>

        {/* Fixed Footer - Hidden when main footer is visible (matching Step3 exactly) */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" data-onboarding-footer>
            {/* Buttons */}
            <div className="flex flex-col gap-4">
              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!isFormValid || loading}
                className={`flex w-full cursor-pointer items-center justify-center rounded-full bg-[#2b8cee] py-4 text-white text-base font-bold transition-all hover:bg-blue-600 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 ${
                  !isFormValid || loading ? 'disabled:cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>

              {/* Skip Button */}
              <button
                onClick={handleSkip}
                disabled={!canSkip || loading}
                className={`flex w-full cursor-pointer items-center justify-center rounded-full bg-transparent py-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors ${
                  !canSkip || loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Skip for now
              </button>
            </div>

            {/* Footer Note */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-400 leading-tight">
                Your information is encrypted and secure
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingStep11;
