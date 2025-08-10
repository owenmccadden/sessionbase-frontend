import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
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

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <Header />

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <main className="w-full">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Sessions
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {sessionsLoading ? 'Loading...' : `${sessions.length} sessions`}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg dark:bg-primary-light/10 dark:border-primary-light/20">
              <div>
                <h3 className="text-sm font-medium text-primary-dark dark:text-primary-light">Want to upload a new session?</h3>
                <p className="text-sm text-primary-dark dark:text-primary-light mt-1">
                  Use our CLI tool to automatically upload your AI chat sessions from your terminal.
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/settings"
                  className="inline-flex items-center px-3 py-2 border border-primary/30 text-sm font-medium rounded-md text-primary-dark dark:text-primary-light bg-white dark:bg-slate-700 hover:bg-primary/10 dark:hover:bg-primary-light/20 transition-colors"
                >
                  Setup CLI
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover transition-colors"
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
                    <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
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
                <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    You haven't uploaded any sessions yet. Start by uploading your first AI conversation.
                  </p>
                  <div className="space-y-3">
                    <Link
                      href="/upload"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover transition-colors"
                    >
                      Upload Your First Session
                    </Link>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      or{' '}
                      <Link href="/settings" className="text-primary hover:text-primary-hover underline">
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