import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from '../../components/auth/LoginButton';
import UserProfile from '../../components/auth/UserProfile';
import UnifiedSessionViewer from '../../components/UnifiedSessionViewer';
import { parseSession, detectSessionFormat, SESSION_TYPES } from '../../utils/sessionParser';
import { authenticatedFetch } from '../../utils/auth';

export default function SessionPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const endpointUrl = process.env.NEXT_PUBLIC_ENDPOINT_URL || process.env.ENDPOINT_URL;
        if (!endpointUrl) {
          throw new Error('ENDPOINT_URL environment variable is not set');
        }

        const response = await authenticatedFetch(`${endpointUrl}/sessions/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`);
        }
        
        const responseText = await response.text();
        
        // Parse the response to check if it's in the new wrapped format
        let sessionData;
        try {
          const parsedResponse = JSON.parse(responseText);
          
          // Check if response has the new format with data property
          if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.data) {
            // Extract the actual session data from the data property
            sessionData = JSON.stringify(parsedResponse.data);
          } else {
            // Use the response as-is for backward compatibility
            sessionData = responseText;
          }
        } catch (parseError) {
          // If JSON parsing fails, treat as raw text (backward compatibility)
          sessionData = responseText;
        }
        
        // Use unified parser to detect format and normalize data
        const normalizedSession = parseSession(sessionData);
        
        setSession(normalizedSession);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Session</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => router.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-600 mb-4">The requested session could not be found.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const getFormatLabel = (sessionType) => {
    switch (sessionType) {
      case SESSION_TYPES.Q_CHAT:
        return 'Q Chat JSON';
      case SESSION_TYPES.CLAUDE_CODE:
        return 'Claude Code JSONL';
      case SESSION_TYPES.CURSOR:
        return 'Cursor Format';
      case SESSION_TYPES.GEMINI_CLI:
        return 'Gemini CLI Format';
      default:
        return 'Unknown Format';
    }
  };

  const getFormatColor = (sessionType) => {
    switch (sessionType) {
      case SESSION_TYPES.Q_CHAT:
        return 'bg-blue-100 text-blue-800';
      case SESSION_TYPES.CLAUDE_CODE:
        return 'bg-purple-100 text-purple-800';
      case SESSION_TYPES.CURSOR:
        return 'bg-green-100 text-green-800';
      case SESSION_TYPES.GEMINI_CLI:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Head>
        <title>Session {session.id} - SessionBase</title>
        <meta name="description" content={`View session ${session.id} on SessionBase.`} />
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
                {authLoading ? (
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

        {/* Unified Session Viewer */}
        <UnifiedSessionViewer session={session} />
      </div>
    </>
  );
}
