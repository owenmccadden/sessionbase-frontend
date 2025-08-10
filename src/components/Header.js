import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Monitor } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from './auth/LoginButton';
import UserProfile from './auth/UserProfile';
import ThemeToggle from './ThemeToggle';

export default function Header({ showMobileBanner = false }) {
  const { isAuthenticated, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      
      if (showMobileBanner && isMobileDevice) {
        const dismissed = localStorage.getItem('mobile-session-banner-dismissed');
        setBannerVisible(!dismissed);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, [showMobileBanner]);

  const handleDismissBanner = () => {
    setBannerVisible(false);
    localStorage.setItem('mobile-session-banner-dismissed', 'true');
  };

  if (isMobile) {
    return (
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 dark:bg-slate-900/95 dark:border-slate-800 shadow-sm">
        {/* Mobile Session Banner */}
        {bannerVisible && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 dark:bg-amber-900/20 dark:border-amber-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Monitor className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-200 truncate">
                  Optimized for desktop viewing
                </p>
              </div>
              <button
                onClick={handleDismissBanner}
                className="ml-2 p-1 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded flex-shrink-0"
                aria-label="Dismiss banner"
              >
                <X className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              </button>
            </div>
          </div>
        )}
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            {/* Hamburger Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Logo - Centered and Larger */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="flex items-center">
                <img
                  src="/sessionbase-logo.png"
                  alt="SessionBase"
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Empty div for balance */}
            <div className="w-9"></div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMenuOpen && (
            <div className="pb-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <nav className="flex flex-col space-y-2 pt-4">
                <Link 
                  href="/discover" 
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Discover
                </Link>
                {isAuthenticated && (
                  <Link 
                    href="/sessions" 
                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Sessions
                  </Link>
                )}
                <Link 
                  href="/teams" 
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Teams
                </Link>
                <a 
                  href="https://docs.sessionbase.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Docs
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200 sticky top-0 z-50 dark:supports-[backdrop-filter]:bg-slate-900/70 dark:bg-slate-900/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/sessionbase-logo.png"
                alt="SessionBase"
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/discover" className="text-slate-700 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:text-white">
              Discover
            </Link>
            {isAuthenticated && (
              <Link href="/sessions" className="text-slate-700 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:text-white">
                My Sessions
              </Link>
            )}
            <Link href="/teams" className="text-slate-700 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:text-white">
              Teams
            </Link>
            <a href="https://docs.sessionbase.ai" target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900 font-medium dark:text-slate-300 dark:hover:text-white">
              Docs
            </a>
          </nav>

          {/* Authentication */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {loading ? (
              <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse dark:bg-slate-700"></div>
            ) : isAuthenticated ? (
              <UserProfile />
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
