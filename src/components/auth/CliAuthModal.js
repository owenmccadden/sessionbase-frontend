import { useState, useEffect } from 'react';
import { getAuthToken } from '../../utils/auth';

export default function CliAuthModal({ isOpen, onClose, user }) {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (isOpen) {
      const authToken = getAuthToken();
      setToken(authToken || '');
    }
  }, [isOpen]);

  const handleCopyToken = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy token:', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = token;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none backdrop-blur">
      <div className="pointer-events-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              CLI Authentication Success!
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success message */}
          <div className="text-center mb-6">
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
            <p className="text-gray-600">
              Welcome {user?.username}! Your CLI authentication is complete.
            </p>
          </div>

          {/* Auth Token Section */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4 text-center">
              Your Authentication Token
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-3 text-center">
                  Copy this token for CLI usage:
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={token}
                    readOnly
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg bg-white text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  />
                  <button
                    onClick={handleCopyToken}
                    className={`w-full px-6 py-4 text-lg font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 ${
                      copied
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300'
                    }`}
                  >
                    {copied ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Token Copied Successfully!
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Authentication Token
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}