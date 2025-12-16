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
import FloatingContactBubble from './components/FloatingContactBubble';
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
import VerifyIdentityPage from './pages/onboarding/VerifyIdentity';
import VerifyCompletePage from './pages/onboarding/VerifyComplete';
import MeetCeoPage from './pages/onboarding/MeetCeo';
import KYCDemoPage from './pages/kyc-demo';
import KycFlowPage from './pages/kyc-flow';
import A2APlaygroundPage from './pages/a2a-playground';
import ReceiptGeneratorPage from './pages/receipt-generator';

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

  return (
    <div className={`${isHomePage || isAuthCallback || isUserRegistration || isOnboarding || isKycFlow || isA2APlayground ? '' : 'mt-20'}`}>
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
const shouldEnableDevConsole = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('debug') === 'true') return true;
  
  // Check localStorage flag
  if (localStorage.getItem('devMode') === 'true') return true;
  
  // Enable in development mode
  if (import.meta.env.DEV) return true;
  
  return false;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [devConsoleEnabled, setDevConsoleEnabled] = useState(shouldEnableDevConsole());
  const marqueeTickers = [
    {
      label: "Saudi Aramco",
      logo: "https://www.nicepng.com/png/full/274-2744280_saudi-aramco-logo-saudi-aramco-logo-vector.png",
    },
    {
      label: "GOOG",
      logo: "https://thumbs.dreamstime.com/b/google-logo-vector-format-white-background-illustration-407571048.jpg",
    },
    {
      label: "AAPL",
      logo: "https://fabrikbrands.com/wp-content/uploads/Apple-Logo-History-1-1155x770.png",
    },
    {
      label: "MSFT",
      logo: "https://static.vecteezy.com/system/resources/previews/027/127/473/non_2x/microsoft-logo-microsoft-icon-transparent-free-png.png",
    },
    {
      label: "NVDA",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVEu8tfOJpA-vMjPqyI2gEyaDjTaI7tSJFzQ&s",
    },
    {
      label: "AMZN",
      logo: "https://static.vecteezy.com/system/resources/previews/014/018/561/non_2x/amazon-logo-on-transparent-background-free-vector.jpg",
    },
    {
      label: "BRK.B",
      logo: "https://www.shutterstock.com/shutterstock/photos/2378735305/display_1500/stock-vector-brk-letter-logo-design-on-a-white-background-or-monogram-logo-design-for-entrepreneur-and-business-2378735305.jpg",
    },
    {
      label: "META",
      logo: "https://img.freepik.com/premium-vector/meta-company-logo_265339-667.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      label: "JPM",
      logo: "https://e7.pngegg.com/pngimages/225/668/png-clipart-jpmorgan-chase-logo-bank-business-morgan-stanley-bank-text-logo.png",
    },
    {
      label: "ICBC",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkYKU2DFnDgpOtiG7XP3N9Am69IFfZj5hLTg&s",
    },
    {
      label: "China Construction Bank",
      logo: "https://www.nfcw.com/wp-content/uploads/2021/06/china-construction-bank-logo-400W.jpg",
    },
    {
      label: "XOM",
      logo: "https://static.vecteezy.com/system/resources/previews/009/116/598/non_2x/com-logo-com-letter-com-letter-logo-design-initials-com-logo-linked-with-circle-and-uppercase-monogram-logo-com-typography-for-technology-business-and-real-estate-brand-vector.jpg",
    },
    {
      label: "Agricultural Bank of China",
      logo: "https://static.wikia.nocookie.net/logopedia/images/d/d6/ABC_china_symbol.svg/revision/latest/scale-to-width-down/1200?cb=20240204071833",
    },
    {
      label: "TSM",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Tsmc.svg/1200px-Tsmc.svg.png",
    },
    {
      label: "Bank of China",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bank_of_China_symbol.svg/2048px-Bank_of_China_symbol.svg.png",
    },
    {
      label: "TM",
      logo: "https://global.toyota/pages/global_toyota/mobility/toyota-brand/emblem_001.jpg",
    },
    {
      label: "PetroChina",
      logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Petrochina_logo.svg/250px-Petrochina_logo.svg.png",
    },
    {
      label: "WMT",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxwPUD4NGc7WTQVqDstT5ZPRQXm6ka0KTsmTsKfiY&usqp=CAE&s",
    },
    {
      label: "TCEHY",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Tencent_Logo.svg",
    },
    {
      label: "BAC",
      logo: "https://www.bankofamerica.com/content/images/ContextualSiteGraphics/Logos/en_US/logos/bac-logo-v2.png",
    },
    {
      label: "EQNR",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Equinor.svg/1200px-Equinor.svg.png",
    },
    {
      label: "JNJ",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwR-mYiIkkCIY28ur2ZykKmYqL3FoOsBAmhg&s",
    },
    {
      label: "DTE.DE",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT93q9uHQOWwfKPM_cy8AMa1cUWLTTxGCu0FA&s",
    },
    {
      label: "CMCSA",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj16S81rTASlKjG6D8at0GhqtCoyTuJJYEsQ&s",
    },
    {
      label: "UNH",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8eLWlU5eLw8UwmHHHdCn8oXiGv4aSHPPbiQ&s",
    },
    {
      label: "HSBC",
      logo: "https://i.pinimg.com/736x/4c/4a/d8/4c4ad867b77c17f313c5343fa95154c3.jpg",
    },
    {
      label: "SHEL",
      logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm4vpK8XAVnLNzAxkomte0d1QEeb4aQ7_Whw&s",
    },
  ];

  const marqueePrefix = "Introducing the hushh 27 alpha bets —";

  const renderMarqueeChunk = (key: string) => (
    <span className="marquee-chunk" key={key}>
      <span className="marquee-prefix">{marqueePrefix}</span>
      <span className="marquee-body">
        {marqueeTickers.map((ticker, idx) => (
          <React.Fragment key={`${key}-${ticker.label}-${idx}`}>
            <span className="ticker inline-flex items-center gap-1">
              <img
                src={ticker.logo}
                alt={`${ticker.label} logo`}
                className="ticker-logo w-4 h-4 object-contain"
              />
              <span>{ticker.label}</span>
            </span>
            {idx !== marqueeTickers.length - 1 && (
              <span className="ticker-sep">,</span>
            )}
          </React.Fragment>
        ))}
      </span>
    </span>
  );


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
          {/* Marquee Strip */}
          <div className="marquee-container h-12 flex items-center overflow-hidden border-b border-gray-200">
            <div className="marquee-track">
              {renderMarqueeChunk("first")}
              {renderMarqueeChunk("second")}
            </div>
          </div>
          {/* Spacer so Navbar sits BELOW the marquee strip */}
          <div className="marquee-spacer h-12" />
          <Navbar />
          <FloatingContactBubble />
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
              <Route path="/community/*" element={

                <CommunityPost />

              } />
              <Route path="/reports/:id" element={

                <ReportDetailPage />

              } />
              <Route path="/auth/callback" element={<AuthCallback />} />
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
            </Routes>
          </ContentWrapper>
          <Footer />
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
