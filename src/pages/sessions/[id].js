import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SessionViewer from '../../components/SessionViewer';

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

        const response = await fetch(`${endpointUrl}/sessions/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`);
        }
        
        const sessionData = await response.json();
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
          <button
            onClick={() => router.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-600">The requested session could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionViewer session={session} />
    </div>
  );
}
