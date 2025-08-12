import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import SessionCard from '../components/sessions/SessionCard';
import { discoverSessions } from '../utils/api';
import { loginWithGitHub, loginWithGoogle, getUserInfo } from '../utils/auth';
import CliAuthModal from '../components/auth/CliAuthModal';

export default function Discover() {
  const { isAuthenticated, loading, user, login } = useAuth();
  const router = useRouter();
  const [sortBy, setSortBy] = useState('popular'); // popular, newest, views
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCliModal, setShowCliModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextToken, setNextToken] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Local input state for immediate UI updates
  const processedTokenRef = useRef(false);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Handle OAuth token from URL parameter
  useEffect(() => {
    const { token } = router.query;
    
    if (token && typeof token === 'string' && !processedTokenRef.current) {
      processedTokenRef.current = true;
      
      // Store the token in localStorage
      localStorage.setItem('auth_token', token);
      
      // Update auth context
      try {
        // Use the centralized getUserInfo function to get user data from token
        const userInfo = getUserInfo();
        if (userInfo) {
          login(userInfo);
        }

        // Check if this is a CLI auth flow by checking sessionStorage
        const isCliMode = typeof window !== 'undefined' &&
          sessionStorage.getItem('oauth_cli_mode') === 'true';
        
        if (isCliMode) {
          // Clear the stored CLI mode flag and set flag to show CLI modal
          sessionStorage.removeItem('oauth_cli_mode');
          sessionStorage.setItem('show_cli_modal', 'true');
        }
        
        // Clean up URL by removing token parameter
        router.replace('/discover', undefined, { shallow: true });
      } catch (error) {
        console.error('Failed to decode JWT token:', error);
        // Clear invalid token from localStorage
        localStorage.removeItem('auth_token');
        // Clean up URL by removing token parameter
        router.replace('/discover', undefined, { shallow: true });
      }
    }
  }, [router.query.token, login, router]);

  // Fetch sessions from API - resets to page 1 when search/sort changes
  useEffect(() => {
    // Don't fetch if we're still loading auth state
    if (loading) return;
    
    const fetchSessions = async () => {
      try {
        setSessionsLoading(true);
        setError(null);
        setNextToken(null);
        setHasMore(true);
        
        // Always fetch public sessions for discover page
        const response = await discoverSessions({
          sortBy,
          search: searchQuery,
          nextToken: null,
          limit: 20
        });
        
        
        const newSessions = response.sessions || [];
        setSessions(newSessions);
        setNextToken(response.nextToken || null);
        setHasMore(response.hasMore === true);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions');
        // Fallback to empty array if API fails
        setSessions([]);
        setHasMore(false);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, [sortBy, searchQuery, loading]);

  // Load more sessions function
  const loadMoreSessions = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      
      const response = await discoverSessions({
        sortBy,
        search: searchQuery,
        nextToken,
        limit: 20
      });
      
      
      const newSessions = response.sessions || [];
      
      if (newSessions.length > 0) {
        setSessions(prevSessions => [...prevSessions, ...newSessions]);
        setNextToken(response.nextToken || null);
        setHasMore(response.hasMore === true);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more sessions:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loadingMore && !sessionsLoading) {
          loadMoreSessions();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, sessionsLoading, nextToken, sortBy, searchQuery]);

  // Debounce search input - wait 500ms after user stops typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Handle CLI mode detection for /discover?cli=true redirects
  useEffect(() => {
    const { cli } = router.query;
    if (cli === 'true' && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [router.query.cli, isAuthenticated]);

  // Check if CLI modal should be shown (for CLI users redirected here)
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user just completed CLI auth flow
      const shouldShowCliModal = typeof window !== 'undefined' && 
        sessionStorage.getItem('show_cli_modal') === 'true';
      
      if (shouldShowCliModal) {
        sessionStorage.removeItem('show_cli_modal');
        setShowCliModal(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Immediately trigger search when form is submitted (e.g., Enter key pressed)
    setSearchQuery(searchInput);
  };

  return (
    <>
      <Head>
        <title>Discover Sessions - SessionBase</title>
        <meta name="description" content="Discover and explore AI chat sessions from the community. Browse conversations with Claude, GPT-4, and other AI models." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <Header />

        {/* Search Section */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search sessions by title, summary, or tags..."
                value={searchInput}
                onChange={handleSearch}
                className="w-full px-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white/90 dark:bg-slate-700/90 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 backdrop-blur-sm transition-all duration-200"
              />
              <svg
                className="absolute right-4 top-4.5 h-6 w-6 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="w-full">


            {/* Session Cards */}
            <div className="space-y-6">
              {sessionsLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm animate-pulse">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                      </div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                      <div className="flex gap-2 mb-4">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : sessions.length === 0 ? (
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchQuery ? `No sessions found for "${searchQuery}".` : 'No sessions found.'}
                  </p>
                  {searchQuery && (
                    <button 
                      onClick={() => {setSearchInput(''); setSearchQuery('');}} 
                      className="mt-2 text-primary hover:text-primary-hover underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {sessions.map((session) => (
                    <SessionCard
                      key={session.sessionId || session.id}
                      session={session}
                      onAuthRequired={handleAuthRequired}
                    />
                  ))}
                  
                  {/* Loading More Indicator */}
                  {loadingMore && (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-gray-600 dark:text-gray-300">Loading more sessions...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Load More Button */}
                  {hasMore && !loadingMore && (
                    <div className="text-center py-4">
                      <button
                        onClick={loadMoreSessions}
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                      >
                        Load More Sessions
                      </button>
                    </div>
                  )}
                  
                  {/* Infinite Scroll Trigger */}
                  {hasMore && !loadingMore && (
                    <div ref={loadMoreRef} className="h-4"></div>
                  )}
                  
                  {/* End of Results Message */}
                  {!hasMore && sessions.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        You've reached the end of the results
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/10 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-10 max-w-lg w-full mx-4 shadow-2xl relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  Join SessionBase
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      // Store CLI parameter in sessionStorage to survive OAuth redirect
                      if (router.query.cli === 'true' && typeof window !== 'undefined') {
                        sessionStorage.setItem('oauth_cli_mode', 'true');
                      }
                      loginWithGitHub();
                      setShowAuthModal(false);
                    }}
                    className="flex items-center justify-center w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Sign in with GitHub
                  </button>
                  <button
                    onClick={() => {
                      // Store CLI parameter in sessionStorage to survive OAuth redirect
                      if (router.query.cli === 'true' && typeof window !== 'undefined') {
                        sessionStorage.setItem('oauth_cli_mode', 'true');
                      }
                      loginWithGoogle();
                      setShowAuthModal(false);
                    }}
                    className="flex items-center justify-center w-full px-6 py-4 border border-gray-300 dark:border-gray-600 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="text-primary hover:text-primary-hover underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-primary hover:text-primary-hover underline">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CLI Auth Modal */}
        <CliAuthModal
          isOpen={showCliModal}
          onClose={() => setShowCliModal(false)}
          user={user}
        />
      </div>
    </>
  );
}