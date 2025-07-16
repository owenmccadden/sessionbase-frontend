import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import LoginButton from '../components/auth/LoginButton';
import UserProfile from '../components/auth/UserProfile';
import SessionCard from '../components/sessions/SessionCard';
import { getUserSessions } from '../utils/api';

export default function MySessions() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  // Fetch user's sessions from API
  useEffect(() => {
    if (!isAuthenticated || loading) return;
    
    const fetchSessions = async () => {
      try {
        setSessionsLoading(true);
        setError(null);
        
        const response = await getUserSessions({
          page: 1,
          limit: 50
        });
        
        setSessions(response.sessions || []);
      } catch (err) {
        console.error('Error fetching user sessions:', err);
        setError('Failed to load your sessions');
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchSessions();
  }, [isAuthenticated, loading]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>My Sessions - SessionBase</title>
        <meta name="description" content="Manage your AI chat sessions and conversations." />
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
                <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
                  <img
                    src="/sessionbase-logo.png"
                    alt="SessionBase Logo"
                    className="w-10 h-10"
                  />
                  <span>SessionBase</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link href="/discover" className="text-gray-700 hover:text-gray-900 font-medium">
                  Discover
                </Link>
                <Link href="/sessions" className="text-blue-600 hover:text-blue-800 font-medium border-b-2 border-blue-600">
                  My Sessions
                </Link>
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
                <UserProfile />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="w-full">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                My Sessions
              </h1>
              <p className="text-gray-600 mt-1">
                {sessionsLoading ? 'Loading...' : `${sessions.length} sessions`}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-blue-900">Want to upload a new session?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Use our CLI tool to automatically upload your AI chat sessions from your terminal.
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/settings"
                  className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
                >
                  Setup CLI
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload Session
                </Link>
              </div>
            </div>

            {/* Session Cards */}
            <div className="space-y-4">
              {sessionsLoading ? (
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
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven't uploaded any sessions yet. Start by uploading your first AI conversation.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Upload Your First Session
                    </Link>
                    <div className="text-sm text-gray-500">
                      or{' '}
                      <Link href="/settings" className="text-blue-600 hover:text-blue-800 underline">
                        set up the CLI tool
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                sessions.map((session) => (
                  <SessionCard
                    key={session.sessionId || session.id}
                    session={session}
                    showActions={true} // Show edit/delete actions for user's own sessions
                  />
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}