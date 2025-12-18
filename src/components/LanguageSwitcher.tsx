import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    const selectedLang = languages.find((lang) => lang.code === langCode);
    
    // Change language
    i18n.changeLanguage(langCode);
    
    // Update document direction for RTL support
    if (selectedLang) {
      document.documentElement.dir = selectedLang.dir;
      document.documentElement.lang = langCode;
      
      // Store preference in localStorage
      localStorage.setItem('i18nextLng', langCode);
    }
    
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set initial direction based on stored language
  useEffect(() => {
    const storedLang = localStorage.getItem('i18nextLng');
    if (storedLang) {
      const lang = languages.find((l) => l.code === storedLang);
      if (lang) {
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = storedLang;
      }
    }
  }, []);

  return (
    <div dir="ltr" className="relative" ref={dropdownRef} style={{ isolation: 'isolate' }}>
      {/* Toggle Button - Rounded oval pill design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f1f4f0] hover:bg-[#e5e8e4] transition-colors duration-200 text-[#131811]"
        aria-label="Select Language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <FiGlobe className="w-5 h-5" />
        <FiChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu - positioned to stay within viewport */}
      {isOpen && (
        <div 
          className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[1000]"
          style={{
            right: 'auto',
            left: '50%',
            transform: 'translateX(calc(-100% + 20px))',
          }}
          role="listbox"
          aria-label="Language options"
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                currentLanguage.code === language.code
                  ? 'bg-[#0AADBC]/10 text-[#0AADBC] font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="option"
              aria-selected={currentLanguage.code === language.code}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="flex-1 text-left">{language.nativeName}</span>
              {currentLanguage.code === language.code && (
                <svg 
                  className="w-4 h-4 text-[#0AADBC]" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
