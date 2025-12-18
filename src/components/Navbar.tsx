import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiChevronDown, FiUser, FiTrash2, FiGlobe } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import config from "../resources/config/config";
import { useToast, Avatar, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import LanguageSwitcher from "./LanguageSwitcher";
import DeleteAccountModal from "./DeleteAccountModal";

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

  // Get current language code
  const currentLang = i18n.language?.toUpperCase().slice(0, 2) || 'EN';

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
      {/* Header - Mobile First Design matching the HTML template */}
      <header className="sticky top-0 z-50 flex w-full items-center justify-between bg-white px-4 py-3 border-b border-gray-100">
        {/* Left: Brand Lockup */}
        <Link to="/" className="flex items-center gap-2">
          {/* Logo Mark - Fingerprint icon in blue circle */}
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#135bec]/10 text-[#135bec]"
            onClick={(e) => {
              e.preventDefault();
              handleSecretGesture();
            }}
            style={{ cursor: 'pointer' }}
            title="Tap 5 times quickly to enable Developer Mode"
          >
            {/* Fingerprint SVG Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-5 h-5"
            >
              <path fillRule="evenodd" d="M12 3.75a6.715 6.715 0 00-3.722 1.118.75.75 0 11-.828-1.25 8.25 8.25 0 0112.8 6.883c0 3.014-.574 5.897-1.62 8.543a.75.75 0 01-1.395-.551A21.69 21.69 0 0018.75 10.5 6.75 6.75 0 0012 3.75zM6.157 5.739a.75.75 0 01.21 1.04A6.715 6.715 0 005.25 10.5c0 1.613-.463 3.12-1.265 4.393a.75.75 0 01-1.27-.8A6.715 6.715 0 003.75 10.5c0-1.68.503-3.246 1.367-4.55a.75.75 0 011.04-.211zM12 7.5a3 3 0 00-3 3c0 3.1-.508 6.087-1.445 8.87a.75.75 0 11-1.423-.47A21.69 21.69 0 007.5 10.5a4.5 4.5 0 119 0c0 3.14-.574 6.148-1.622 8.916a.75.75 0 01-1.413-.502A20.19 20.19 0 0015 10.5a3 3 0 00-3-3zM12 10.5a.75.75 0 01.75.75c0 3.212-.545 6.297-1.55 9.17a.75.75 0 01-1.4-.54A20.19 20.19 0 0011.25 11.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
            </svg>
          </div>
          {/* Logotype: Brand-forward Primary Color */}
          <h1 className="font-display text-[18px] font-extrabold leading-tight tracking-tight text-[#135bec]">
            Hushh Technologies
          </h1>
        </Link>

        {/* Right: Actions Group */}
        <div className="flex items-center gap-1">
          {/* Language Selector Pill */}
          <LanguageSwitcher />
          
          {/* Hamburger Menu */}
          <button
            onClick={toggleDrawer}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-50 focus:bg-gray-100 active:text-[#135bec]"
            aria-label="Toggle menu"
          >
            <FiMenu className="w-7 h-7" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100]"
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
    </>
  );
}
