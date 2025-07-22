import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
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
          if (response.status === 404) {
            // Session not found - this is expected for private sessions the user can't access
            setSession(null);
            return;
          }
          throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`);
        }
        
        const responseText = await response.text();
        
        // Parse the response to check if it's in the new wrapped format
        let sessionData;
        let sessionMetadata = null;
        try {
          const parsedResponse = JSON.parse(responseText);
          
          // Check if response has the new format with data property
          if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.data) {
            // Extract the actual session data from the data property (keep it as string, not re-stringify)
            sessionData = parsedResponse.data;
            // Extract metadata if available
            sessionMetadata = parsedResponse.metadata;
          } else {
            // Use the response as-is for backward compatibility
            sessionData = responseText;
          }
        } catch (parseError) {
          // If JSON parsing fails, treat as raw text (backward compatibility)
          sessionData = responseText;
        }
        
        // Handle potentially nested data structure
        // Some sessions might be stored with their own wrapper format
        let parsedSessionData = sessionData;
        if (typeof sessionData === 'string' && sessionData.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(sessionData);
            // Check if this is a nested structure with its own "data" property
            if (parsed && typeof parsed === 'object' && parsed.data) {
              parsedSessionData = parsed.data;
            } else {
              parsedSessionData = parsed;
            }
          } catch (parseError) {
            // If parsing fails, keep as string (might be JSONL)
            console.warn('Failed to parse session data as JSON, keeping as string:', parseError);
            parsedSessionData = sessionData;
          }
        }
        
        // Use unified parser to detect format and normalize data
        const normalizedSession = parseSession(parsedSessionData);
        
        // Add metadata to the normalized session if we have it
        if (sessionMetadata) {
          normalizedSession.metadata = { ...normalizedSession.metadata, ...sessionMetadata };
          // Add author info for easier access
          if (sessionMetadata.username || sessionMetadata.avatarUrl) {
            normalizedSession.author = {
              username: sessionMetadata.username,
              avatarUrl: sessionMetadata.avatarUrl,
              userId: sessionMetadata.userId
            };
          }
        }
        
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
      <>
        <Head>
          <title>Session Not Found - SessionBase</title>
          <meta name="description" content="The requested session could not be found." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
              <p className="text-gray-600 mb-4">
                The session you're looking for doesn't exist or isn't available.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
                >
                  Go Home
                </button>
                <button
                  onClick={() => router.push('/discover')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Discover Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
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
        <Header />

        {/* Unified Session Viewer */}
        <UnifiedSessionViewer 
          session={session} 
          onSessionUpdate={setSession}
          sessionId={id}
        />
      </div>
    </>
  );
}

// This tells Next.js this is a dynamic page that should be rendered on each request
export async function getServerSideProps() {
  return {
    props: {}, // Will be passed to the page component as props
  }
}
