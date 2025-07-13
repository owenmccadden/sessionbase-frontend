import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from '../components/auth/LoginButton';
import UserProfile from '../components/auth/UserProfile';
import { loginWithGitHub, loginWithGoogle } from '../utils/auth';

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

export default function Landing() {
  const { isAuthenticated, loading, login } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const processedTokenRef = useRef(false);

  // Handle OAuth token from URL parameter
  useEffect(() => {
    const { token } = router.query;
    
    if (token && typeof token === 'string' && !processedTokenRef.current) {
      processedTokenRef.current = true;
      
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

        // Check if this is a CLI auth flow by checking sessionStorage
        const isCliMode = typeof window !== 'undefined' &&
          sessionStorage.getItem('oauth_cli_mode') === 'true';
        
        if (isCliMode) {
          // Clear the stored CLI mode flag and set flag for discover page
          sessionStorage.removeItem('oauth_cli_mode');
          sessionStorage.setItem('show_cli_modal', 'true');
          // Redirect CLI users to discover page to show them what sessions look like
          router.replace('/discover');
        } else {
          // Regular auth flow - redirect to sessions page
          router.replace('/sessions');
        }
      } catch (error) {
        console.error('Failed to decode JWT token:', error);
        // Clear invalid token from localStorage
        localStorage.removeItem('auth_token');
        // Clean up URL by removing token parameter and stay on landing page
        router.replace('/', undefined, { shallow: true });
      }
    }
  }, [router.query.token, login, router]);

  // Handle CLI mode detection for /login?cli=true redirects
  useEffect(() => {
    const { cli } = router.query;
    if (cli === 'true' && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [router.query.cli, isAuthenticated]);

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
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-gray-900">SessionBase</Link>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/discover" className="text-gray-700 hover:text-gray-900 font-medium">
                  Discover
                </Link>
                {isAuthenticated && (
                  <Link href="/sessions" className="text-gray-700 hover:text-gray-900 font-medium">
                    My Sessions
                  </Link>
                )}
                <Link href="/teams" className="text-gray-500 hover:text-gray-700">
                  Teams
                </Link>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
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

        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Share and discover</span>{' '}
                    <span className="block text-blue-600 xl:inline">AI chat sessions</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Learn from conversations with Claude, GPT-4, and other AI models. 
                    Share your best prompts and discover solutions from the community.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/discover"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                      >
                        Browse Sessions
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <button
                        onClick={() => setShowAuthModal(true)}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                      >
                        Get Started
                      </button>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-56 w-full bg-gradient-to-r from-blue-400 to-blue-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
              <div className="text-white text-6xl">💬</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to share AI conversations
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Discover Sessions</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Browse and search through community-shared AI conversations by topic, model, or keywords.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-2xl">📤</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Share Your Sessions</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Upload and share your best AI conversations with automatic formatting and syntax highlighting.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-2xl">🏷️</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Organize with Tags</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Tag your sessions by programming language, topic, or use case for easy discovery.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                    <span className="text-2xl">👥</span>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Team Collaboration</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">
                    Work together with your team on private sessions and build shared knowledge bases.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

      </div>
    </>
  );
}