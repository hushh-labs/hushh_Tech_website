import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiChevronDown, FiUser, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import config from "../resources/config/config";
import { Image, useToast, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import hushhLogo from "../components/images/Hushhogo.png";
import LanguageSwitcher from "./LanguageSwitcher";
import DeleteAccountModal from "./DeleteAccountModal";

// Marquee tickers data
const marqueeTickers = [
  { label: "Saudi Aramco", logo: "https://www.nicepng.com/png/full/274-2744280_saudi-aramco-logo-saudi-aramco-logo-vector.png" },
  { label: "GOOG", logo: "https://thumbs.dreamstime.com/b/google-logo-vector-format-white-background-illustration-407571048.jpg" },
  { label: "AAPL", logo: "https://fabrikbrands.com/wp-content/uploads/Apple-Logo-History-1-1155x770.png" },
  { label: "MSFT", logo: "https://static.vecteezy.com/system/resources/previews/027/127/473/non_2x/microsoft-logo-microsoft-icon-transparent-free-png.png" },
  { label: "NVDA", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVEu8tfOJpA-vMjPqyI2gEyaDjTaI7tSJFzQ&s" },
  { label: "AMZN", logo: "https://static.vecteezy.com/system/resources/previews/014/018/561/non_2x/amazon-logo-on-transparent-background-free-vector.jpg" },
  { label: "BRK.B", logo: "https://www.shutterstock.com/shutterstock/photos/2378735305/display_1500/stock-vector-brk-letter-logo-design-on-a-white-background-or-monogram-logo-design-for-entrepreneur-and-business-2378735305.jpg" },
  { label: "META", logo: "https://img.freepik.com/premium-vector/meta-company-logo_265339-667.jpg?semt=ais_hybrid&w=740&q=80" },
  { label: "JPM", logo: "https://e7.pngegg.com/pngimages/225/668/png-clipart-jpmorgan-chase-logo-bank-business-morgan-stanley-bank-text-logo.png" },
  { label: "ICBC", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkYKU2DFnDgpOtiG7XP3N9Am69IFfZj5hLTg&s" },
  { label: "China Construction Bank", logo: "https://www.nfcw.com/wp-content/uploads/2021/06/china-construction-bank-logo-400W.jpg" },
  { label: "XOM", logo: "https://static.vecteezy.com/system/resources/previews/009/116/598/non_2x/com-logo-com-letter-com-letter-logo-design-initials-com-logo-linked-with-circle-and-uppercase-monogram-logo-com-typography-for-technology-business-and-real-estate-brand-vector.jpg" },
  { label: "Agricultural Bank of China", logo: "https://static.wikia.nocookie.net/logopedia/images/d/d6/ABC_china_symbol.svg/revision/latest/scale-to-width-down/1200?cb=20240204071833" },
  { label: "TSM", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/63/Tsmc.svg/1200px-Tsmc.svg.png" },
  { label: "Bank of China", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bank_of_China_symbol.svg/2048px-Bank_of_China_symbol.svg.png" },
  { label: "TM", logo: "https://global.toyota/pages/global_toyota/mobility/toyota-brand/emblem_001.jpg" },
  { label: "PetroChina", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Petrochina_logo.svg/250px-Petrochina_logo.svg.png" },
  { label: "WMT", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxwPUD4NGc7WTQVqDstT5ZPRQXm6ka0KTsmTsKfiY&usqp=CAE&s" },
  { label: "TCEHY", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Tencent_Logo.svg" },
  { label: "BAC", logo: "https://www.bankofamerica.com/content/images/ContextualSiteGraphics/Logos/en_US/logos/bac-logo-v2.png" },
];

const marqueePrefix = "Introducing the hushh 27 alpha bets —";

// Render marquee chunk helper (Dark Theme - White Text + White Logo BG)
const renderMarqueeChunk = (key: string) => (
  <span className="marquee-chunk" key={key}>
    <span className="marquee-prefix text-white font-semibold">{marqueePrefix}</span>
    <span className="marquee-body text-white">
      {marqueeTickers.map((ticker, idx) => (
        <React.Fragment key={`${key}-${ticker.label}-${idx}`}>
          <span className="ticker inline-flex items-center gap-1.5">
            {/* White circular background for logos */}
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
              <img
                src={ticker.logo}
                alt={`${ticker.label} logo`}
                className="w-3.5 h-3.5 object-contain"
              />
            </span>
            <span className="text-white font-medium">{ticker.label}</span>
          </span>
          {idx !== marqueeTickers.length - 1 && (
            <span className="ticker-sep text-white/60">,</span>
          )}
        </React.Fragment>
      ))}
    </span>
  </span>
);

// Secret gesture state for dev console activation
let tapCount = 0;
let lastTapTime = 0;

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
      {/* Fixed Header with Marquee + Navigation - Dark Theme */}
      <header className="fixed w-full z-[999] top-0">
        {/* Marquee Strip - Stock Ticker Banner (Off-Black Background) */}
        <div className="marquee-container-dark bg-[#0a0a0a] border-b border-white/5">
          <div className="marquee-track-dark">
            {renderMarqueeChunk("first")}
            {renderMarqueeChunk("second")}
          </div>
        </div>

        {/* Main Navigation Bar - BLACK Background */}
        <nav className="flex w-full items-center justify-between bg-black px-4 py-3 border-b border-white/5">
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
      </header>

      {/* Spacer for fixed header (marquee ~32px + nav ~64px = 96px) */}
      <div className="h-24" />

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

      {/* Dark Marquee Styles */}
      <style>{`
        .marquee-container-dark {
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          padding: 8px 0;
        }
        .marquee-track-dark {
          display: inline-flex;
          animation: marquee-scroll-dark 60s linear infinite;
        }
        .marquee-track-dark .marquee-chunk {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding-right: 2rem;
        }
        .marquee-track-dark .marquee-prefix {
          font-weight: 600;
          font-size: 12px;
          margin-right: 0.5rem;
        }
        .marquee-track-dark .marquee-body {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 12px;
          font-weight: 500;
        }
        .marquee-track-dark .ticker {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .marquee-track-dark .ticker-sep {
          margin: 0 4px;
        }
        @keyframes marquee-scroll-dark {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
