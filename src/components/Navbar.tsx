import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiChevronDown, FiUser, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import config from "../resources/config/config";
import { Image, useToast, Avatar, useBreakpointValue, useDisclosure } from "@chakra-ui/react";
import hushhLogo from "../components/images/Hushhogo.png";
import LanguageSwitcher from "./LanguageSwitcher";
import DeleteAccountModal from "./DeleteAccountModal";
import { handleSecretGesture } from "../utils/mobileDevConsole";

export default function Navbar() {
  const { t } = useTranslation();
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
      setSession(null); // Ensure session is set to null after logout
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
    <nav className="bg-white shadow-lg fixed w-full z-[999]" style={{ top: "38px" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl flex flex-row items-center font-bold">
          <Image 
            src={hushhLogo} 
            alt="Hushh Logo" 
            className="w-12 h-12"
            onClick={(e) => {
              e.preventDefault();
              handleSecretGesture();
            }}
            cursor="pointer"
            title="Tap 5 times quickly to enable Developer Mode"
          />
            <p className="text-xl font-[500] blue-gradient-text">Hushh Technologies</p>
          </Link>

          {/* Mobile: Language Switcher + Hamburger Menu */}
          <div className="lg:hidden flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={toggleDrawer}
              className="text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <FiMenu size={24} />
            </button>
          </div>
{/* For Desktop View */}
          <div className="hidden lg:flex items-center space-x-6">
            {[
              { path: "/about/leadership", label: t('nav.ourPhilosophy') },
              { path: "/discover-fund-a", label: t('nav.fundA') },
              { path: "/community", label: t('nav.community') },
              { path: "/faq", label: t('nav.faq') },
              { path: "/contact", label: t('nav.contact') },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-3 py-2 rounded ${
                  isActive(path)
                    ? " font-[500] text-[#0AADBC]"
                    : "text-black-700 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            ))}
            
            {/* Career Dropdown with hover functionality */}
            <div 
              className="relative group" 
              onMouseEnter={() => setCareerDropdownOpen(true)}
              onMouseLeave={() => setCareerDropdownOpen(false)}
            >
              <button 
                className={`px-3 py-2 rounded flex items-center ${
                  isActive("/career") || isActive("/benefits")
                    ? "font-[500] text-[#0AADBC]"
                    : "text-black-700 hover:text-gray-900"
                }`}
              >
                {t('nav.joinUs')} <FiChevronDown className="ml-1" />
              </button>
              
              <div 
                className={`absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg py-1 z-10 transition-opacity duration-300 ${
                  careerDropdownOpen ? "opacity-100" : "opacity-0 invisible"
                }`}
                style={{ top: "100%", paddingTop: "10px" }}
              >
                <div className="pt-2"> {/* Added padding to create space between trigger and content */}
                  <Link
                    to="/career"
                    className={`block px-4 py-2 text-sm ${
                      isActive("/career") ? "font-[500] text-[#0AADBC]" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {t('nav.careers')}
                  </Link>
                  <Link
                    to="/benefits"
                    className={`block px-4 py-2 text-sm ${
                      isActive("/benefits") ? "font-[500] text-[#0AADBC]" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {t('nav.benefits')}
                  </Link>
                </div>
              </div>
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {!isAuthenticated ? (
              <button
                onClick={() => navigate("/Login")}
                className="bg-black text-white px-4 py-2 rounded"
              >
                {t('nav.login')}
              </button>
            ) : (
              <>
                <button
                  onClick={handleLogout}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  {t('nav.logout')}
                </button>
                {/* User Profile Dropdown */}
                <div 
                  className="relative"
                  ref={profileDropdownRef}
                >
                  <button 
                    onClick={toggleProfileDropdown}
                    className="flex items-center focus:outline-none"
                  >
                    <Avatar
                      src={session?.user?.user_metadata?.avatar_url || undefined}
                      name={session?.user?.email || session?.user?.user_metadata?.full_name || ""}
                      className="w-8 h-8 rounded-full cursor-pointer"
                    />
                  </button>
                  
                  <div 
                    className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 transition-opacity duration-300 ${
                      profileDropdownOpen ? "opacity-100" : "opacity-0 invisible"
                    }`}
                  >
                    <Link
                      to="/hushh-user-profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <div className="flex items-center">
                        <FiUser className="mr-2" />
                        {t('nav.viewProfile')}
                      </div>
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onDeleteModalOpen();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <div className="flex items-center">
                        <FiTrash2 className="mr-2" />
                        {t('nav.deleteAccount')}
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
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
                        <div className="flex items-center h-14 text-[22px] leading-[1.2] text-[#0B1120] font-[500] active:bg-[rgba(0,169,224,0.06)] transition-colors duration-150 px-0">
                          {active && (
                            <span className="absolute left-[-12px] h-[18px] w-[2px] bg-[#00A9E0] rounded-full top-1/2 -translate-y-1/2" />
                          )}
                          <span className={active ? "font-[500]" : ""}>{label}</span>
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
                        <div className="flex items-center h-14 text-[22px] leading-[1.2] text-[#0B1120] font-[500] active:bg-[rgba(0,169,224,0.06)] transition-colors duration-150 px-0">
                          {active && (
                            <span className="absolute left-[-12px] h-[18px] w-[2px] bg-[#00A9E0] rounded-full top-1/2 -translate-y-1/2" />
                          )}
                          <span className={active ? "font-[500]" : ""}>{label}</span>
                        </div>
                      </button>
                    );
                  })}

                  <div className="relative w-full text-left">
                    <button
                      onClick={() => setMobileCareerDropdownOpen(!mobileCareerDropdownOpen)}
                      className="flex items-center h-14 text-[22px] leading-[1.2] text-[#0B1120] font-[500] active:bg-[rgba(0,169,224,0.06)] transition-colors duration-150 w-full text-left"
                    >
                      <span className={(isActive("/career") || isActive("/benefits")) ? "font-[500]" : ""}>
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
                              <div className="flex items-center h-12 text-[18px] text-[#475569] font-[500] active:bg-[rgba(0,169,224,0.06)] rounded-md px-1">
                                <span className={active ? "font-[500] text-[#0B1120]" : ""}>{label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <button
                      onClick={() => handleLinkClick("/user-registration")}
                      className="w-full text-left"
                    >
                      <div className="flex items-center h-14 text-[22px] leading-[1.2] text-[#0B1120] font-[500] active:bg-[rgba(0,169,224,0.06)] transition-colors duration-150 px-0">
                        <FiUser className="mr-2" />
                        Edit Profile
                      </div>
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 -mx-6 px-6 pt-3 pb-4 bg-white sticky bottom-0">
                <div className="relative h-px w-full bg-[#E5E7EB] mb-4">
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 bg-[#00A9E0]"
                  />
                </div>
                {!isAuthenticated ? (
                  <button
                    onClick={() => handleLinkClick("/Login")}
                    className="w-full h-[54px] rounded-[16px] text-[17px] font-semibold tracking-[0.01em] text-[#0B1120] transition-[transform,filter] duration-150 active:scale-[0.985] active:brightness-[0.94] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00A9E0] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    style={{ background: "linear-gradient(to right, #00A9E0, #6DD3EF)", fontWeight: 500 }}
                  >
                    {t('nav.login')}
                  </button>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full h-[54px] rounded-[16px] text-[17px] font-semibold tracking-[0.01em] text-[#0B1120] border border-[#E5E7EB] bg-white transition-colors duration-150 active:bg-[#F9FAFB]"
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
    </nav>
  );
}
