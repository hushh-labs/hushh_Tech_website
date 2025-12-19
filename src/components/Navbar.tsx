import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiChevronDown, FiUser, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import config from "../resources/config/config";
import { Image, useToast, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import hushhLogo from "../components/images/Hushhogo.png";
import LanguageSwitcher from "./LanguageSwitcher";
import DeleteAccountModal from "./DeleteAccountModal";
import { useStockQuotes, StockQuote, STOCK_LOGOS } from "../hooks/useStockQuotes";

// Secret gesture state for dev console activation
let tapCount = 0;
let lastTapTime = 0;

// Chip-based ticker component
const TickerChip = ({ quote, isLoading }: { quote: StockQuote; isLoading?: boolean }) => {
  return (
    <div className="group flex h-9 shrink-0 items-center gap-2 rounded-full bg-[#1a232e] border border-white/5 pl-2 pr-3 hover:border-white/10 transition-colors">
      {/* Logo in white circle */}
      <div className="flex w-6 h-6 items-center justify-center rounded-full bg-white shrink-0 overflow-hidden">
        {quote.logo ? (
          <img
            src={quote.logo}
            alt={`${quote.displaySymbol} logo`}
            className="w-4 h-4 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-[10px] font-bold text-black">{quote.displaySymbol.charAt(0)}</span>
        )}
      </div>
      {/* Stock symbol - use displaySymbol for cleaner display */}
      <span className="text-[11px] font-bold text-white leading-none">{quote.displaySymbol}</span>
      {/* Percent change with arrow */}
      <div className={`ml-0.5 flex items-center gap-0.5 ${quote.isUp ? 'text-green-400' : 'text-red-400'}`}>
        <span className="text-[12px]">{quote.isUp ? '▲' : '▼'}</span>
        <span className={`text-[11px] font-medium ${isLoading ? 'animate-pulse' : ''}`}>
          {Math.abs(quote.percentChange).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [toastShown, setToastShown] = useState(false);
  const [careerDropdownOpen, setCareerDropdownOpen] = useState(false);
  const [mobileCareerDropdownOpen, setMobileCareerDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const careerDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  // Fetch real-time stock quotes (refreshes every 2 minutes for 27 stocks)
  const { quotes, loading: quotesLoading, lastUpdated } = useStockQuotes(120000);

  // quotes already includes fallback data from the hook, so we can use it directly
  const displayQuotes = quotes;

  // Handle secret gesture - 5 rapid taps on logo to open dev console
  const handleSecretGesture = () => {
    const now = Date.now();
    if (now - lastTapTime < 500) {
      tapCount++;
      if (tapCount >= 5) {
        tapCount = 0;
        // Open the dev console using the global function exposed by App.tsx
        if ((window as any).openDevConsole) {
          (window as any).openDevConsole();
          toast({
            title: '🔧 Developer Mode Activated',
            description: 'Dev console is now available',
            status: 'info',
            duration: 2000,
            isClosable: true,
          });
        }
      }
    } else {
      tapCount = 1;
    }
    lastTapTime = now;
  };

  useEffect(() => {
    if (!config.supabaseClient) return;
    
    // Fetch the current session
    config.supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = config.supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    const cleanup = () => subscription?.unsubscribe();
    return cleanup;
  }, []);

  const handleLogout = async () => {
    if (!config.supabaseClient) return;
    
    try {
      await config.supabaseClient.auth.signOut();
      setSession(null);
    } catch (error) {
      console.error("Error logging out of Supabase:", error);
    }

    localStorage.removeItem("isLoggedIn");
  };

  // Show welcome toast when a user is signed in (only once)
  useEffect(() => {
    if (session && !toastShown) {
      toast({
        title: t('common.welcome'),
        description: t('common.signInMessage'),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setToastShown(true);
    }
  }, [session, toastShown, toast, t]);

  const isAuthenticated = !!session;

  const toggleDrawer = () => setIsOpen((prev) => !prev);
  const handleLinkClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    // Handle click outside to close profile dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prev) => !prev);
  };

  const handleAccountDeleted = () => {
    setSession(null);
    onDeleteModalClose();
    navigate("/");
  };

  return (
    <>
      {/* Fixed Header with Navigation + Ticker - Dark Theme */}
      <header className="fixed w-full z-[999] top-0">
        {/* Main Navigation Bar - BLACK Background (NOW ON TOP) */}
        <nav className="flex w-full items-center justify-between bg-black px-4 py-3 border-b border-white/10">
          {/* Left: Brand Lockup */}
          <Link to="/" className="flex items-center gap-3">
            {/* Hushh Logo Image in Circle */}
            <div 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 shrink-0 cursor-pointer overflow-hidden"
              onClick={(e) => {
                e.preventDefault();
                handleSecretGesture();
              }}
              title="Tap 5 times quickly to enable Developer Mode"
            >
              <Image 
                src={hushhLogo} 
                alt="Hushh Logo" 
                className="w-7 h-7 object-contain"
              />
            </div>
            {/* Brand Text - Stacked Layout */}
            <h1 className="text-white text-[19px] font-extrabold leading-tight tracking-tight font-display">
              Hushh <br/>
              <span className="font-semibold text-white/80 text-sm">Technologies</span>
            </h1>
          </Link>

          {/* Right: Utilities */}
          <div className="flex items-center gap-3">
            {/* Language Selector - Dark Theme */}
            <LanguageSwitcher variant="dark" />
            
            {/* Hamburger Menu - Blue Accent */}
            <button
              onClick={toggleDrawer}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2b8cee] text-white active:scale-95 transition-transform shadow-[0_4px_12px_rgba(43,140,238,0.3)]"
              aria-label="Toggle menu"
            >
              <FiMenu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Chip-based Ticker Strip - BELOW Navigation (No Watchlist Label) */}
        <section className="relative w-full bg-black py-2.5 border-b border-white/5">
          {/* Ticker Marquee with Fade Mask */}
          <div className="ticker-mask relative flex w-full overflow-hidden">
            <div className="ticker-track flex items-center gap-3 px-4">
              {/* First set of tickers */}
              {displayQuotes.map((quote, idx) => (
                <TickerChip 
                  key={`first-${quote.symbol}-${idx}`} 
                  quote={quote} 
                  isLoading={quotesLoading && quotes.length === 0}
                />
              ))}
              {/* Duplicate for seamless loop */}
              {displayQuotes.map((quote, idx) => (
                <TickerChip 
                  key={`second-${quote.symbol}-${idx}`} 
                  quote={quote}
                  isLoading={quotesLoading && quotes.length === 0}
                />
              ))}
            </div>
          </div>

          {/* Live Indicator - Small dot on right */}
          {lastUpdated && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[9px] font-medium text-gray-500">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </section>
      </header>

      {/* Spacer for fixed header (ticker ~48px + nav ~64px = 112px) */}
      <div className="h-28" />

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[1000]"
          style={{ background: "rgba(11, 17, 32, 0.30)" }}
          onClick={toggleDrawer}
        >
          <div
            ref={drawerRef}
            className="fixed top-0 left-0 h-full bg-white"
            style={{ width: "min(88vw, 360px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full px-6 pt-5 pb-4">
              <div className="flex items-center justify-between h-14">
                <button
                  onClick={toggleDrawer}
                  className="w-11 h-11 flex items-center justify-center text-[#0B1120] focus:outline-none"
                >
                  <FiX size={22} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-3">
                  {[
                    { path: "/", label: t('nav.home') },
                    { path: "/about/leadership", label: t('nav.ourPhilosophy') },
                    { path: "/discover-fund-a", label: t('nav.fundA') },
                    { path: "/community", label: t('nav.community') },
                    { path: "/a2a-playground", label: t('nav.kycStudio') },
                  ].map(({ path, label }) => {
                    const active = isActive(path);
                    return (
                      <button
                        key={path}
                        onClick={() => handleLinkClick(path)}
                        className="relative w-full text-left"
                      >
                        <div className="flex items-center h-14 text-[22px] leading-[1.2] text-[#0B1120] font-medium active:bg-[rgba(0,169,224,0.06)] transition-colors duration-150 px-0">
                          {active && (
                            <span className="absolute left-[-12px] h-[18px] w-[2px] bg-[#135bec] rounded-full top-1/2 -translate-y-1/2" />
                          )}
                          <span className={active ? "font-semibold text-[#135bec]" : ""}>{label}</span>
                        </div>
                      </button>
                    );
                  })}

                  <div className="my-4 h-px bg-[#E5E7EB]" />

                  {[
                    { path: "/contact", label: t('nav.contact') },
                    { path: "/faq", label: t('nav.faq') },
                  ].map(({ path, label }) => {
                    const active = isActive(path);
                    return (
                      <button
                        key={path}
                        onClick={() => handleLinkClick(path)}
                        className="relative w-full text-left"
                      >
                        <div className="flex items-center h-14 text-[22px] leading-[1.2] text-[#0B1120] font-medium active:bg-[rgba(0,169,224,0.06)] transition-colors duration-150 px-0">
                          {active && (
                            <span className="absolute left-[-12px] h-[18px] w-[2px] bg-[#135bec] rounded-full top-1/2 -translate-y-1/2" />
                          )}
                          <span className={active ? "font-semibold text-[#135bec]" : ""}>{label}</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Career Dropdown */}
                  <div className="relative w-full text-left">
                    <button
                      onClick={() => setMobileCareerDropdownOpen(!mobileCareerDropdownOpen)}
                      className="flex items-center h-14 text-[22px] leading-[1.2] text-[#0B1120] font-medium active:bg-[rgba(0,169,224,0.06)] transition-colors duration-150 w-full text-left"
                    >
                      <span className={(isActive("/career") || isActive("/benefits")) ? "font-semibold text-[#135bec]" : ""}>
                        {t('nav.joinUs')}
                      </span>
                      <FiChevronDown
                        className={`ml-2 text-[#6B7280] transition-transform duration-200 ${
                          mobileCareerDropdownOpen ? "rotate-180" : ""
                        }`}
                        size={18}
                      />
                    </button>
                    <div
                      className={`pl-4 transition-all duration-200 overflow-hidden ${
                        mobileCareerDropdownOpen ? "max-h-28 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="border-t border-[#E5E7EB] pt-3 space-y-2">
                        {[
                          { path: "/career", label: t('nav.careers') },
                          { path: "/benefits", label: t('nav.benefits') },
                        ].map(({ path, label }) => {
                          const active = isActive(path);
                          return (
                            <button
                              key={path}
                              onClick={() => handleLinkClick(path)}
                              className="w-full text-left"
                            >
                              <div className="flex items-center h-12 text-[18px] text-[#475569] font-medium active:bg-[rgba(0,169,224,0.06)] rounded-md px-1">
                                <span className={active ? "font-semibold text-[#135bec]" : ""}>{label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <>
                      <div className="my-4 h-px bg-[#E5E7EB]" />
                      <button
                        onClick={() => handleLinkClick("/hushh-user-profile")}
                        className="w-full text-left"
                      >
                        <div className="flex items-center h-14 text-[22px] leading-[1.2] text-[#0B1120] font-medium active:bg-[rgba(0,169,224,0.06)] transition-colors duration-150 px-0">
                          <FiUser className="mr-3" />
                          {t('nav.viewProfile')}
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onDeleteModalOpen();
                        }}
                        className="w-full text-left"
                      >
                        <div className="flex items-center h-14 text-[22px] leading-[1.2] text-red-600 font-medium active:bg-red-50 transition-colors duration-150 px-0">
                          <FiTrash2 className="mr-3" />
                          {t('nav.deleteAccount')}
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="mt-4 -mx-6 px-6 pt-3 pb-4 bg-white sticky bottom-0">
                <div className="relative h-px w-full bg-[#E5E7EB] mb-4">
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 bg-[#135bec]"
                  />
                </div>
                {!isAuthenticated ? (
                  <button
                    onClick={() => handleLinkClick("/Login")}
                    className="w-full h-[54px] rounded-full text-[17px] font-semibold tracking-[0.01em] text-white bg-[#135bec] shadow-lg shadow-[#135bec]/30 transition-transform duration-150 active:scale-[0.985]"
                  >
                    {t('nav.login')}
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full h-[54px] rounded-full text-[17px] font-semibold tracking-[0.01em] text-[#0B1120] border border-[#E5E7EB] bg-white transition-colors duration-150 active:bg-[#F9FAFB]"
                  >
                    {t('nav.logout')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={onDeleteModalClose}
        onAccountDeleted={handleAccountDeleted}
      />

      {/* Chip-based Ticker Styles */}
      <style>{`
        /* Ticker mask for fade edges */
        .ticker-mask {
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        
        /* Ticker animation */
        .ticker-track {
          display: flex;
          animation: ticker-scroll 40s linear infinite;
          width: max-content;
        }
        
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        /* Pause animation on hover */
        .ticker-mask:hover .ticker-track {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}
