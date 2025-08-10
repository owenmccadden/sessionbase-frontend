import { useState, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';

export default function MobileSessionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      
      // Only show banner on mobile if user hasn't dismissed it
      const dismissed = localStorage.getItem('mobile-session-banner-dismissed');
      setIsVisible(isMobileDevice && !dismissed);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('mobile-session-banner-dismissed', 'true');
  };

  if (!isVisible || !isMobile) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 dark:bg-amber-900/20 dark:border-amber-800/50 sticky top-14 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Monitor className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-200 truncate">
            Optimized for desktop viewing
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 p-1 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-3 w-3 text-amber-600 dark:text-amber-400" />
        </button>
      </div>
    </div>
  );
}