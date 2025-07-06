import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createSession } from '../../utils/auth';

export default function CreateSession({ onSessionCreated }) {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!data.trim()) {
      setError('Please enter some data');
      return;
    }

    if (isPrivate && !isAuthenticated) {
      setError('You must be signed in to create private sessions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await createSession(data, isPrivate);
      setData('');
      setIsPrivate(false);
      
      if (onSessionCreated) {
        onSessionCreated(session);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Create New Session
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
            Session Data
          </label>
          <textarea
            id="data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Enter your session data (JSON, text, etc.)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            required
          />
        </div>

        {isAuthenticated && (
          <div className="flex items-center">
            <input
              id="isPrivate"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
              Make this session private (only you can access it)
            </label>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-700">
              Sign in with GitHub to create private sessions and manage your data.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Session'
          )}
        </button>
      </form>
    </div>
  );
}
