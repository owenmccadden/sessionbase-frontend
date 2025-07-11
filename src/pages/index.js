import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from '../components/auth/LoginButton';
import UserProfile from '../components/auth/UserProfile';
import SessionCard from '../components/sessions/SessionCard';
import { discoverSessions, getUserSessions } from '../utils/api';
import { loginWithGitHub, loginWithGoogle } from '../utils/auth';
import CliAuthModal from '../components/auth/CliAuthModal';

// Helper function to decode base64url (JWT uses base64url encoding)
function base64UrlDecode(str) {
  // Replace URL-safe characters with standard base64 characters
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  while (str.length % 4) {
    str += '=';
  }
  
  return atob(str);
}

export default function Home() {
  const { isAuthenticated, loading, login, checkAuthStatus } = useAuth();
  const router = useRouter();
  const [sortBy, setSortBy] = useState('popular'); // popular, newest, views
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCliModal, setShowCliModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover'); // discover, my-sessions, teams

  // Handle OAuth token from URL parameter
  useEffect(() => {
    const { token } = router.query;
    
    if (token && typeof token === 'string') {
      // Store the token in localStorage
      localStorage.setItem('auth_token', token);
      
      // Update auth context
      try {
        // Decode JWT to get user info using base64url decoder
        const payload = JSON.parse(base64UrlDecode(token.split('.')[1]));
        const userInfo = {
          id: payload.sub,
          username: payload.username,
          avatarUrl: payload.avatar_url,
          exp: payload.exp
        };
        login(userInfo);
        setUserInfo(userInfo);

        // Check if this is a CLI auth flow by checking sessionStorage
        const isCliMode = typeof window !== 'undefined' &&
          sessionStorage.getItem('oauth_cli_mode') === 'true';
        
        if (isCliMode) {
          // Clear the stored CLI mode flag
          sessionStorage.removeItem('oauth_cli_mode');
          setShowCliModal(true);
          // Clean up URL by removing token parameter
          router.replace('/', undefined, { shallow: true });
        } else {
          // Clean up URL by removing token parameter
          router.replace('/', undefined, { shallow: true });
        }
      } catch (error) {
        console.error('Failed to decode JWT token:', error);
        // Clear invalid token from localStorage
        localStorage.removeItem('auth_token');
        // Clean up URL by removing token parameter
        router.replace('/', undefined, { shallow: true });
      }
    }
  }, [router.query.token, login]);

  // Fetch sessions from API
  useEffect(() => {
    // Don't fetch if we're still loading auth state
    if (loading) return;
    
    const fetchSessions = async () => {
      try {
        setSessionsLoading(true);
        setError(null);
        
        let response;
        if (activeTab === 'my-sessions' && isAuthenticated) {
          response = await getUserSessions({
            page: 1,
            limit: 20
          });
        } else {
          // Default to discover for unauthenticated users and discover tab
          response = await discoverSessions({
            sortBy,
            search: searchQuery,
            page: 1,
            limit: 20
          });
        }
        
        setSessions(response.sessions || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions');
        // Fallback to empty array if API fails
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, [sortBy, searchQuery, activeTab, isAuthenticated, loading]);

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search will trigger automatically due to useEffect dependency on searchQuery
  };

  return (
    <>
      <Head>
        <title>SessionBase - AI Chat Sessions & Prompts</title>
        <meta name="description" content="Discover, share, and learn from AI chat sessions. Browse conversations with Claude, GPT-4, and other AI models." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">SessionBase</h1>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">
                  Sessions
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Tags
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Users
                </a>
              </nav>

              {/* Search */}
              <div className="flex-1 max-w-lg mx-8">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
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

              {/* Auth */}
              <div className="flex items-center space-x-4">
                {loading ? (
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                ) : isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <LoginButton />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main Content */}
          <main className="w-full">
              {/* Tabs for authenticated users */}
              {isAuthenticated && (
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    {[
                      { key: 'discover', label: 'Discover', icon: '🔍' },
                      { key: 'my-sessions', label: 'My Sessions', icon: '📝' },
                      { key: 'teams', label: 'Teams', icon: '👥' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'my-sessions' ? 'My Sessions' : 
                   activeTab === 'teams' ? 'Team Sessions' : 'All Sessions'}
                </h1>
                {activeTab !== 'teams' && (
                  <p className="text-gray-600 mt-1">
                    {sessionsLoading ? 'Loading...' : `${sessions.length} sessions`}
                  </p>
                )}
              </div>

              {/* Sort Options */}
              {activeTab !== 'teams' && (
                <div className="flex items-center space-x-4 mb-6 border-b border-gray-200">
                  {[
                    { key: 'popular', label: 'Most Popular' },
                    { key: 'newest', label: 'Newest' },
                    { key: 'views', label: 'Most Viewed' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSortBy(option.key)}
                      className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                        sortBy === option.key
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Session Cards */}
              <div className="space-y-4">
                {activeTab === 'teams' ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Teams Coming Soon</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      We're working on team features that will allow you to collaborate on sessions with your teammates. 
                      Stay tuned for updates!
                    </p>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-gray-900 mb-2">Get notified when teams launch</h4>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Notify Me
                          </button>
                        </div>
                      </div>
                      <div className="text-left bg-white rounded-lg p-4 border border-blue-200">
                        <h4 className="font-medium text-gray-900 mb-2">Planned Team Features:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Private team sessions</li>
                          <li>• Collaborative session editing</li>
                          <li>• Team knowledge base</li>
                          <li>• Advanced sharing controls</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : sessionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600">{error}</p>
                    <button 
                      onClick={() => window.location.reload()} 
                      className="mt-2 text-red-600 hover:text-red-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">
                      {activeTab === 'my-sessions' ? 'You haven\'t created any sessions yet.' : 'No sessions found.'}
                    </p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <SessionCard
                      key={session.sessionId || session.id}
                      session={session}
                      onAuthRequired={handleAuthRequired}
                    />
                  ))
                )}
              </div>
            </main>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-10 max-w-lg w-full mx-4 shadow-2xl relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Join SessionBase
                </h2>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      loginWithGitHub();
                      setShowAuthModal(false);
                    }}
                    className="flex items-center justify-center w-full px-6 py-4 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
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
                      loginWithGoogle();
                      setShowAuthModal(false);
                    }}
                    className="flex items-center justify-center w-full px-6 py-4 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
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
                <p className="text-xs text-gray-500 mt-6">
                  By continuing, you agree to our{' '}
                  <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CLI Auth Modal */}
        <CliAuthModal
          isOpen={showCliModal}
          onClose={() => {
            setShowCliModal(false);
          }}
          user={userInfo}
        />
      </div>
    </>
  );
}
