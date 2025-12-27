import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../resources/config/config';

// Data for the page
const onboardingPhases = [
  {
    phase: 1,
    title: 'Account Selection',
    description: 'Choose how you want to invest. We support individual and entity accounts.',
    icon: 'manage_accounts',
    steps: [
      { title: 'Select Individual or Entity' },
      { title: 'Review Jurisdiction Eligibility' },
    ],
  },
  {
    phase: 2,
    title: 'Personal Information',
    description: 'Provide your basic details to comply with financial regulations.',
    icon: 'person',
    steps: [
      { title: 'Personal Contact Details' },
      { title: 'Date of Birth & Address' },
      { title: 'Social Security / Tax ID' },
    ],
  },
  {
    phase: 3,
    title: 'Investment Setup',
    description: 'Connect your funding source and decide your initial investment amount.',
    icon: 'payments',
    steps: [
      { title: 'Link Bank Account (Plaid)' },
      { title: 'Select Investment Tier' },
    ],
  },
  {
    phase: 4,
    title: 'Verification & Welcome',
    description: 'Finalize your profile, sign documents, and access your dashboard.',
    icon: 'verified_user',
    steps: [
      { title: 'Upload ID Documents' },
      { title: 'E-Sign Agreements' },
    ],
  },
];

const requirements = [
  { icon: 'badge', label: 'VALID ID', value: 'Passport or DL' },
  { icon: 'account_balance', label: 'FUNDING', value: 'US Bank Acct' },
  { icon: 'fingerprint', label: 'IDENTITY', value: 'SSN or TIN' },
  { icon: 'public', label: 'RESIDENCY', value: 'US Resident' },
];

const benefits = [
  {
    icon: 'psychology',
    title: 'AI-Powered Insights',
    description: 'Data-driven decisions',
    bgColor: 'bg-blue-50',
    iconColor: 'text-[#2b8cee]',
  },
  {
    icon: 'savings',
    title: 'Low Fee Structure',
    description: 'Maximize your returns',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: 'lock',
    title: 'Bank-Grade Security',
    description: '256-bit encryption',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
];

// Updated account tiers with correct data
const accountTiers = [
  {
    id: 'wealth_1m',
    minimum: '$1M',
    name: 'Hushh Wealth Investment',
    description: 'AI-powered wealth building',
    badge: null,
    borderColor: '#2b8cee',
    bgColor: 'rgba(43, 140, 238, 0.05)',
  },
  {
    id: 'wealth_5m',
    minimum: '$5M',
    name: 'Premium Wealth Account',
    description: 'Enhanced portfolio strategies',
    badge: 'PREMIUM',
    borderColor: '#71717A',
    bgColor: 'rgba(113, 113, 122, 0.05)',
  },
  {
    id: 'ultra_25m',
    minimum: '$25M',
    name: 'Ultra High Net Worth',
    description: 'Bespoke solutions worldwide',
    badge: 'ULTRA',
    borderColor: '#B8860B',
    bgColor: 'rgba(184, 134, 11, 0.05)',
  },
];

const faqs = [
  {
    question: 'Who can invest in Hushh Fund A?',
    answer: 'Currently, we accept accredited investors and qualified entities based in the US. International support is coming soon.',
  },
  {
    question: 'How long does verification take?',
    answer: 'Most verifications are completed instantly. In some cases requiring manual review, it may take up to 24-48 hours.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption (AES-256) and never sell your personal data to third parties.',
  },
];

export default function InvestorGuide() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const tiersRef = useRef<HTMLDivElement>(null);
  
  // Track which phases are visible/active based on scroll
  const [activePhases, setActivePhases] = useState<Set<number>>(new Set([0])); // First phase active by default
  const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!config.supabaseClient) return;
      const { data: { user } } = await config.supabaseClient.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  // Intersection Observer for scroll-triggered phase animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -40% 0px', // Trigger when element is in middle of viewport
      threshold: 0.3,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const phaseIndex = parseInt(entry.target.getAttribute('data-phase-index') || '0', 10);
        
        if (entry.isIntersecting) {
          setActivePhases((prev) => {
            const newSet = new Set(prev);
            // Add this phase and all previous phases
            for (let i = 0; i <= phaseIndex; i++) {
              newSet.add(i);
            }
            return newSet;
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    phaseRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleStartJourney = () => {
    if (isLoggedIn) {
      navigate('/onboarding/step-1');
    } else {
      navigate('/login', { state: { redirectTo: '/onboarding/step-1' } });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Helper to check if phase is active
  const isPhaseActive = useCallback((index: number) => activePhases.has(index), [activePhases]);

  return (
    <div className="bg-[#f6f7f8] min-h-screen font-['Manrope',sans-serif] antialiased text-[#111418] selection:bg-[#2b8cee]/20 selection:text-[#2b8cee]">
      <div className="mx-auto flex h-full min-h-screen w-full max-w-[500px] flex-col bg-white shadow-xl relative overflow-hidden">
        
        {/* Top App Bar */}
        <header className="sticky top-0 z-50 flex items-center justify-between bg-white/95 px-4 py-3 backdrop-blur-sm border-b border-gray-100">
          <button 
            onClick={handleBack}
            className="flex size-10 items-center justify-center rounded-full text-[#111418] transition hover:bg-[#f6f7f8]"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-[#111418] pr-10">Investor Guide</h2>
        </header>

        {/* Main Scrollable Content */}
        <main className="flex-1 flex flex-col pb-32 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Hero Section */}
          <div className="px-6 pt-6 pb-2 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[#2b8cee]/10 px-3 py-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2b8cee]">📘 INVESTOR GUIDE</span>
            </div>
            <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-[#111418]">
              Investor Onboarding Guide
            </h1>
            <p className="text-base font-medium leading-relaxed text-[#617589]">
              Your complete step-by-step guide to becoming a Hushh Fund A investor. Join the AI-Powered Berkshire Hathaway.
            </p>
          </div>

          {/* Stats */}
          <div className="p-6">
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-[#617589]">Total Steps</p>
                <p className="text-2xl font-bold text-[#111418]">17</p>
              </div>
              <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-[#617589]">Estimated Time</p>
                <p className="text-2xl font-bold text-[#111418]">~4 min</p>
              </div>
            </div>
          </div>

          {/* Onboarding Phases with Scroll Animation */}
          <section className="px-6 py-4">
            <h3 className="mb-6 text-xl font-bold text-[#111418]">Onboarding Phases</h3>
            <div className="relative flex flex-col gap-8">
              {/* Vertical Line Connector - animated */}
              <div className="absolute left-[19px] top-4 h-[calc(100%-2rem)] w-0.5 bg-gray-100">
                {/* Animated fill line */}
                <div 
                  className="w-full bg-[#2b8cee] transition-all duration-700 ease-out"
                  style={{ 
                    height: `${Math.min(100, (activePhases.size / onboardingPhases.length) * 100)}%`,
                  }}
                />
              </div>
              
              {onboardingPhases.map((phase, index) => {
                const isActive = isPhaseActive(index);
                
                return (
                  <div 
                    key={phase.phase} 
                    ref={(el) => { phaseRefs.current[index] = el; }}
                    data-phase-index={index}
                    className="relative flex gap-4"
                  >
                    {/* Phase number circle with animation */}
                    <div 
                      className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full shadow-sm ring-4 ring-white transition-all duration-500 ease-out ${
                        isActive 
                          ? 'bg-[#2b8cee] text-white shadow-md scale-100' 
                          : 'bg-white border-2 border-gray-200 text-gray-400 scale-95'
                      }`}
                    >
                      <span className="text-sm font-bold">{String(phase.phase).padStart(2, '0')}</span>
                    </div>
                    
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className={`material-symbols-outlined transition-colors duration-500 ${isActive ? 'text-[#2b8cee]' : 'text-gray-400'}`} 
                          style={{ fontSize: '20px' }}
                        >
                          {phase.icon}
                        </span>
                        <h4 className={`text-base font-bold transition-colors duration-500 ${isActive ? 'text-[#111418]' : 'text-gray-400'}`}>
                          {phase.title}
                        </h4>
                      </div>
                      <p className={`mb-3 text-sm transition-colors duration-500 ${isActive ? 'text-[#617589]' : 'text-gray-300'}`}>
                        {phase.description}
                      </p>
                      <ul className={`space-y-2 rounded-lg p-3 transition-all duration-500 ${
                        isActive ? 'bg-[#f6f7f8]' : 'border border-gray-100 bg-white'
                      }`}>
                        {phase.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2 text-sm">
                            {isActive ? (
                              <span className="material-symbols-outlined text-green-500 mt-0.5 transition-opacity duration-500" style={{ fontSize: '16px' }}>check_circle</span>
                            ) : (
                              <span className="size-1.5 rounded-full bg-gray-300 mt-2 transition-opacity duration-500"></span>
                            )}
                            <span className={`transition-colors duration-500 ${isActive ? 'text-[#111418]' : 'text-gray-300'}`}>
                              {step.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Requirements & Benefits Grid */}
          <section className="px-6 py-6 bg-[#f6f7f8]">
            <div className="grid grid-cols-1 gap-8">
              {/* Requirements */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-[#111418] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2b8cee]">fact_check</span>
                  Requirements
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm">
                      <span className="material-symbols-outlined text-gray-400">{req.icon}</span>
                      <span className="text-xs font-semibold uppercase text-[#617589]">{req.label}</span>
                      <span className="text-sm font-medium text-[#111418]">{req.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-[#111418] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2b8cee]">star</span>
                  Benefits
                </h3>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm border border-transparent hover:border-[#2b8cee]/20 transition"
                    >
                      <div className={`flex size-10 items-center justify-center rounded-full ${benefit.bgColor} ${benefit.iconColor}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{benefit.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#111418]">{benefit.title}</h4>
                        <p className="text-xs text-[#617589]">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Account Tiers - Horizontal Swipeable */}
          <section className="px-6 py-8">
            <h3 className="mb-4 text-xl font-bold text-[#111418]">Account Tiers</h3>
            <div 
              ref={tiersRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {accountTiers.map((tier) => (
                <div 
                  key={tier.id}
                  className="flex min-w-[260px] flex-col rounded-xl p-5 shadow-sm snap-start relative overflow-hidden"
                  style={{ 
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: tier.borderColor,
                    backgroundColor: tier.bgColor,
                  }}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div 
                      className="absolute top-0 right-0 rounded-bl-lg px-3 py-1 text-[10px] font-bold uppercase text-white"
                      style={{ backgroundColor: tier.borderColor }}
                    >
                      {tier.badge}
                    </div>
                  )}
                  
                  {/* Tier Name Tag */}
                  <div className="mb-4">
                    <span 
                      className="rounded-md px-2 py-1 text-xs font-bold uppercase"
                      style={{ 
                        backgroundColor: `${tier.borderColor}20`,
                        color: tier.borderColor,
                      }}
                    >
                      {tier.id === 'wealth_1m' ? 'WEALTH' : tier.id === 'wealth_5m' ? 'PREMIUM' : 'ULTRA'}
                    </span>
                  </div>
                  
                  {/* Minimum Investment */}
                  <h4 className="text-3xl font-bold text-[#111418] mb-1">{tier.minimum}</h4>
                  <p className="text-xs text-[#617589] mb-3">Minimum Investment</p>
                  
                  {/* Tier Name */}
                  <h5 className="text-base font-bold text-[#111418] mb-1">{tier.name}</h5>
                  <p className="text-sm text-[#617589]">{tier.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Hushh Fund A Section */}
          <section className="px-6 pb-6">
            <div className="relative overflow-hidden rounded-2xl bg-[#101922] p-6 text-white shadow-xl">
              {/* Abstract Background Pattern */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#2b8cee]/20 blur-3xl"></div>
              <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-md">
                  <span className="material-symbols-outlined text-xs">trending_up</span>
                  <span className="text-xs font-bold uppercase tracking-wide">Hushh Fund A</span>
                </div>
                <h3 className="mb-2 text-xl font-bold">The AI-Powered Berkshire Hathaway</h3>
                <p className="mb-6 text-sm text-gray-300">
                  Our flagship fund leverages proprietary AI models to identify high-growth opportunities with minimized risk exposure.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Class A Shares</p>
                    <p className="text-sm font-semibold text-white">Voting Rights</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Class B Shares</p>
                    <p className="text-sm font-semibold text-white">Dividend Priority</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="px-6 py-6 border-t border-gray-100">
            <h3 className="mb-4 text-xl font-bold text-[#111418]">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details 
                  key={index}
                  className="group rounded-lg border border-gray-200 bg-white [&_summary::-webkit-details-marker]:hidden"
                  open={openFaq === index}
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) {
                      setOpenFaq(index);
                    } else if (openFaq === index) {
                      setOpenFaq(null);
                    }
                  }}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-4 text-[#111418]">
                    <h4 className="text-sm font-bold">{faq.question}</h4>
                    <span className="material-symbols-outlined shrink-0 transition duration-300 group-open:-rotate-180 text-[#617589]">expand_more</span>
                  </summary>
                  <div className="px-4 pb-4">
                    <p className="text-sm leading-relaxed text-[#617589]">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        </main>

        {/* Sticky Footer */}
        <footer className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 pb-8 backdrop-blur-xl">
          <button 
            onClick={handleStartJourney}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2b8cee] py-4 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-600 active:scale-[0.98]"
          >
            {isLoggedIn ? 'Start Onboarding' : 'Start Onboarding'}
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
          </button>
          <div className="mt-4 flex justify-center gap-6">
            <a className="text-xs font-medium text-[#617589] hover:text-[#111418]" href="/privacy-policy">Terms of Service</a>
            <a className="text-xs font-medium text-[#617589] hover:text-[#111418]" href="/privacy-policy">Privacy Policy</a>
            <a className="text-xs font-medium text-[#617589] hover:text-[#111418]" href="/contact">Support</a>
          </div>
        </footer>
      </div>

      {/* Add custom styles for hiding scrollbar */}
      <style>{`
        .overflow-x-auto::-webkit-scrollbar,
        .overflow-y-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
