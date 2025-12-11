import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Monitor, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from './auth/LoginButton';
import UserProfile from './auth/UserProfile';
import ThemeToggle from './ThemeToggle';

const GITHUB_REPO_URL = 'https://github.com/sessionbase/cli';
const GITHUB_REPO_API_URL = 'https://api.github.com/repos/sessionbase/cli';
const STAR_CACHE_KEY = 'sessionbase-cli-stars';
const STAR_CACHE_TTL = 1000 * 60 * 60 * 6; // 6 hours

export default function Header({ showMobileBanner = false }) {
  const { isAuthenticated, loading, authenticating } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [starCount, setStarCount] = useState(null);

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

  useEffect(() => {
    let isMounted = true;

    const readCachedStars = () => {
      try {
        const cached = localStorage.getItem(STAR_CACHE_KEY);
        if (!cached) return null;
        const parsed = JSON.parse(cached);

        if (
          typeof parsed?.count === 'number' &&
          typeof parsed?.timestamp === 'number'
        ) {
          return parsed;
        }
      } catch (error) {
        console.warn('Unable to read cached GitHub stars', error);
      }

      return null;
    };

    const cachedStars = readCachedStars();
    const cacheIsFresh =
      cachedStars &&
      Date.now() - cachedStars.timestamp < STAR_CACHE_TTL;

    if (cachedStars?.count != null) {
      setStarCount(cachedStars.count);
    }

    const fetchStarCount = async () => {
      try {
        const response = await fetch(GITHUB_REPO_API_URL, {
          headers: { Accept: 'application/vnd.github+json' },
        });

        if (!response.ok) {
          throw new Error(`GitHub responded with ${response.status}`);
        }

        const data = await response.json();
        const count =
          typeof data?.stargazers_count === 'number'
            ? data.stargazers_count
            : null;

        if (count != null && isMounted) {
          setStarCount(count);
          try {
            localStorage.setItem(
              STAR_CACHE_KEY,
              JSON.stringify({ count, timestamp: Date.now() })
            );
          } catch (storageError) {
            console.warn('Unable to cache GitHub stars', storageError);
          }
        }
      } catch (error) {
        console.error('Failed to fetch GitHub star count', error);
      }
    };

    if (!cacheIsFresh) {
      fetchStarCount();
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const GitHubButton = ({ compact = false }) => (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className={`inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm ${
        compact ? 'px-2.5 h-10' : 'px-3 h-10'
      }`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      {!compact && <span className="font-medium text-sm">GitHub</span>}
      {starCount != null && (
        <span className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 ${compact ? 'text-[11px]' : ''}`}>
          <Star className="w-3 h-3 text-amber-500 fill-amber-400" strokeWidth={2} />
          {starCount.toLocaleString()}
        </span>
      )}
    </a>
  );

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

            {/* GitHub Link */}
            <GitHubButton compact />
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
            <GitHubButton />
            <ThemeToggle />
            {loading || authenticating ? (
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
