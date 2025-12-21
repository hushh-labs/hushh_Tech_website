import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiCheck, FiChevronDown } from 'react-icons/fi';

const languages = [
  { code: 'en', name: 'English', shortCode: 'EN' },
  { code: 'zh', name: '中文', shortCode: 'ZH' },
  { code: 'ar', name: 'العربية', shortCode: 'AR' },
  { code: 'fr', name: 'Français', shortCode: 'FR' },
];

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'light' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current language short code
  const currentLang = languages.find(l => l.code === i18n.language)?.shortCode || 'EN';

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    
    // Update document direction for RTL languages
    if (langCode === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', langCode);
    }
    
    setIsOpen(false);
  };

  // Dark variant styles (for dark header)
  const isDark = variant === 'dark';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Selector Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex h-9 items-center gap-1 px-3 py-1.5 rounded-full transition-colors ${
          isDark 
            ? 'bg-gray-800 active:bg-gray-700 border border-gray-700' 
            : 'bg-gray-100 hover:bg-gray-200 border border-transparent dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700'
        }`}
        aria-label="Select language"
      >
        <FiGlobe className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`} />
        <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'}`}>
          {currentLang}
        </span>
        <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-500'}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-[200]">
          {languages.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-sm transition-colors
                  ${isSelected 
                    ? 'bg-[#135bec]/5 text-[#135bec] font-semibold' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span>{lang.name}</span>
                {isSelected && (
                  <FiCheck className="w-4 h-4 text-[#135bec]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
