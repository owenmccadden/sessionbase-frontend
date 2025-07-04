import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SessionViewer from '../../components/SessionViewer';
import JsonlSessionViewer from '../../components/JsonlSessionViewer';
import { parseJsonl } from '../../utils/jsonlParser';

export default function SessionPage() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataFormat, setDataFormat] = useState(null); // 'json' or 'jsonl'

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

        const response = await fetch(`${endpointUrl}/sessions/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        
        // Try to detect the data format
        let sessionData;
        let format;
        
        if (contentType && contentType.includes('application/x-jsonlines')) {
          // Explicitly JSONL content type
          format = 'jsonl';
          sessionData = parseJsonl(responseText);
        } else if (responseText.includes('\n{') && responseText.split('\n').length > 1) {
          // Looks like JSONL (multiple JSON objects separated by newlines)
          try {
            format = 'jsonl';
            sessionData = parseJsonl(responseText);
          } catch (jsonlError) {
            // If JSONL parsing fails, try JSON
            try {
              format = 'json';
              sessionData = JSON.parse(responseText);
            } catch (jsonError) {
              throw new Error('Failed to parse response as either JSON or JSONL');
            }
          }
        } else {
          // Try JSON first
          try {
            format = 'json';
            sessionData = JSON.parse(responseText);
          } catch (jsonError) {
            // If JSON fails, try JSONL
            try {
              format = 'jsonl';
              sessionData = parseJsonl(responseText);
            } catch (jsonlError) {
              throw new Error('Failed to parse response as either JSON or JSONL');
            }
          }
        }
        
        setDataFormat(format);
        setSession(sessionData);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Data Format Indicator */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-blue-700">Data Format:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              dataFormat === 'jsonl' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {dataFormat === 'jsonl' ? 'JSONL (JSON Lines)' : 'JSON'}
            </span>
          </div>
          <div className="text-xs text-blue-600">
            Session ID: {session.sessionId || id}
          </div>
        </div>
      </div>

      {/* Render appropriate viewer based on data format */}
      {dataFormat === 'jsonl' ? (
        <JsonlSessionViewer session={session} />
      ) : (
        <SessionViewer session={session} />
      )}
    </div>
  );
}
