import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import config from '../../resources/config/config';

type PaymentState = 'loading' | 'not_paid' | 'verifying' | 'paid' | 'booked';

// Shimmer loading component
const ShimmerLoader = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FAFAFA' }}>
    <div className="w-full max-w-md">
      {/* Shimmer avatar */}
      <div className="flex justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      </div>
      
      {/* Shimmer title */}
      <div className="space-y-3 mb-8">
        <div className="h-8 w-3/4 mx-auto bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-1/2 mx-auto bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse" />
      </div>

      {/* Spinning loader */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div 
            className="absolute inset-0 rounded-full border-4 border-t-gray-800 animate-spin"
            style={{ animationDuration: '1s' }}
          />
        </div>
        <p className="text-lg text-gray-600 font-medium">{message}</p>
      </div>

      {/* Shimmer content blocks */}
      <div className="mt-8 space-y-4">
        <div className="h-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl animate-pulse" />
        <div className="h-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse" />
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
    <div className="min-h-screen flex items-center justify-center p-4 pt-28 pb-12" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div 
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#E5E5E5' }}
          >
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#1A1A1A" 
              strokeWidth="1.5"
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
          </div>
          <h1 className="text-[28px] md:text-[36px] mb-3" style={{ color: '#1A1A1A', fontWeight: 500 }}>
            Complete Your Registration
          </h1>
          <p className="text-lg" style={{ color: '#666666' }}>
            Final step to verify your Hushh Fund A account
          </p>
        </div>

        {error && (
          <div 
            className="mb-6 p-4 rounded-xl text-center"
            style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B' }}
          >
            {error}
          </div>
        )}

        {/* Not Paid State */}
        {paymentState === 'not_paid' && (
          <>
            {/* Human Verification Section */}
            <div 
              className="rounded-2xl p-6 mb-6"
              style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#1A1A1A' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl" style={{ color: '#1A1A1A', fontWeight: 500 }}>
                    Human Verification
                  </h2>
                  <p className="text-sm" style={{ color: '#666666' }}>
                    A small step to confirm you're a real person
                  </p>
                </div>
              </div>
              <p className="text-[15px] leading-relaxed" style={{ color: '#666666' }}>
                To complete your Hushh Fund A registration, we require a simple $1 verification. 
                This small step helps us filter out bots, scammers, and automated requests.
              </p>
            </div>

            {/* Bonuses Section */}
            <div 
              className="rounded-2xl p-6 mb-8"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00A9E0" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <h3 className="text-lg" style={{ color: '#1A1A1A', fontWeight: 500 }}>
                  You'll Also Receive
                </h3>
              </div>
              <p className="text-sm mb-4" style={{ color: '#888888' }}>
                As a thank you for completing verification
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#E5F7FC' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A9E0" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[15px]" style={{ color: '#1A1A1A' }}>
                      Earn 100 Hushh Coins
                    </p>
                    <p className="text-sm" style={{ color: '#888888' }}>Credited instantly to your account</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#E5F7FC' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A9E0" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-[15px]" style={{ color: '#1A1A1A' }}>
                      Direct CEO Access
                    </p>
                    <p className="text-sm" style={{ color: '#888888' }}>Book a 1-hour deep dive with Manish</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 rounded-full text-lg font-semibold mb-4 transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(to right, #00A9E0, #6DD3EF)',
                color: '#0B1120',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Redirecting to payment...
                </span>
              ) : (
                'Complete Registration — $1'
              )}
            </button>

            {/* Back Button */}
            <button
              onClick={handleBack}
              disabled={loading}
              className="w-full py-3 text-lg font-medium transition-colors"
              style={{ color: '#666666' }}
            >
              Back
            </button>
          </>
        )}

        {/* Paid State - Show Calendly */}
        {paymentState === 'paid' && (
          <>
            {/* Success Message */}
            <div 
              className="rounded-2xl p-6 mb-6 text-center"
              style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#E5E5E5' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-xl mb-2" style={{ color: '#1A1A1A', fontWeight: 500 }}>
                Registration Complete!
              </h2>
              <p style={{ color: '#666666' }}>
                You've earned <span className="font-bold" style={{ color: '#1A1A1A' }}>{hushhCoins} Hushh Coins</span>
              </p>
            </div>

            {/* Calendly Instructions */}
            <div 
              className="rounded-2xl p-6 mb-6 text-center"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E5' }}
            >
              <h2 className="text-xl mb-3" style={{ color: '#1A1A1A', fontWeight: 500 }}>
                Book Your 1-Hour Deep Dive
              </h2>
              <p style={{ color: '#666666' }}>
                Schedule office hours with Manish Sainani for focused discussion
              </p>
            </div>

            {/* Calendly Embed - Office Hours 1-Hour Focus Deep Dive */}
            <div 
              className="rounded-2xl overflow-hidden mb-6" 
              style={{ height: '700px', border: '1px solid #E5E5E5' }}
            >
              <iframe
                src="https://calendly.com/hushh/ceo-office-hours"
                width="100%"
                height="100%"
                frameBorder="0"
                title="Schedule office hours with Manish Sainani"
              ></iframe>
            </div>

            {/* After Booking Button */}
            <button
              onClick={handleCalendlyBooked}
              className="w-full py-4 rounded-full text-lg font-semibold mb-4 transition-all"
              style={{
                background: 'linear-gradient(to right, #00A9E0, #6DD3EF)',
                color: '#0B1120',
              }}
            >
              I've Booked My Meeting - Continue
            </button>

            <button
              onClick={handleContinueToProfile}
              className="w-full py-3 text-lg font-medium transition-colors hover:opacity-80"
              style={{ color: '#666666' }}
            >
              Skip - I'll book later
            </button>
          </>
        )}

        {/* Booked State */}
        {paymentState === 'booked' && (
          <>
            <div 
              className="rounded-2xl p-8 mb-8 text-center"
              style={{ backgroundColor: '#F5F5F5', border: '1px solid #E5E5E5' }}
            >
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#E5E5E5' }}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl mb-3" style={{ color: '#1A1A1A', fontWeight: 500 }}>
                All Set!
              </h2>
              <p className="mb-2" style={{ color: '#666666' }}>
                Your meeting is scheduled with Manish Sainani.
              </p>
              <p style={{ color: '#666666' }}>
                You've earned <span className="font-bold" style={{ color: '#1A1A1A' }}>{hushhCoins} Hushh Coins</span>!
              </p>
            </div>

            <button
              onClick={handleContinueToProfile}
              className="w-full py-4 rounded-full text-lg font-semibold transition-all"
              style={{
                background: 'linear-gradient(to right, #00A9E0, #6DD3EF)',
                color: '#0B1120',
              }}
            >
              Continue to My Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MeetCeoPage;
