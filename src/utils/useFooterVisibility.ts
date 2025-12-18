import { useState, useEffect } from 'react';

/**
 * Custom hook to detect when the main Footer component is visible in viewport.
 * Used to hide fixed onboarding footers when the main site footer comes into view.
 * 
 * @returns boolean - true when the main footer is visible, false otherwise
 */
export function useFooterVisibility(): boolean {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    // Find the main footer element (it has id="main-footer" or class containing "footer")
    const findFooter = (): Element | null => {
      // Try to find footer by ID first
      const footerById = document.getElementById('main-footer');
      if (footerById) return footerById;
      
      // Try to find by tag
      const footerTag = document.querySelector('footer:not([data-onboarding-footer])');
      if (footerTag) return footerTag;
      
      // Try to find by common footer class names
      const footerByClass = document.querySelector('.site-footer, .main-footer, [class*="Footer"]');
      if (footerByClass) return footerByClass;
      
      return null;
    };

    // Delay to ensure footer is rendered
    const setupObserver = () => {
      const footer = findFooter();
      
      if (!footer) {
        // If no footer found, keep the fixed footer visible
        setIsFooterVisible(false);
        return null;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Footer is visible when it's intersecting the viewport
          setIsFooterVisible(entry.isIntersecting);
        },
        {
          root: null, // viewport
          rootMargin: '0px',
          threshold: 0.1, // Trigger when 10% of footer is visible
        }
      );

      observer.observe(footer);
      return observer;
    };

    // Setup observer with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const observer = setupObserver();
      
      // Cleanup
      return () => {
        if (observer) {
          observer.disconnect();
        }
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return isFooterVisible;
}

export default useFooterVisibility;
