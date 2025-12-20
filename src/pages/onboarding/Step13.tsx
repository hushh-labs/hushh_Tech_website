import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

// Back arrow icon
const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

// Edit icon
const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// Info icon
const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// Arrow forward icon
const ArrowForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </svg>
);

// Wallet icon
const WalletIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 text-[#2b8cee]">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </svg>
);

// Close icon for modal
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Remove icon (minus) for modal
const RemoveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Add icon (plus) for modal
const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Share class configurations
interface ShareClassInfo {
  id: string;
  name: string;
  unitPrice: number;
  tier: 'platinum' | 'gold' | 'standard';
  borderGradient: string;
  badge?: string;
}

const SHARE_CLASSES: ShareClassInfo[] = [
  {
    id: 'class_a',
    name: 'Class A',
    unitPrice: 25000000,
    tier: 'platinum',
    borderGradient: 'bg-gradient-to-b from-gray-300 via-gray-100 to-gray-300',
    badge: 'ULTRA',
  },
  {
    id: 'class_b',
    name: 'Class B',
    unitPrice: 5000000,
    tier: 'gold',
    borderGradient: 'bg-gradient-to-b from-yellow-400 via-yellow-200 to-yellow-500',
    badge: 'PREMIUM',
  },
  {
    id: 'class_c',
    name: 'Class C',
    unitPrice: 1000000,
    tier: 'standard',
    borderGradient: 'bg-[#2b8cee]',
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

const formatFullCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

function OnboardingStep13() {
  const navigate = useNavigate();
  const isFooterVisible = useFooterVisibility();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUnits, setShareUnits] = useState<{
    class_a_units: number;
    class_b_units: number;
    class_c_units: number;
  }>({
    class_a_units: 0,
    class_b_units: 0,
    class_c_units: 0,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localShareUnits, setLocalShareUnits] = useState({
    class_a_units: 0,
    class_b_units: 0,
    class_c_units: 0,
  });
  const [savingModal, setSavingModal] = useState(false);

  // Calculate total investment from share units
  const calculateTotal = (units = shareUnits) => {
    return (
      (units.class_a_units * 25000000) +
      (units.class_b_units * 5000000) +
      (units.class_c_units * 1000000)
    );
  };

  const totalInvestment = calculateTotal();
  const modalTotalInvestment = calculateTotal(localShareUnits);

  // Check if modal has changes
  const hasModalChanges = 
    localShareUnits.class_a_units !== shareUnits.class_a_units ||
    localShareUnits.class_b_units !== shareUnits.class_b_units ||
    localShareUnits.class_c_units !== shareUnits.class_c_units;

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
        .select('class_a_units, class_b_units, class_c_units, initial_investment_amount')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setShareUnits({
          class_a_units: data.class_a_units || 0,
          class_b_units: data.class_b_units || 0,
          class_c_units: data.class_c_units || 0,
        });
      }
    };

    loadData();
  }, []);

  // Open modal and initialize local state
  const handleOpenModal = () => {
    setLocalShareUnits({ ...shareUnits });
    setIsModalOpen(true);
  };

  // Close modal without saving
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Increment units in modal
  const handleIncrement = (classId: string) => {
    setLocalShareUnits(prev => ({
      ...prev,
      [`${classId}_units`]: (prev[`${classId}_units` as keyof typeof prev] || 0) + 1,
    }));
  };

  // Decrement units in modal
  const handleDecrement = (classId: string) => {
    setLocalShareUnits(prev => ({
      ...prev,
      [`${classId}_units`]: Math.max(0, (prev[`${classId}_units` as keyof typeof prev] || 0) - 1),
    }));
  };

  // Save modal changes to Supabase
  const handleSaveChanges = async () => {
    if (!hasModalChanges) return;
    
    setSavingModal(true);
    
    if (!config.supabaseClient) {
      setSavingModal(false);
      return;
    }

    const { data: { user } } = await config.supabaseClient.auth.getUser();
    if (!user) {
      setSavingModal(false);
      return;
    }

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        class_a_units: localShareUnits.class_a_units,
        class_b_units: localShareUnits.class_b_units,
        class_c_units: localShareUnits.class_c_units,
        initial_investment_amount: modalTotalInvestment,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (!upsertError) {
      setShareUnits({ ...localShareUnits });
      setIsModalOpen(false);
    }
    
    setSavingModal(false);
  };

  // Get units for modal display
  const getModalUnits = (classId: string): number => {
    if (classId === 'class_a') return localShareUnits.class_a_units;
    if (classId === 'class_b') return localShareUnits.class_b_units;
    if (classId === 'class_c') return localShareUnits.class_c_units;
    return 0;
  };

  const handleContinue = async () => {
    if (totalInvestment < 1000000) {
      setError('Minimum investment is $1 million');
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

    const { error: upsertError } = await config.supabaseClient
      .from('onboarding_data')
      .upsert({
        user_id: user.id,
        initial_investment_amount: totalInvestment,
        current_step: 13,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Failed to save data');
      setLoading(false);
      return;
    }

    navigate('/onboarding/step-14');
  };

  // Get units for a class
  const getUnits = (classId: string): number => {
    if (classId === 'class_a') return shareUnits.class_a_units;
    if (classId === 'class_b') return shareUnits.class_b_units;
    if (classId === 'class_c') return shareUnits.class_c_units;
    return 0;
  };

  const hasAnyUnits = shareUnits.class_a_units > 0 || shareUnits.class_b_units > 0 || shareUnits.class_c_units > 0;
  const isFormValid = hasAnyUnits && totalInvestment >= 1000000;

  const handleBack = () => {
    navigate('/onboarding/step-12');
  };

  // Generate units summary text
  const getUnitsSummary = () => {
    const parts = [];
    if (shareUnits.class_a_units > 0) parts.push(`${shareUnits.class_a_units} Class A`);
    if (shareUnits.class_b_units > 0) parts.push(`${shareUnits.class_b_units} Class B`);
    if (shareUnits.class_c_units > 0) parts.push(`${shareUnits.class_c_units} Class C`);
    return parts.join(' + ') + ' units';
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
        <main className="flex-1 overflow-y-auto pb-64">
          {/* Header Section - 22px title, 14px subtitle, center aligned */}
          <div className="px-5 pt-2 pb-6 flex flex-col items-center text-center">
            <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight mb-2">
              Your Investment Summary
            </h1>
            <p className="text-slate-500 text-sm font-bold">
              Review your share class allocation below
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-5 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Section Title */}
          <div className="px-5 mb-3">
            <h2 className="text-lg font-bold text-slate-900">Share Class Units</h2>
          </div>

          {/* Share Class Cards */}
          <div className="flex flex-col gap-4 px-5">
            {SHARE_CLASSES.map((shareClass) => {
              const units = getUnits(shareClass.id);
              const subtotal = units * shareClass.unitPrice;
              const hasUnits = units > 0;

              return (
                <div
                  key={shareClass.id}
                  className={`flex flex-col rounded-xl border p-4 shadow-sm relative overflow-hidden ${
                    hasUnits 
                      ? 'bg-white border-slate-200' 
                      : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  {/* Colored left border - always show for active, or gray for inactive */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    hasUnits ? shareClass.borderGradient : 'bg-slate-200'
                  }`} />
                  
                  <div className="pl-3">
                    {/* Header row */}
                    <div className="flex justify-between items-center">
                      <h3 className={`text-lg font-bold ${hasUnits ? 'text-slate-900' : 'text-slate-400'}`}>
                        {shareClass.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${
                        hasUnits 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {hasUnits ? 'active' : 'disabled'}
                      </span>
                    </div>
                    
                    {/* Price and units row */}
                    <div className={`flex justify-between items-center text-sm mt-2 ${hasUnits ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span>{formatCurrency(shareClass.unitPrice)}/unit</span>
                      <span>units {units}</span>
                    </div>
                    
                    {/* Subtotal (only if has units) */}
                    {hasUnits && (
                      <div className="pt-2 border-t border-slate-100 mt-2">
                        <p className="text-slate-900 font-bold">
                          Subtotal: {formatCurrency(subtotal)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Edit link - now opens modal */}
            <div className="mt-2">
              <button
                onClick={handleOpenModal}
                className="inline-flex items-center gap-2 text-[#2b8cee] hover:text-blue-600 transition-colors font-bold text-sm"
              >
                <EditIcon />
                <span>Edit share class selection</span>
              </button>
            </div>
          </div>

          {/* Total Investment Card */}
          <div className="px-5 mt-8 mb-6">
            <div className="relative bg-[#2b8cee]/5 rounded-xl p-6 border-2 border-[#2b8cee]/20 flex flex-col items-center justify-center gap-2 text-center">
              {/* Wallet icon in corner */}
              <div className="absolute top-3 right-3">
                <WalletIcon />
              </div>
              
              <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Total Investment
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {hasAnyUnits ? formatFullCurrency(totalInvestment) : '$0'}
              </span>
              
              {/* Blue divider */}
              <div className="h-1 w-16 bg-[#2b8cee] rounded-full mt-2 mb-2" />
              
              {hasAnyUnits && (
                <span className="text-sm font-medium text-slate-500">
                  {getUnitsSummary()}
                </span>
              )}
            </div>
          </div>

          {/* Info Card */}
          <div className="px-5 mb-8">
            <div className="bg-slate-50 rounded-lg p-4 flex gap-3 items-start border border-slate-100">
              <span className="text-slate-500 shrink-0 mt-0.5">
                <InfoIcon />
              </span>
              <p className="text-sm text-slate-500 leading-normal">
                We are currently accepting investments of $1 million or greater for Hushh Fund A.
              </p>
            </div>
          </div>
        </main>

        {/* Fixed Footer - matching template exactly */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 left-0 right-0 w-full max-w-[500px] mx-auto bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50" data-onboarding-footer>
            <div className="p-5 pb-8 flex flex-col gap-4">
              {/* Total Investment Row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  TOTAL INVESTMENT
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatCurrency(totalInvestment)}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                {/* Continue Button - rounded-lg with arrow */}
                <button
                  onClick={handleContinue}
                  disabled={!isFormValid || loading}
                  className={`w-full bg-[#2b8cee] hover:bg-blue-600 text-white font-bold text-base py-4 rounded-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                    !isFormValid || loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Saving...' : 'Continue'}
                  {!loading && <ArrowForwardIcon />}
                </button>

                {/* Back Link */}
                <button
                  onClick={handleBack}
                  className="w-full text-center text-slate-500 hover:text-slate-900 text-sm font-semibold py-2 transition-colors"
                >
                  Back
                </button>
              </div>

              {/* Footer Note */}
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide">
                  Minimum investment per unit • Units can be adjusted later
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Edit Share Class Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50">
            <div 
              className="relative w-full max-w-[500px] bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-hidden flex flex-col"
              style={{ fontFamily: "'Manrope', sans-serif" }}
            >
              {/* Modal Header */}
              <header className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 bg-white sticky top-0 z-10">
                <button 
                  onClick={handleCloseModal}
                  aria-label="Close modal"
                  className="flex size-10 shrink-0 items-center justify-center text-slate-500 rounded-full hover:bg-slate-50 transition-colors"
                >
                  <CloseIcon />
                </button>
                <h2 className="text-lg font-bold text-slate-900">Edit Share Class Units</h2>
                <div className="w-10" /> {/* Spacer for centering */}
              </header>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4 pb-48">
                {/* Share Class Cards */}
                <div className="flex flex-col gap-4">
                  {SHARE_CLASSES.map((shareClass) => {
                    const units = getModalUnits(shareClass.id);

                    return (
                      <div
                        key={shareClass.id}
                        className="flex flex-col rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden bg-white"
                      >
                        {/* Colored left border */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${shareClass.borderGradient}`} />
                        
                        <div className="pl-3">
                          {/* Header row with name and badge */}
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900">
                              {shareClass.name}
                            </h3>
                            {shareClass.badge && (
                              <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                                shareClass.tier === 'platinum' 
                                  ? 'bg-gradient-to-r from-gray-200 to-gray-100 text-gray-600 border border-gray-200' 
                                  : 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border border-yellow-200'
                              }`}>
                                {shareClass.badge}
                              </span>
                            )}
                          </div>
                          
                          {/* Price per unit */}
                          <p className="text-sm text-slate-500 mt-1">
                            {formatCurrency(shareClass.unitPrice)}/unit
                          </p>
                          
                          {/* Unit controls */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                            <span className="text-sm font-medium text-slate-500">Allocation</span>
                            <div className="flex items-center gap-3">
                              {/* Decrement button */}
                              <button
                                onClick={() => handleDecrement(shareClass.id)}
                                disabled={units === 0}
                                className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all ${
                                  units === 0 
                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
                                    : 'border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 active:scale-95'
                                }`}
                                aria-label="Decrease units"
                              >
                                <RemoveIcon />
                              </button>
                              
                              {/* Unit count */}
                              <span className="text-xl font-bold text-slate-900 min-w-[40px] text-center">
                                {units}
                              </span>
                              
                              {/* Increment button */}
                              <button
                                onClick={() => handleIncrement(shareClass.id)}
                                className="flex items-center justify-center w-9 h-9 rounded-full border border-[#2b8cee] text-[#2b8cee] hover:bg-blue-50 active:scale-95 transition-all"
                                aria-label="Increase units"
                              >
                                <AddIcon />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Investment Card */}
                <div className="mt-6">
                  <div className="bg-[#2b8cee]/5 rounded-xl p-5 border-2 border-[#2b8cee]/20 flex flex-col items-center justify-center gap-1 text-center">
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Total Investment
                    </span>
                    <span className="text-2xl font-extrabold text-slate-900">
                      {formatFullCurrency(modalTotalInvestment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="fixed bottom-0 left-0 right-0 w-full max-w-[500px] mx-auto bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50">
                <div className="p-5 pb-8 flex flex-col gap-3">
                  {/* Save Changes Button */}
                  <button
                    onClick={handleSaveChanges}
                    disabled={!hasModalChanges || savingModal}
                    className={`w-full bg-[#2b8cee] hover:bg-blue-600 text-white font-bold text-base py-4 rounded-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all ${
                      !hasModalChanges || savingModal ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {savingModal ? 'Saving...' : 'Save Changes'}
                  </button>

                  {/* Cancel Button */}
                  <button
                    onClick={handleCloseModal}
                    className="w-full text-center text-slate-500 hover:text-slate-900 text-sm font-semibold py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default OnboardingStep13;
