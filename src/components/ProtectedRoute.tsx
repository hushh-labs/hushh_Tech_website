import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../resources/config/config';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      let timeout: ReturnType<typeof setTimeout> | null = null;
      let subscription: { unsubscribe: () => void } | null = null;
      try {
        if (!config.supabaseClient) {
          console.error("Supabase client is not initialized");
          console.info("[Hushh][ProtectedRoute] Missing Supabase client, cannot verify session");
          navigate("/login", { replace: true });
          return;
        }

        const supabase = config.supabaseClient;

        // First try to read the current session
        let { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("[Hushh][ProtectedRoute] getSession error", sessionError);
        }

        // If no session/user yet (common on iOS Safari right after redirect), wait briefly for auth state change
        if (!session?.user) {
          console.info("[Hushh][ProtectedRoute] No session on initial check, waiting for restore...");
          await new Promise<void>((resolve) => {
            const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
              if (newSession?.user) {
                session = newSession;
                resolve();
              }
            });
            subscription = data.subscription;
            timeout = setTimeout(() => resolve(), 1500);
          });
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          subscription?.unsubscribe();
          subscription = null;

          if (!session?.user) {
            console.error("[Hushh][ProtectedRoute] Session still missing after wait");
            navigate("/login", { replace: true });
            return;
          }
        }

        const user = session?.user;
        if (!user) {
          // User is not authenticated, redirect to login
          console.info("[Hushh][ProtectedRoute] No user found after auth check");
          navigate("/login", { replace: true });
          return;
        }

        // Check if user has completed onboarding
        const { data: onboardingData } = await supabase
          .from('onboarding_data')
          .select('is_completed, current_step')
          .eq('user_id', user.id)
          .maybeSingle();
        console.info("[Hushh][ProtectedRoute] Session ok", { userId: user.id, email: user.email || "(empty from Apple)", onboardingFound: !!onboardingData });

        // If user hasn't completed onboarding and is NOT on an onboarding page, redirect to onboarding
        const isOnOnboardingPage = location.pathname.startsWith('/onboarding/');
        
        if (!onboardingData || !onboardingData.is_completed) {
          // User must complete onboarding first
          if (!isOnOnboardingPage) {
            console.log('Redirecting to onboarding - not completed yet');
            // Use replace: true to prevent infinite back button loop
            // This replaces the current history entry instead of adding a new one
            navigate('/onboarding/step-1', { replace: true });
            return;
          }
        }

        // User is authenticated and has completed onboarding (or is on onboarding page)
        setIsAuthorized(true);
      } catch (error) {
        console.error("Error checking auth and onboarding:", error);
        navigate("/login", { replace: true });
      } finally {
        setIsLoading(false);
        if (timeout) {
          clearTimeout(timeout);
        }
        subscription?.unsubscribe();
      }
    };

    checkAuthAndOnboarding();
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so return nothing
  }

  return <>{children}</>;
};

export default ProtectedRoute;
