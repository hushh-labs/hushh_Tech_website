import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DevConsole, { initDevConsole } from './components/DevConsole';
import Leadership from './components/Leadership';
import Philosophy from './components/Philosophy';
import Footer from './components/Footer';
import Login from './pages/Login'
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';
// FloatingContactBubble removed as requested
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme';
import Consumers from './pages/services/consumers';
import Business from './pages/services/business';
import Signup from './pages/Signup';
import Faq from './pages/faq';
import Career from './pages/career';
// import Community from './pages/community';
import CommunityList from './pages/community/communityList';
import CommunityPost from './pages/community/communityPost';
import ReportDetailPage from './pages/reports/reportDetail';
import BenefitsPage from './pages/benefits';
import PrivacyPolicy from './pages/privacy-policy';
import CareersPrivacyPolicy from './pages/career-privacy-policy';
import CaliforniaPrivacyPolicy from './pages/california-privacy-policy';
import EUUKPrivacyPolicy from './pages/eu-uk-privacy-policy';
import DeleteAccountPage from './pages/delete-account';
import { useState, useEffect, ReactNode } from 'react';
import config from './resources/config/config';
import NDAPopup from './components/NdaForm';
import Profile from './pages/profile';
import AuthCallback from './pages/AuthCallback';
import KYCVerificationPage from './pages/kyc-verification/page';
import NDARequestModal from './components/NdaForm';
import NDARequestModalComponent from './components/NDARequestModal';
import UserProfilePage from './pages/user-profile/page';
import InvestorProfilePage from './pages/investor-profile';
import KYCFormPage from './pages/kyc-form/page';
import { Session } from '@supabase/supabase-js';
import DiscoverFundA from './pages/discover-fund-a';
import SellTheWallPage from './pages/sell-the-wall';
import AIPoweredBerkshirePage from './pages/ai-powered-berkshire';
import UserRegistration from './pages/UserRegistration';
import ProtectedRoute from './components/ProtectedRoute';
import YourProfilePage from './pages/your-profile';
import HushhUserProfilePage from './pages/hushh-user-profile';
import ViewPreferencesPage from './pages/hushh-user-profile/view';
import PrivacyControlsPage from './pages/hushh-user-profile/privacy';
import PublicHushhProfilePage from './pages/hushhid';
import PublicInvestorProfilePage from './pages/investor/PublicInvestorProfile';
import HushhIDHeroDemo from './pages/hushhid-hero-demo';
import OnboardingStep1 from './pages/onboarding/Step1';
import OnboardingStep2 from './pages/onboarding/Step2';
import OnboardingStep3 from './pages/onboarding/Step3';
import OnboardingStep4 from './pages/onboarding/Step4';
import OnboardingStep5 from './pages/onboarding/Step5';
import OnboardingStep6 from './pages/onboarding/Step6';
import OnboardingStep7 from './pages/onboarding/Step7';
import OnboardingStep8 from './pages/onboarding/Step8';
import OnboardingStep9 from './pages/onboarding/Step9';
import OnboardingStep10 from './pages/onboarding/Step10';
import OnboardingStep11 from './pages/onboarding/Step11';
import OnboardingStep12 from './pages/onboarding/Step12';
import OnboardingStep13 from './pages/onboarding/Step13';
import OnboardingStep14 from './pages/onboarding/Step14';
import OnboardingStep15 from './pages/onboarding/Step15';
import VerifyIdentityPage from './pages/onboarding/VerifyIdentity';
import VerifyCompletePage from './pages/onboarding/VerifyComplete';
import MeetCeoPage from './pages/onboarding/MeetCeo';
import InvestorGuidePage from './pages/onboarding/InvestorGuide';
import KYCDemoPage from './pages/kyc-demo';
import KycFlowPage from './pages/kyc-flow';
import A2APlaygroundPage from './pages/a2a-playground';
import ReceiptGeneratorPage from './pages/receipt-generator';
import DeveloperDocsPage from './pages/developer-docs';
import SalesMailingPage from './pages/sales-mailing';
import MobileBottomNav from './components/MobileBottomNav';

// Google Analytics configuration
const GA_TRACKING_ID = 'G-R58S9WWPM0';

// Content wrapper component that applies conditional margin
const ContentWrapper = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/signUp' || location.pathname === '/solutions';
  const isAuthCallback = location.pathname.startsWith('/auth/callback');
  const isUserRegistration = location.pathname === '/user-registration';
  const isOnboarding = location.pathname.startsWith('/onboarding');
  const isKycFlow = location.pathname.startsWith('/kyc-flow');
  const isA2APlayground = location.pathname.startsWith('/a2a-playground');
  const isInvestorGuide = location.pathname === '/investor-guide';

  return (
    <div className={`${isHomePage || isAuthCallback || isUserRegistration || isOnboarding || isKycFlow || isA2APlayground || isInvestorGuide ? '' : 'mt-20'}`}>
      {children}
    </div>
  );
};

// Google Analytics setup function
const initializeGoogleAnalytics = () => {
  // Check if gtag is already loaded
  if (typeof window !== 'undefined' && !window.gtag) {
    // Create script element for gtag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA_TRACKING_ID);
    };
  }
};

// Check if dev console should be enabled
// DISABLED: Dev console is disabled for production
const shouldEnableDevConsole = (): boolean => {
  // Always return false to disable the dev console in production
  return false;
  
  // Original logic (commented out):
  // if (typeof window === 'undefined') return false;
  // const urlParams = new URLSearchParams(window.location.search);
  // if (urlParams.get('debug') === 'true') return true;
  // if (localStorage.getItem('devMode') === 'true') return true;
  // if (import.meta.env.DEV) return true;
  // return false;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [devConsoleEnabled, setDevConsoleEnabled] = useState(shouldEnableDevConsole());
  // Initialize Google Analytics
  useEffect(() => {
    initializeGoogleAnalytics();
  }, []);

  // Initialize Dev Console if enabled
  useEffect(() => {
    if (devConsoleEnabled) {
      initDevConsole();
    }
  }, [devConsoleEnabled]);

  // Handle secret gesture for dev console (5 taps on logo)
  const handleDevConsoleTrigger = () => {
    if (!devConsoleEnabled) {
      localStorage.setItem('devMode', 'true');
      setDevConsoleEnabled(true);
      initDevConsole();
    }
    setIsDevConsoleOpen(true);
  };

  // Make trigger available globally for Navbar
  useEffect(() => {
    (window as any).openDevConsole = handleDevConsoleTrigger;
    return () => {
      delete (window as any).openDevConsole;
    };
  }, [devConsoleEnabled]);

  // Fetch user session when app loads
  useEffect(() => {
    if (config.supabaseClient) {
      config.supabaseClient.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      // Listen for auth state changes
      const {
        data: { subscription },
      } = config.supabaseClient.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription?.unsubscribe();
    }
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          {/* Navbar - Sticky header with brand lockup */}
          <Navbar />
          {/* {session && <NDAPopup />} */}
          <ContentWrapper>
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/about/leadership" element={<Leadership />} />
              <Route path="/about/philosophy" element={<Philosophy />} />
              <Route path="/Login" element={<Login />} />
              <Route path="/Contact" element={<Contact />} />
              <Route path="/benefits" element={<BenefitsPage />} />
              <Route path='/services/consumers' element={<Consumers />} />
              <Route path='/services/business' element={<Business />} />
              <Route path='/Signup' element={<Signup />} />
              <Route path='/faq' element={<Faq />} />
              <Route path='/profile' element={
                <Profile />
              } />
              <Route path="/career" element={<Career />} />
              <Route path="/career/*" element={<Career />} />
              <Route path='/privacy-policy' element={<PrivacyPolicy />} />
              <Route path='/carrer-privacy-policy' element={<CareersPrivacyPolicy />} />
              <Route path="/community" element={
                <CommunityList />
              } />
              <Route path='/california-privacy-policy' element={<CaliforniaPrivacyPolicy />} />
              <Route path='/eu-uk-jobs-privacy-policy' element={<EUUKPrivacyPolicy />} />
              <Route path='/delete-account' element={<DeleteAccountPage />} />
              <Route path="/community/*" element={

                <CommunityPost />

              } />
              <Route path="/reports/:id" element={

                <ReportDetailPage />

              } />
              <Route path="/auth/callback" element={<AuthCallback />} />
              {/* Investor Onboarding Guide - Public landing page */}
              <Route path="/investor-guide" element={<InvestorGuidePage />} />
              <Route path="/onboarding/step-1" element={
                <ProtectedRoute>
                  <OnboardingStep1 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-2" element={
                <ProtectedRoute>
                  <OnboardingStep2 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-3" element={
                <ProtectedRoute>
                  <OnboardingStep3 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-4" element={
                <ProtectedRoute>
                  <OnboardingStep4 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-5" element={
                <ProtectedRoute>
                  <OnboardingStep5 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-6" element={
                <ProtectedRoute>
                  <OnboardingStep6 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-7" element={
                <ProtectedRoute>
                  <OnboardingStep7 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-8" element={
                <ProtectedRoute>
                  <OnboardingStep8 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-9" element={
                <ProtectedRoute>
                  <OnboardingStep9 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-10" element={
                <ProtectedRoute>
                  <OnboardingStep10 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-11" element={
                <ProtectedRoute>
                  <OnboardingStep11 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-12" element={
                <ProtectedRoute>
                  <OnboardingStep12 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-13" element={
                <ProtectedRoute>
                  <OnboardingStep13 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-14" element={
                <ProtectedRoute>
                  <OnboardingStep14 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/step-15" element={
                <ProtectedRoute>
                  <OnboardingStep15 />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/verify" element={
                <ProtectedRoute>
                  <VerifyIdentityPage />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/verify-complete" element={
                <ProtectedRoute>
                  <VerifyCompletePage />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/meet-ceo" element={
                <ProtectedRoute>
                  <MeetCeoPage />
                </ProtectedRoute>
              } />
              <Route path="/hushh-user-profile" element={
                <ProtectedRoute>
                  <HushhUserProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/hushh-user-profile/view" element={
                <ProtectedRoute>
                  <ViewPreferencesPage />
                </ProtectedRoute>
              } />
              <Route path="/hushh-user-profile/privacy" element={
                <ProtectedRoute>
                  <PrivacyControlsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile/:id" element={<ViewPreferencesPage />} />
              <Route path="/hushhid/:id" element={<PublicHushhProfilePage />} />
              <Route path="/hushhid-hero-demo" element={<HushhIDHeroDemo />} />
              {/* <Route path="/solutions" element={<SolutionsPage />} /> */}
              <Route path='/kyc-verification' element={

                <KYCVerificationPage />

              } />
              <Route path='/kyc-form' element={

                <KYCFormPage />

              } />
              <Route path='/discover-fund-a' element={

                <DiscoverFundA />

              } />
              <Route path='/sell-the-wall' element={

                <SellTheWallPage />

              } />
              <Route path='/ai-powered-berkshire' element={

                <AIPoweredBerkshirePage />

              } />
              <Route path='/user-registration' element={
                <ProtectedRoute>
                  <UserRegistration />
                </ProtectedRoute>
              } />
              <Route path='/nda-form' element={

                <NDARequestModalComponent
                  session={session}
                  onSubmit={(result: string) => {
                    console.log("NDA submission result:", result);
                    // Handle post-submission actions here
                    if (result === "Approved" || result === "Pending" || result === "Requested permission") {
                      // Redirect to appropriate page on success
                      window.location.href = "/";
                    }
                  }}
                />

              } />
              <Route path='/investor-profile' element={
                <ProtectedRoute>
                  <InvestorProfilePage />
                </ProtectedRoute>
              } />
              <Route path='/investor/:slug' element={<PublicInvestorProfilePage />} />
              <Route path='/user-profile' element={

                <UserProfilePage />

              } />
              <Route path='/your-profile' element={

                <YourProfilePage />

              } />
              <Route path='/kyc-demo' element={<KYCDemoPage />} />
              <Route path='/kyc-flow' element={<KycFlowPage />} />
              <Route path='/a2a-playground' element={<A2APlaygroundPage />} />
              <Route path='/receipt-generator' element={<ReceiptGeneratorPage />} />
              <Route path='/developer-docs' element={<DeveloperDocsPage />} />
              <Route path='/sales-mailing' element={<SalesMailingPage />} />
            </Routes>
          </ContentWrapper>
          <Footer />
          {/* Mobile Bottom Navigation - only visible on mobile */}
          <MobileBottomNav />
        </div>
        
        {/* Dev Console Toggle Button - only shows when enabled but console is closed */}
        {devConsoleEnabled && !isDevConsoleOpen && (
          <button
            onClick={() => setIsDevConsoleOpen(true)}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 9999,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            🔧 Console
          </button>
        )}
        
        {/* Dev Console Component */}
        <DevConsole 
          isOpen={isDevConsoleOpen} 
          onClose={() => setIsDevConsoleOpen(false)} 
        />
      </Router>
    </ChakraProvider>
  );
}

export default App;
