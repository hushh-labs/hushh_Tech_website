import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../resources/config/config';
import { useFooterVisibility } from '../../utils/useFooterVisibility';

type PaymentState = 'loading' | 'not_paid' | 'verifying' | 'paid' | 'booked';

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

// Shield check icon
const ShieldCheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
);

// Star icon
const StarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

// Coin icon
const CoinIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
  </svg>
);

// Calendar icon
const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
  </svg>
);

// Lock icon
const LockIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

// Checkmark icon
const CheckIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Shimmer loading component
const ShimmerLoader = ({ message }: { message: string }) => (
  <div 
    className="bg-slate-50 min-h-screen"
    style={{ fontFamily: "'Manrope', sans-serif" }}
  >
    <div className="relative flex min-h-screen w-full flex-col bg-white max-w-[500px] mx-auto shadow-xl overflow-hidden border-x border-slate-100">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Shimmer avatar */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse" />
          </div>
          
          {/* Shimmer title */}
          <div className="space-y-3 mb-8">
            <div className="h-8 w-3/4 mx-auto bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-1/2 mx-auto bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded animate-pulse" />
          </div>

          {/* Spinning loader */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-t-[#2b8cee] animate-spin"
                style={{ animationDuration: '1s' }}
              />
            </div>
            <p className="text-lg text-slate-600 font-medium">{message}</p>
          </div>

          {/* Shimmer content blocks */}
          <div className="mt-8 space-y-4">
            <div className="h-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-xl animate-pulse" />
            <div className="h-14 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

function MeetCeoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentState, setPaymentState] = useState<PaymentState>('loading');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hushhCoins, setHushhCoins] = useState(0);
  const isFooterVisible = useFooterVisibility();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Check payment status on mount
  useEffect(() => {
    checkPaymentStatus();
  }, []);

  // Handle Stripe callback
  useEffect(() => {
    const payment = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success' && sessionId) {
      verifyPayment(sessionId);
    } else if (payment === 'cancel') {
      setError('Payment was cancelled. Please try again.');
      setPaymentState('not_paid');
    }
  }, [searchParams]);

  const checkPaymentStatus = async () => {
    if (!config.supabaseClient) {
      setPaymentState('not_paid');
      return;
    }

    try {
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if user has already paid
      const { data: payment } = await config.supabaseClient
        .from('ceo_meeting_payments')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (payment?.payment_status === 'completed') {
        setHushhCoins(payment.hushh_coins_awarded || 100);
        if (payment.calendly_booked) {
          setPaymentState('booked');
        } else {
          setPaymentState('paid');
        }
      } else {
        setPaymentState('not_paid');
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setPaymentState('not_paid');
    }
  };

  const verifyPayment = async (sessionId: string) => {
    setPaymentState('verifying');
    setError(null);

    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${config.SUPABASE_URL}/functions/v1/onboarding-verify-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ sessionId }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setHushhCoins(result.hushhCoinsAwarded || 100);
        setPaymentState('paid');
        // Clear URL params
        window.history.replaceState({}, '', '/onboarding/meet-ceo');
      } else {
        throw new Error(result.error || 'Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment verification error:', err);
      setError(err.message || 'Failed to verify payment');
      setPaymentState('not_paid');
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await config.supabaseClient!.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${config.SUPABASE_URL}/functions/v1/onboarding-create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();

      if (result.alreadyPaid) {
        setPaymentState('paid');
        return;
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error(result.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to start payment');
      setLoading(false);
    }
  };

  const handleCalendlyBooked = async () => {
    // Mark as booked in database
    if (config.supabaseClient) {
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      if (user) {
        await config.supabaseClient
          .from('ceo_meeting_payments')
          .update({ calendly_booked: true, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
    }
    setPaymentState('booked');
  };

  const handleContinueToProfile = () => {
    navigate('/hushh-user-profile');
  };

  const handleBack = () => {
    navigate('/onboarding/step-14');
  };

  // Loading/Verifying state with shimmer
  if (paymentState === 'loading' || paymentState === 'verifying') {
    return (
      <ShimmerLoader 
        message={paymentState === 'verifying' ? 'Verifying your payment...' : 'Loading...'} 
      />
    );
  }

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
        <main className="flex-1 flex flex-col px-6 pb-52">
          {error && (
            <div 
              className="mb-6 p-4 rounded-xl text-center border border-red-200 bg-red-50"
            >
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Not Paid State */}
          {paymentState === 'not_paid' && (
            <>
              {/* Header Section */}
              <div className="mb-6 mt-2 flex flex-col items-center text-center">
                {/* Shield Icon */}
                <div className="w-16 h-16 rounded-full bg-[#2b8cee]/10 flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="text-[#2b8cee]" />
                </div>
                <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight mb-2">
                  Complete Registration
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  One-time $1 human verification
                </p>
              </div>

              {/* Human Verification Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-slate-900 text-base font-bold mb-1">
                      Human Verification
                    </h2>
                    <p className="text-slate-500 text-xs font-medium mb-3">
                      A small step to confirm you're a real person
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      To complete your Hushh Fund A registration, we require a simple $1 verification. This helps us filter out bots, scammers, and automated requests.
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-2 mb-3">
                  <StarIcon className="text-[#2b8cee]" />
                  <h3 className="text-slate-900 text-base font-bold">
                    You'll Also Receive
                  </h3>
                </div>
                <p className="text-slate-400 text-xs font-medium mb-4">
                  As a thank you for completing verification
                </p>
                
                <div className="space-y-4">
                  {/* Benefit 1: Hushh Coins */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2b8cee]/10 flex items-center justify-center flex-shrink-0">
                      <CoinIcon className="text-[#2b8cee]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 text-sm font-bold">
                        Earn 100 Hushh Coins
                      </p>
                      <p className="text-slate-500 text-xs font-medium">
                        Credited instantly to your account
                      </p>
                    </div>
                  </div>

                  {/* Benefit 2: CEO Access */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2b8cee]/10 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="text-[#2b8cee]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-900 text-sm font-bold">
                        Direct CEO Access
                      </p>
                      <p className="text-slate-500 text-xs font-medium">
                        Book a 1-hour deep dive with Manish
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Paid State - Show Calendly */}
          {paymentState === 'paid' && (
            <>
              {/* Success Message */}
              <div className="mb-6 mt-2 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckIcon className="text-green-600" />
                </div>
                <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight mb-2">
                  Registration Complete!
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                  You've earned <span className="font-bold text-slate-900">{hushhCoins} Hushh Coins</span>
                </p>
              </div>

              {/* Calendly Instructions */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <h2 className="text-slate-900 text-base font-bold mb-2">
                  Book Your 1-Hour Deep Dive
                </h2>
                <p className="text-slate-500 text-sm">
                  Schedule office hours with Manish Sainani
                </p>
              </div>

              {/* Calendly Embed */}
              <div 
                className="rounded-xl overflow-hidden mb-6 border border-slate-200" 
                style={{ height: '500px' }}
              >
                <iframe
                  src="https://calendly.com/hushh/ceo-office-hours"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  title="Schedule office hours with Manish Sainani"
                ></iframe>
              </div>
            </>
          )}

          {/* Booked State */}
          {paymentState === 'booked' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckIcon className="text-green-600" />
              </div>
              <h1 className="text-slate-900 text-[22px] font-extrabold leading-tight tracking-tight mb-2">
                All Set!
              </h1>
              <p className="text-slate-500 text-sm font-medium mb-2">
                Your meeting is scheduled with Manish Sainani.
              </p>
              <p className="text-slate-500 text-sm">
                You've earned <span className="font-bold text-slate-900">{hushhCoins} Hushh Coins</span>!
              </p>
            </div>
          )}
        </main>

        {/* Fixed Footer - Hidden when main footer is visible */}
        {!isFooterVisible && (
          <div className="fixed bottom-0 z-20 w-full max-w-[500px] bg-white border-t border-slate-100 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]" data-onboarding-footer>
            {/* Not Paid Footer */}
            {paymentState === 'not_paid' && (
              <>
                {/* Buttons */}
                <div className="flex flex-col gap-3">
                  {/* Payment Button */}
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center rounded-full bg-[#2b8cee] py-4 text-white text-base font-bold transition-all hover:bg-blue-600 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Redirecting...
                      </span>
                    ) : (
                      'Complete Registration — $1'
                    )}
                  </button>

                  {/* Back Button */}
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="flex w-full cursor-pointer items-center justify-center rounded-full bg-transparent py-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors"
                  >
                    Back
                  </button>
                </div>

                {/* Security Notice */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <LockIcon className="text-slate-400" />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </>
            )}

            {/* Paid Footer */}
            {paymentState === 'paid' && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleCalendlyBooked}
                  className="flex w-full cursor-pointer items-center justify-center rounded-full bg-[#2b8cee] py-4 text-white text-base font-bold transition-all hover:bg-blue-600 active:scale-[0.98]"
                >
                  I've Booked My Meeting
                </button>

                <button
                  onClick={handleContinueToProfile}
                  className="flex w-full cursor-pointer items-center justify-center rounded-full bg-transparent py-2 text-slate-500 text-sm font-bold hover:text-slate-800 transition-colors"
                >
                  Skip — I'll book later
                </button>
              </div>
            )}

            {/* Booked Footer */}
            {paymentState === 'booked' && (
              <button
                onClick={handleContinueToProfile}
                className="flex w-full cursor-pointer items-center justify-center rounded-full bg-[#2b8cee] py-4 text-white text-base font-bold transition-all hover:bg-blue-600 active:scale-[0.98]"
              >
                Continue to My Profile
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetCeoPage;
