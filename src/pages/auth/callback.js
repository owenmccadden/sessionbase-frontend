import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { setAuthToken, getUserInfo } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL parameters
        const { token } = router.query;
        
        if (!token) {
          setError('No authentication token received');
          setStatus('error');
          return;
        }

        // Store the token
        setAuthToken(token);
        
        // Get user info from token
        const userInfo = getUserInfo();
        if (!userInfo) {
          setError('Invalid token received');
          setStatus('error');
          return;
        }

        // Update auth context
        login(userInfo);
        
        setStatus('success');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
        
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        setStatus('error');
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, login]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing sign in...
          </h2>
          <p className="text-gray-600">
            Please wait while we authenticate you with GitHub.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="rounded-full bg-red-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="rounded-full bg-green-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Successfully signed in!
          </h2>
          <p className="text-gray-600">
            Redirecting you to the home page...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
