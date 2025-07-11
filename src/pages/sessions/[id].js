import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UnifiedSessionViewer from '../../components/UnifiedSessionViewer';
import { parseSession, detectSessionFormat, SESSION_TYPES } from '../../utils/sessionParser';
import { authenticatedFetch } from '../../utils/auth';

export default function SessionPage() {
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
    <div className="min-h-screen bg-gray-50">
      {/* Format Indicator */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-blue-700">Detected Format:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getFormatColor(session.type)}`}>
              {getFormatLabel(session.type)}
            </span>
          </div>
          <div className="text-xs text-blue-600">
            Session ID: {session.id}
          </div>
        </div>
      </div>

      {/* Unified Session Viewer */}
      <UnifiedSessionViewer session={session} />
    </div>
  );
}
